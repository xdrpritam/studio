'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';

/** 
 * Initiate anonymous sign-in (non-blocking). 
 * Returns a promise but the caller should typically not await it for UI blocking.
 */
export function initiateAnonymousSignIn(authInstance: Auth): Promise<UserCredential> {
  return signInAnonymously(authInstance);
}

/** 
 * Initiate email/password sign-up (non-blocking). 
 * Returns a promise to allow the caller to handle specific auth errors.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** 
 * Initiate email/password sign-in (non-blocking). 
 * Returns a promise to allow the caller to handle specific auth errors.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  return signInWithEmailAndPassword(authInstance, email, password);
}
