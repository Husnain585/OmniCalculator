import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import admin from '@/lib/firebase-admin';

async function verifyAdmin(idToken: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken.admin === true;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return false;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const idToken = headers().get('X-ID-Token');

  if (!idToken) {
    redirect('/login');
  }

  const isAdmin = await verifyAdmin(idToken);

  if (!isAdmin) {
    redirect('/');
  }

  return <>{children}</>;
}
