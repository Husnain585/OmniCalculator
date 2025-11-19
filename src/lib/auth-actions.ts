'use server';

import admin from '@/lib/firebase-admin';

/**
 * Securely checks if any user in Firebase Authentication has an admin custom claim.
 * This is the definitive source of truth for the existence of an admin.
 * @returns {Promise<boolean>} True if an admin exists, false otherwise.
 */
export async function hasAdminUser(): Promise<boolean> {
  try {
    // We only need to find one user with the claim, so we can limit the results.
    const listUsersResult = await admin.auth().listUsers(1000);
    const hasAdmin = listUsersResult.users.some(user => user.customClaims?.admin === true);
    return hasAdmin;
  } catch (error) {
    console.error('Error checking for admin user:', error);
    // To be safe, if we can't check, we should prevent creating a new admin.
    // This prevents a race condition where two users could try to become admin at once.
    return true;
  }
}
