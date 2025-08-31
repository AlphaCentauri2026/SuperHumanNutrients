import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Only initialize Firebase if we're in the browser or if environment variables are available
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

// Check if we're in a build environment or if Firebase is properly configured
const shouldInitializeFirebase =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (shouldInitializeFirebase) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase services only if app is available
if (app) {
  db = getFirestore(app);

  // Only initialize auth on client side
  if (typeof window !== 'undefined') {
    auth = getAuth(app);
    auth.useDeviceLanguage();
    googleProvider = new GoogleAuthProvider();

    // Configure Google Auth Provider with minimal scopes
    googleProvider.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline',
      // Prevent additional scope requests that might trigger privacy/terms
      include_granted_scopes: 'false',
      // Ensure we only get basic profile info
      scope:
        'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    });

    // Remove any additional scopes that might be added by default
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
    googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
  }
}

export { auth, db, googleProvider };

export default app;
