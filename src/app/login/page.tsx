'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const {
    signInWithGoogle,
    user,
    loading: authLoading,
    redirectInProgress,
    resetAuthState,
  } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    // Don't start a new sign-in if one is already in progress
    if (redirectInProgress) {
      console.log('Redirect already in progress, showing loading state');
      return;
    }

    setLocalLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      // Don't push to router here - let the redirect handle it
      // The AuthContext will handle the redirect result
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
      setLocalLoading(false);
    }
  };

  // Handle successful authentication
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/planner');
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Login Card */}
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to Superhuman Nutrition
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Sign in to access your personalized AI meal planner
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={localLoading || redirectInProgress || authLoading}
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 py-3 text-base font-medium shadow-sm"
            >
              {localLoading || redirectInProgress ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            {/* Reset Authentication Button */}
            <Button
              onClick={resetAuthState}
              variant="outline"
              className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Reset Authentication State
            </Button>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Terms and Privacy */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <span className="text-gray-900 font-medium">
              Sign in with Google to get started instantly
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
