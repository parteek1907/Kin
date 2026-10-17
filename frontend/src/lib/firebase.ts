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

// Kin Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFYcMQ2AniVLsNxEFfG5NgvpOoQUynK58",
  authDomain: "akin-1024c.firebaseapp.com",
  projectId: "akin-1024c",
  storageBucket: "akin-1024c.firebasestorage.app",
  messagingSenderId: "288142308477",
  appId: "1:288142308477:web:1b2458517e0a38bf89ed14",
  measurementId: "G-2E01HB5L75"
};

// Initialize Firebase (Next.js SSR safe singleton)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
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
