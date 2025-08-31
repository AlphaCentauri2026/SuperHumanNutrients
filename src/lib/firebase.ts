import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Only initialize Firebase if we're in the browser or if environment variables are available
let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (
  typeof window !== 'undefined' ||
  (process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN)
) {
  const firebaseConfig = {
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
      'AIzaSyD6Ru6-S4IJShURCOOG5rF5bJlbuAPVKj4',
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      'superhuman-nutrition-c5176.firebaseapp.com',
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      'superhuman-nutrition-c5176',
    storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'superhuman-nutrition-c5176'}.firebasestorage.app`,
    messagingSenderId: '629111717812',
    appId: '1:629111717812:web:b8e5c32722c6f4431abce1',
    measurementId: 'G-DCKKCKT71N',
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase services only if app is available
if (app) {
  auth = getAuth(app);
  auth.useDeviceLanguage();

  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();

  // Configure Google Auth Provider
  googleProvider.setCustomParameters({
    prompt: 'select_account',
    // Ensure we're using the correct OAuth flow
    access_type: 'offline',
  });
}

export { auth, db, googleProvider };

export default app;
