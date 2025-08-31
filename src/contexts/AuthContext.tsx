'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signOut,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  redirectInProgress: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    // This flag helps prevent redirect loops
    let isRedirectHandled = false;

    // Add a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log(
          '[AuthContext] Loading timeout reached, forcing loading to false'
        );
        setLoading(false);
        setRedirectInProgress(false);
      }
    }, 10000); // 10 second timeout

    if (!auth) {
      console.log(
        '[AuthContext] Auth not initialized, skipping auth state listener'
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
      clearTimeout(loadingTimeout);
    });

    // Handle redirect result immediately when component mounts
    const handleRedirectResult = async () => {
      if (isRedirectHandled) return;
      isRedirectHandled = true;

      try {
        if (!auth) {
          console.log(
            '[AuthContext] Auth not initialized, skipping redirect result'
          );
          return;
        }

        console.log('[AuthContext] Handling redirect result...');
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log('[AuthContext] Redirect result successful:', result.user);
          setUser(result.user);
        } else {
          console.log('[AuthContext] No redirect result or user.');
        }
      } catch (error) {
        console.error('[AuthContext] Redirect result error:', error);
        // Fallback: try to get current user from auth
        if (auth && auth.currentUser) {
          console.log(
            '[AuthContext] Fallback: using auth.currentUser:',
            auth.currentUser
          );
          setUser(auth.currentUser);
        } else {
          console.log('[AuthContext] Fallback: no currentUser found.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Call this immediately
    handleRedirectResult();

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    // Check if auth is initialized
    if (!auth || !googleProvider) {
      console.log('[AuthContext] Auth or Google provider not initialized');
      throw new Error('Authentication not available');
    }

    // Prevent multiple redirects
    if (redirectInProgress) {
      console.log(
        'Redirect already in progress, ignoring additional sign-in attempt'
      );
      return;
    }

    try {
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

      // Use popup for local development, mobile devices, and local network
      if (isLocalNetwork || isMobile) {
        console.log(
          '[AuthContext] Starting Google sign-in popup (local network or mobile)'
        );
        setRedirectInProgress(true);
        const result = await import('firebase/auth').then(mod =>
          mod.signInWithPopup(auth!, googleProvider!)
        );
        setUser(result.user);
        setRedirectInProgress(false);
      } else {
        console.log(
          '[AuthContext] Starting Google sign-in redirect (production)'
        );
        setRedirectInProgress(true);
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (error: unknown) {
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
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    redirectInProgress,
    signInWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
