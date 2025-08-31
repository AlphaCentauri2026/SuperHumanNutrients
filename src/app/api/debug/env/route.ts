import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      ? 'Set'
      : 'Not Set',
    firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      ? 'Set'
      : 'Not Set',
    firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? 'Set'
      : 'Not Set',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
}
