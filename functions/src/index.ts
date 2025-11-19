
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
    // If the request is to create an admin, perform checks first.
    if (role === 'admin') {
      // Check if any other user already has an admin claim.
      const listUsersResult = await admin.auth().listUsers(1000);
      const hasExistingAdmin = listUsersResult.users.some(user => user.customClaims?.admin === true);
      
      if (hasExistingAdmin) {
         throw new functions.https.HttpsError(
          'permission-denied',
          'An admin user already exists. Cannot create another.'
        );
      }
    }
    
    userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    // If an admin was requested, set the custom claim for the new user.
    if (role === 'admin') {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    }

    // Create user document in Firestore regardless of role.
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      email: userRecord.email,
      fullName: userRecord.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  } catch (error: any) {
     // If the user was already partially created, clean up.
    if (userRecord) {
      await admin.auth().deleteUser(userRecord.uid).catch(e => console.error("Cleanup failed for user", userRecord.uid, e));
    }
    
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError(
        'already-exists',
        'This email address is already in use by another account.'
      );
    }
     if (error instanceof functions.https.HttpsError) {
        throw error; // Re-throw HttpsError exceptions directly
    }
    console.error('Error creating Firebase Auth user:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to create user account.'
    );
  }
  
  return { uid: userRecord.uid };
});
