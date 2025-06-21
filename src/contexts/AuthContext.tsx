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

// Helper function to detect mobile Safari/iOS
function isMobileSafari() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || 
         (/Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua) && /Mobile/.test(ua));
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
      console.log('=== STARTING GOOGLE LOGIN ===');
      
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isProduction = window.location.hostname.includes('firebaseapp.com') || window.location.hostname.includes('web.app');
      
      console.log('Environment check:');
      console.log('- Is localhost:', isLocalhost);
      console.log('- Is production:', isProduction);
      console.log('- Hostname:', window.location.hostname);
      console.log('- Auth domain:', auth.app.options.authDomain);
      
      if (isLocalhost) {
        // Use popup for localhost development
        console.log('Using POPUP for localhost development');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Popup auth successful:', result.user?.email);
        return result;
      } else if (isProduction && (isMobileSafari() || isIOS())) {
        // Use redirect for mobile Safari/iOS in production
        console.log('Using REDIRECT for mobile Safari/iOS in production');
        await signInWithRedirect(auth, googleProvider);
        console.log('Redirect initiated for mobile Safari/iOS');
        return;
      } else {
        // Use popup for other cases
        console.log('Using POPUP for desktop browsers');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Popup auth successful:', result.user?.email);
        return result;
      }
    } catch (error: any) {
      console.error('=== GOOGLE LOGIN ERROR ===');
      console.error('Google login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    console.log('AuthProvider useEffect: Starting auth setup');
    console.log('Current URL on load:', window.location.href);
    console.log('URL search params:', window.location.search);
    console.log('URL hash:', window.location.hash);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.email || 'null');
      if (user) {
        console.log('User details:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      }
      setCurrentUser(user);
      setLoading(false);
    });

    // Handle redirect result for Safari/iOS redirect flow
    // This runs when the page loads after a redirect
    console.log('Checking for redirect result...');
    console.log('Auth instance:', auth);
    console.log('Auth app:', auth.app.name);
    
    getRedirectResult(auth).then((result) => {
      console.log('getRedirectResult completed');
      if (result) {
        console.log('Redirect auth successful!');
        console.log('User:', result.user?.email);
        console.log('Provider:', result.providerId);
        console.log('Full result:', result);
        // User is already set via onAuthStateChanged, but we can log success
      } else {
        console.log('No redirect result found (this is normal for non-redirect flows)');
      }
    }).catch((error) => {
      console.error('getRedirectResult error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      // Don't set loading to false here, let onAuthStateChanged handle it
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