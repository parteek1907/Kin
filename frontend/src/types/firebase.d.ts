declare module 'firebase/app' {
  export interface FirebaseApp {
    name: string;
    options: Record<string, any>;
  }
  export function initializeApp(config: Record<string, any>): FirebaseApp;
  export function getApps(): FirebaseApp[];
  export function getApp(): FirebaseApp;
}

declare module 'firebase/auth' {
  export interface FirebaseUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }
  export interface UserCredential {
    user: FirebaseUser;
  }
  export interface Auth {
    currentUser: FirebaseUser | null;
  }
  export class GoogleAuthProvider {
    constructor();
  }
  export function getAuth(app?: any): Auth;
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
  export function signInWithPopup(auth: Auth, provider: any): Promise<UserCredential>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, nextOrObserver: (user: FirebaseUser | null) => void): () => void;
  export function updateProfile(user: any, profile: Record<string, any>): Promise<void>;
  export type User = FirebaseUser;
}

declare module 'firebase/analytics' {
  export interface Analytics {
    app: any;
  }
  export function getAnalytics(app?: any): Analytics;
  export function isSupported(): Promise<boolean>;
}
