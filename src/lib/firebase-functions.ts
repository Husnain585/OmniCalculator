
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db } from './firebase-admin';

// Initialize admin only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * A callable Cloud Function to create a new Firebase user.
 * This handles both standard user creation and the initial admin user creation.
 */
export const createFirebaseUser = functions.https.onCall(async (data, context) => {
  const { email, password, fullName, setAdmin } = data;

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

  // Create user document in Firestore
  try {
    const userRef = db.collection('users').doc(userRecord.uid);
    await userRef.set({
      email: userRecord.email,
      fullName: userRecord.displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (firestoreError) {
    // If Firestore write fails, delete the created auth user to avoid inconsistency
    await admin.auth().deleteUser(userRecord.uid);
    console.error('Error creating user document in Firestore:', firestoreError);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to save user data.'
    );
  }


  if (setAdmin === true) {
    const listUsersResult = await admin.auth().listUsers();
    // Check if any other user is an admin
    const hasExistingAdmin = listUsersResult.users.some(user => user.uid !== userRecord.uid && user.customClaims?.admin === true);

    if (hasExistingAdmin) {
       await admin.auth().deleteUser(userRecord.uid);
       // Also delete the firestore doc
       await db.collection('users').doc(userRecord.uid).delete();
       throw new functions.https.HttpsError(
        'permission-denied',
        'An admin user already exists. Cannot create another.'
      );
    }
    
    try {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    } catch (error) {
      await admin.auth().deleteUser(userRecord.uid);
      await db.collection('users').doc(userRecord.uid).delete();
      console.error('Error setting custom claims:', error);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while setting the admin claim.'
      );
    }
  }
  
  return { uid: userRecord.uid };
});
