import { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import admin from '@/lib/firebase-admin';
import Link from 'next/link';
import { Users, Settings, Calculator } from 'lucide-react';

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

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Calculator className="h-6 w-6 text-primary" />
              <span className="">OmniCalc Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Users
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile Nav can be added here */}
          <div className="w-full flex-1">
            {/* Can be used for search or breadcrumbs */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
