"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function deleteCookie(name: string) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        const token = await user.getIdToken();
        setCookie('idToken', token, 1);
        
        // Centralized redirect logic
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh
        if (idTokenResult.claims.admin === true) {
            if (window.location.pathname.startsWith('/admin')) {
                // Already on an admin page, no need to redirect
            } else {
                router.push('/admin');
            }
        } else {
             if (window.location.pathname.startsWith('/admin')) {
                // Non-admin trying to access admin page, redirect to home
                router.push('/');
             }
        }

      } else {
        deleteCookie('idToken');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
