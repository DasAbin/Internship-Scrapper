import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

function getFirebaseApp(): FirebaseApp {
  if (typeof window === "undefined") {
    throw new Error("Firebase can only be initialized in the browser");
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const authInstance = getFirebaseAuth();
  const result = await signInWithPopup(authInstance, googleProvider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const authInstance = getFirebaseAuth();
  const result = await signInWithEmailAndPassword(authInstance, email, password);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string) {
  const authInstance = getFirebaseAuth();
  const result = await createUserWithEmailAndPassword(authInstance, email, password);
  return result.user;
}

export async function signOut() {
  const authInstance = getFirebaseAuth();
  await firebaseSignOut(authInstance);
}

export async function getIdToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const authInstance = getFirebaseAuth();
    const user = authInstance.currentUser;
    if (!user) return null;
    return user.getIdToken();
  } catch {
    return null;
  }
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  try {
    const authInstance = getFirebaseAuth();
    return onAuthStateChanged(authInstance, callback);
  } catch {
    callback(null);
    return () => {};
  }
}

export { type User };
