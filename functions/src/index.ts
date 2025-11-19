
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * A callable Cloud Function to create a new Firebase user.
 * This handles both standard user creation and the initial admin user creation.
 */
export const createFirebaseUser = functions.https.onCall(async (data, context) => {
  const { email, password, fullName, role } = data;

  if (!email || !password || !fullName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email, password, and full name are required.'
    );
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError(
        'already-exists',
        'This email address is already in use by another account.'
      );
    }
    console.error('Error creating Firebase Auth user:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user account.'
    );
  }

  // If the request is to create an admin, perform checks.
  if (role === 'admin') {
    // Check if any other user already has an admin claim.
    const listUsersResult = await admin.auth().listUsers(1000);
    const hasExistingAdmin = listUsersResult.users.some(user => user.uid !== userRecord.uid && user.customClaims?.admin === true);
    
    if (hasExistingAdmin) {
       // If an admin already exists, we must not proceed.
       // Delete the newly created user to prevent orphaned accounts.
       await admin.auth().deleteUser(userRecord.uid);
       throw new functions.https.HttpsError(
        'permission-denied',
        'An admin user already exists. Cannot create another.'
      );
    }
    
    // If no other admin exists, set the custom claim for the new user.
    try {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    } catch (error) {
      // If setting the claim fails, delete the user and Firestore doc to clean up.
      await admin.auth().deleteUser(userRecord.uid);
      console.error('Error setting custom claims:', error);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while setting the admin role.'
      );
    }
  }

  // Create user document in Firestore regardless of role.
  try {
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      email: userRecord.email,
      fullName: userRecord.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (firestoreError) {
    // If Firestore write fails, delete the created auth user to avoid inconsistency.
    await admin.auth().deleteUser(userRecord.uid);
    console.error('Error creating user document in Firestore:', firestoreError);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to save user data.'
    );
  }
  
  return { uid: userRecord.uid };
});
