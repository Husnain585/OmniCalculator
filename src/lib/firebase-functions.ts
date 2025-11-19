import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize admin only once
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * A callable Cloud Function to create a new Firebase user.
 * This handles both standard user creation and the initial admin user creation.
 */
export const createFirebaseUser = functions.https.onCall(async (data, context) => {
  const { email, password, setAdmin } = data;

  if (!email || !password) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email and password are required.'
    );
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email,
      password,
    });
  } catch (error: any) {
    // Handle specific auth errors, like email-already-exists
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError(
        'already-exists',
        'This email address is already in use by another account.'
      );
    }
    // Handle other potential user creation errors
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create user account.'
    );
  }

  // If the `setAdmin` flag is true, attempt to make the new user an admin.
  if (setAdmin === true) {
    // Check if any admin user already exists.
    const listUsersResult = await admin.auth().listUsers();
    const hasAdmin = listUsersResult.users.some(user => user.customClaims?.admin === true);

    // If an admin already exists, throw an error.
    // We check this on the server-side as a security measure, even if the client checks it too.
    if (hasAdmin) {
       // We should also delete the user we just created to avoid leaving an orphaned account
       await admin.auth().deleteUser(userRecord.uid);
       throw new functions.https.HttpsError(
        'permission-denied',
        'An admin user already exists. Cannot create another.'
      );
    }
    
    // If no admin exists, set the custom claim for the newly created user.
    try {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    } catch (error) {
      // If setting claims fails, delete the user to prevent an inconsistent state
      await admin.auth().deleteUser(userRecord.uid);
      console.error('Error setting custom claims:', error);
      throw new functions.https.HttpsError(
        'internal',
        'An error occurred while setting the admin claim.'
      );
    }
  }
  
  return { uid: userRecord.uid };
});

/**
 * @deprecated This function is no longer needed as the logic is now part of createFirebaseUser.
 * Kept for reference or if other claim-setting logic is needed in the future by an admin.
 */
export const setAdminClaim = functions.https.onCall(async (data, context) => {
  // The caller must be an admin to use this function.
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only an admin can assign roles.'
    );
  }

  const uid = data.uid;
  if (typeof uid !== 'string' || uid.length === 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called with a valid "uid" argument.'
    );
  }
  
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    return { result: `Success! User ${uid} has been made an admin.` };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while setting the admin claim.'
    );
  }
});
