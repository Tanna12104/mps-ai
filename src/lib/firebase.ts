import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Official Configuration for target Project: crested-girder-0f6jr
export const firebaseConfig = {
  apiKey: "AIzaSyDtscpmvEBqneFhsvm3VbfBde68WgHvkKg",
  authDomain: "crested-girder-0f6jr.firebaseapp.com",
  projectId: "crested-girder-0f6jr",
  storageBucket: "crested-girder-0f6jr.firebasestorage.app",
  messagingSenderId: "511984628785",
  appId: "1:511984628785:web:9cc15f69d08feb1d6a9110",
};

// Prevent duplicate initialization: singleton app instance
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

// Google Auth Provider configured for clean popup account selection
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation Types for error handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system_settings', 'connection_probe'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline, using resilient network fallback.');
      return false;
    }
    return true;
  }
}
testFirestoreConnection();

// Sign In with Google Popup
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    await syncUserProfile(user);
    return user;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    const errorCode = err?.code || 'auth/unknown';
    const errorMessage = err?.message || String(error);
    throw {
      code: errorCode,
      message: errorMessage,
      isDomainError:
        errorCode === 'auth/unauthorized-domain' ||
        errorMessage.includes('_validateOrigin') ||
        errorMessage.includes('origin') ||
        errorMessage.includes('internal-error'),
    };
  }
}

// Sign Out
export async function logoutUser() {
  return await fbSignOut(auth);
}

// Sync User Profile in Firestore
export async function syncUserProfile(fbUser: FirebaseUser) {
  const userRef = doc(db, 'users', fbUser.uid);
  const path = `users/${fbUser.uid}`;
  const isAdminUser = fbUser.email === 'gut6762@gmail.com';

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Intelligence Member',
        email: fbUser.email || '',
        photoURL:
          fbUser.photoURL ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: isAdminUser ? 'admin' : 'user',
        membership: isAdminUser ? 'enterprise' : 'pro',
        tokensRemaining: 1000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await updateDoc(userRef, {
        displayName: fbUser.displayName || snap.data().displayName,
        photoURL: fbUser.photoURL || snap.data().photoURL,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Verify Admin Status via Backend
export async function verifyServerAdminRole(email?: string | null): Promise<boolean> {
  if (!email) return false;
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return Boolean(data.authorized);
  } catch {
    return false;
  }
}

// Check Admin Status locally or from session role
export function isUserAdmin(email?: string | null, role?: string | null): boolean {
  if (role === 'admin') return true;
  // If email matches session admin role
  if (email && email === 'gut6762@gmail.com') return true;
  return false;
}
