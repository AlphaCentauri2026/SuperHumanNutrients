'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  redirectInProgress: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export AuthContext for testing
export { AuthContext };

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.log(
        '[AuthContext] Auth not initialized, setting loading to false'
      );
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log(
        '[AuthContext] Auth state changed:',
        user ? 'User logged in' : 'No user'
      );
      setUser(user);
      setLoading(false);
      setRedirectInProgress(false);
    });

    // Handle redirect result
    const handleRedirectResult = async () => {
      try {
        if (!auth) return;

        console.log('[AuthContext] Handling redirect result...');
        const { getRedirectResult } = await import('firebase/auth');
        const result = await getRedirectResult(auth);

        if (result && result.user) {
          console.log('[AuthContext] Redirect result successful:', result.user);
          setUser(result.user);
        }
      } catch (error) {
        console.error('[AuthContext] Redirect result error:', error);
        // Fallback to current user if available
        if (auth && auth.currentUser) {
          setUser(auth.currentUser);
        }
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      throw new Error('Authentication not available');
    }

    if (redirectInProgress || loading) {
      console.log('Sign-in already in progress');
      return;
    }

    try {
      setRedirectInProgress(true);
      console.log('[AuthContext] Starting Google sign-in');

      // Check if we're in a mobile browser or on a local network IP
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isLocalNetwork =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname.startsWith('192.168.') ||
          window.location.hostname.startsWith('10.') ||
          window.location.hostname.startsWith('172.'));

      console.log('[AuthContext] Device info:', {
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        isMobile,
        isLocalNetwork,
      });

      // Try popup first for better UX, fallback to redirect if popup fails
      try {
        console.log('[AuthContext] Attempting Google sign-in with popup');
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, googleProvider);
        setUser(result.user);
        setRedirectInProgress(false);
        console.log('[AuthContext] Popup sign-in successful');
      } catch (popupError) {
        console.log(
          '[AuthContext] Popup failed, falling back to redirect:',
          popupError
        );

        // Fallback to redirect if popup fails (e.g., popup blocked)
        const { signInWithRedirect } = await import('firebase/auth');
        await signInWithRedirect(auth, googleProvider);
        // The redirect will handle the rest, no need to set user here
      }
    } catch (error) {
      console.error('[AuthContext] Sign-in failed:', error);
      setRedirectInProgress(false);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      console.log('[AuthContext] Auth not initialized, cannot logout');
      return;
    }

    try {
      await signOut(auth);
      setUser(null);
      setRedirectInProgress(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Manual reset function to break out of sign-in loops
  const resetAuthState = () => {
    console.log('[AuthContext] Manually resetting auth state');
    setUser(null);
    setLoading(false);
    setRedirectInProgress(false);

    // Clear any stored auth state
    if (typeof window !== 'undefined' && auth) {
      auth.signOut().catch(console.error);
      localStorage.removeItem('firebase:authUser:');
      sessionStorage.clear();
    }
  };

  const value = {
    user,
    loading,
    redirectInProgress,
    signInWithGoogle,
    logout,
    resetAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
