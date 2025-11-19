import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AppContent } from '@/components/layout/app-content';
import { AuthProvider } from '@/hooks/use-auth';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'OmniCalc',
  description: 'A comprehensive collection of calculators for every need.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-body antialiased', inter.variable)}>
        <Suspense>
          <AuthProvider>
            <AppContent>{children}</AppContent>
          </AuthProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
