'use server';

import admin from '@/lib/firebase-admin';

/**
 * Securely checks if any user in Firebase Authentication has an admin custom claim.
 * @returns {Promise<boolean>} True if an admin exists, false otherwise.
 */
export async function hasAdminUser(): Promise<boolean> {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const hasAdmin = listUsersResult.users.some(user => user.customClaims?.admin === true);
    return hasAdmin;
  } catch (error) {
    console.error('Error checking for admin user:', error);
    // To be safe, if we can't check, we should prevent creating a new admin.
    return true;
  }
}
