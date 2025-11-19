
'use server';

import { revalidatePath } from 'next/cache';
import { adminAuth, db } from '@/lib/firebase-admin';

export async function updateUserProfile(uid: string, fullName: string) {
  if (!uid || !fullName) {
    throw new Error('User ID and full name are required.');
  }

  try {
    // Update Firebase Authentication profile
    await adminAuth.updateUser(uid, {
      displayName: fullName,
    });

    // Update Firestore user document
    const userRef = db.collection('users').doc(uid);
    await userRef.set({ fullName: fullName }, { merge: true });

    // Revalidate paths to reflect changes immediately
    revalidatePath('/profile');
    revalidatePath('/profile/edit');

    return { success: true, message: 'Profile updated successfully.' };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
}
