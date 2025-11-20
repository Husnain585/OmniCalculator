'use server';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export const createFirebaseUser = functions.https.onCall(async (data, context) => {
  const { email, password, fullName, role } = data;

  if (!email || !password || !fullName) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email, password, and full name are required.'
    );
  }

  if (role === 'admin') {
    const usersList = await admin.auth().listUsers(1000);
    const adminExists = usersList.users.some(u => u.customClaims?.admin);
    if (adminExists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'An admin user already exists. Cannot create another.'
      );
    }
  }

  let userRecord;
  try {
    userRecord = await admin.auth().createUser({ email, password, displayName: fullName });
    if (role === 'admin') {
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    }

    await db.collection('users').doc(userRecord.uid).set({
      email: userRecord.email,
      fullName: userRecord.displayName,
      isAdmin: role === 'admin' ? true : false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  } catch (error: any) {
    if (userRecord) await admin.auth().deleteUser(userRecord.uid).catch(console.error);

    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Email already in use.');
    }

    throw new functions.https.HttpsError('internal', error.message || 'Failed to create user.');
  }

  return { uid: userRecord.uid };
});
