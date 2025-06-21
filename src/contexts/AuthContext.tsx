import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to detect Safari
function isSafari() {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua);
}

// Helper function to detect iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function loginWithGoogle() {
    try {
      // Use signInWithRedirect for Safari/iOS since we're hosted on firebaseapp.com
      // This avoids popup blocking issues on Safari
      if (isSafari() || isIOS()) {
        console.log('Using redirect for Safari/iOS');
        await signInWithRedirect(auth, googleProvider);
        return; // signInWithRedirect doesn't return a result immediately
      } else {
        // Use popup for other browsers
        console.log('Using popup for non-Safari browsers');
        const result = await signInWithPopup(auth, googleProvider);
        return result;
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Handle redirect result for Safari/iOS redirect flow
    // This runs when the page loads after a redirect
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log('Redirect auth successful:', result.user);
        // User is already set via onAuthStateChanged, but we can log success
      }
    }).catch((error) => {
      console.error('Redirect result error:', error);
      // Set loading to false even if redirect fails
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loginWithGoogle,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 