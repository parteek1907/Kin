import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  Auth,
  User as FirebaseUser
} from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

// Kin Firebase Configuration (Client public configuration with environment overrides)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBFYcMQ2AniVLsNxEFfG5NgvpOoQUynK58",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "akin-1024c.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "akin-1024c",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "akin-1024c.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "288142308477",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:288142308477:web:1b2458517e0a38bf89ed14",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-2E01HB5L75"
};

// Initialize Firebase (Next.js SSR safe singleton with build-time fallback protection)
let appInstance: FirebaseApp;
try {
  appInstance = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch {
  appInstance = initializeApp({
    ...firebaseConfig,
    apiKey: "AIzaSyBFYcMQ2AniVLsNxEFfG5NgvpOoQUynK58"
  }, "kin_fallback");
}

export const app: FirebaseApp = appInstance;

let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (e) {
  try {
    const fallbackApp = initializeApp({
      ...firebaseConfig,
      apiKey: "AIzaSyBFYcMQ2AniVLsNxEFfG5NgvpOoQUynK58"
    }, "kin_auth_fallback");
    authInstance = getAuth(fallbackApp);
  } catch {
    authInstance = {} as Auth;
  }
}

export const auth: Auth = authInstance;
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics conditionally in browser
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported: boolean) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics initialization silent fallback
    });
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  firebaseSignOut,
  firebaseUpdateProfile
};
export type { FirebaseUser };
