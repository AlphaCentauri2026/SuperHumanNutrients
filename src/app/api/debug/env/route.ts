import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      // Firebase Configuration
      firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        ? 'SET'
        : 'NOT_SET',
      firebaseApiKeyLength:
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length || 0,
      firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ? 'SET'
        : 'NOT_SET',
      firebaseAuthDomainValue:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'NOT_SET',
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ? 'SET'
        : 'NOT_SET',
      firebaseProjectIdValue:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT_SET',

      // Alternative Firebase Config (for server-side)
      firebaseApiKeyServer: process.env.FIREBASE_API_KEY ? 'SET' : 'NOT_SET',
      firebaseApiKeyServerLength: process.env.FIREBASE_API_KEY?.length || 0,

      // AI Configuration
      aiApiKey: process.env.AI_API_KEY ? 'SET' : 'NOT_SET',
      aiApiKeyLength: process.env.AI_API_KEY?.length || 0,

      // Environment Info
      nodeEnv: process.env.NODE_ENV || 'NOT_SET',
      vercelEnv: process.env.VERCEL_ENV || 'NOT_SET',
      isServer: typeof window === 'undefined',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables status',
      data: envVars,
      summary: {
        hasFirebaseConfig: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
          process.env.FIREBASE_API_KEY ||
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ),
        hasClientFirebaseConfig: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ),
        hasServerFirebaseConfig: !!(
          process.env.FIREBASE_API_KEY ||
          (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
        ),
      },
    });
  } catch (error) {
    console.error('[debug/env] Error checking environment variables:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
