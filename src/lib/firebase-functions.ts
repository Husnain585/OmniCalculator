import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const setAdminClaim = functions.https.onCall(async (data, context) => {
  // Ensure the user calling the function is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  // Check if any admin user already exists.
  // The first user to register can claim the admin role.
  const listUsersResult = await admin.auth().listUsers();
  const hasAdmin = listUsersResult.users.some(user => user.customClaims?.admin === true);

  // If an admin already exists and the caller is not that admin, deny.
  // (We allow an existing admin to make another user admin if we wanted)
  if (hasAdmin && !context.auth.token.admin) {
     throw new functions.https.HttpsError(
      'permission-denied',
      'An admin user already exists. Cannot create another.'
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
