import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { ADMIN_EMAIL } from '../data/defaults';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function verifyIsAdmin(user: User | null): Promise<boolean> {
  if (!user || !user.emailVerified) return false;
  if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return true;
  try {
    const snap = await getDoc(doc(db, 'admins', user.uid));
    return snap.exists() && snap.data()?.role === 'admin';
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const adminOk = await verifyIsAdmin(nextUser);
        setIsAdmin(adminOk);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const adminOk = await verifyIsAdmin(cred.user);
      setIsAdmin(adminOk);
      if (!adminOk) {
        setAuthError(
          `Signed in as ${cred.user.email || 'unknown user'}, which does not have administrator access. Only authorised institute administrators may enter the console.`
        );
        return false;
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed.';
      setAuthError(message);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setIsAdmin(false);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, authError, signInWithGoogle, logout, clearAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
