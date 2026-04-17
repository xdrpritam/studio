
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';

/** Initiate anonymous sign-in. Returns a Promise. */
export async function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up. Returns a Promise. */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. Returns a Promise. */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google sign-in. Returns a Promise. */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(authInstance, provider);
}
