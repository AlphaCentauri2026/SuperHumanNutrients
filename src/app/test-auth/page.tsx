'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestAuthPage() {
  const { user, loading, signInWithGoogle, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Authentication Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Status:</p>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Loading:</span>{' '}
                {loading ? 'Yes' : 'No'}
              </p>
              <p className="text-sm">
                <span className="font-medium">User:</span>{' '}
                {user ? user.email : 'Not logged in'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Hostname:</span>{' '}
                {typeof window !== 'undefined'
                  ? window.location.hostname
                  : 'Unknown'}
              </p>
              <p className="text-sm">
                <span className="font-medium">User Agent:</span>{' '}
                {typeof window !== 'undefined'
                  ? navigator.userAgent.substring(0, 50) + '...'
                  : 'Unknown'}
              </p>
            </div>
          </div>

          {!user ? (
            <Button
              onClick={signInWithGoogle}
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-green-600 text-center">
                ✅ Successfully signed in as {user.email}
              </p>
              <Button onClick={logout} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 text-center">
            <p>This page helps debug authentication issues.</p>
            <p>Check the console for detailed logs.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
