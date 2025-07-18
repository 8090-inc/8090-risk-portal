import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
// gcip-iap will be loaded in the browser via script tag
declare const ciap: any;
import { firebaseConfig, TENANT_ID } from '../config/firebase';

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Get auth instance and set tenant
const auth = getAuth(app);
auth.tenantId = TENANT_ID;

// Initialize IAP integration
export const initializeIAP = async () => {
  // IAP initialization will be handled by the authentication page
  console.log('IAP integration will be handled by authentication page');
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    // Sign in with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // The IAP session will be established when the page reloads
    // The gcip-iap module handles the token exchange automatically
    console.log('Firebase sign-in successful');
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found. Please check your email.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Invalid password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email format.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    
    // Clear IAP session by redirecting to IAP logout
    window.location.href = '/_gcp_iap/clear_login_cookie';
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Subscribe to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!auth.currentUser;
};

// Get ID token for API calls
export const getIdToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Failed to get ID token:', error);
    return null;
  }
};