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

// Helper function to detect any Safari browser
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
      console.log('=== STARTING GOOGLE LOGIN ===');
      
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isProduction = window.location.hostname.includes('firebaseapp.com') || window.location.hostname.includes('web.app');
      const useSafariRedirect = isSafari() || isIOS();
      
      console.log('Environment check:');
      console.log('- Is localhost:', isLocalhost);
      console.log('- Is production:', isProduction);
      console.log('- Use Safari redirect (Safari/iOS):', useSafariRedirect);
      console.log('- Hostname:', window.location.hostname);
      console.log('- Full URL:', window.location.href);
      console.log('- Auth domain:', auth.app.options.authDomain);
      console.log('- User agent:', navigator.userAgent);
      
      // Check Safari privacy settings that might interfere
      console.log('Safari privacy checks:');
      console.log('- Cookies enabled:', navigator.cookieEnabled);
      console.log('- Local storage available:', typeof(Storage) !== "undefined");
      console.log('- Session storage available:', typeof(sessionStorage) !== "undefined");
      
      if (isLocalhost) {
        // Use popup for localhost development
        console.log('Using POPUP for localhost development');
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Popup auth successful:', result.user?.email);
        return result;
      } else if (isProduction && useSafariRedirect) {
        // Use redirect for Safari/iOS in production
        console.log('🚀 Using REDIRECT for Safari/iOS in production');
        console.log('About to call signInWithRedirect...');
        
        // Check if we're already in a redirect flow
        try {
          const pendingResult = await getRedirectResult(auth);
          if (pendingResult) {
            console.log('Found pending redirect result:', pendingResult.user?.email);
            return pendingResult;
          }
        } catch (pendingError: any) {
          console.log('No pending redirect result (normal):', pendingError.message);
        }
        
        console.log('Initiating redirect...');
        await signInWithRedirect(auth, googleProvider);
        console.log('✅ signInWithRedirect call completed - should redirect now');
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
      
      // Check for specific Safari/redirect errors
      if (error.code === 'auth/unauthorized-domain') {
        console.error('❌ DOMAIN NOT AUTHORIZED - Check Firebase Console > Authentication > Settings > Authorized domains');
      } else if (error.code === 'auth/operation-not-allowed') {
        console.error('❌ GOOGLE SIGN-IN NOT ENABLED - Check Firebase Console > Authentication > Sign-in method');
      } else if (error.message?.includes('popup') || error.message?.includes('redirect')) {
        console.error('❌ BROWSER BLOCKING - Safari privacy settings may be blocking the auth flow');
      }
      
      throw error;
    }
  }

  function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect: Starting auth setup');
    console.log('Current URL on load:', window.location.href);
    console.log('URL search params:', window.location.search);
    console.log('URL hash:', window.location.hash);
    
    // Check for specific redirect indicators
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('state') || urlParams.has('code') || urlParams.has('error');
    console.log('Has auth-related URL params:', hasAuthParams);
    
    if (hasAuthParams) {
      console.log('🎯 Looks like we returned from an auth redirect!');
      console.log('URL params:', Object.fromEntries(urlParams.entries()));
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔐 Auth state changed:', user?.email || 'null');
      if (user) {
        console.log('✅ User authenticated:', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          providerId: user.providerData?.[0]?.providerId
        });
      }
      setCurrentUser(user);
      setLoading(false);
    });

    // Handle redirect result for Safari/iOS redirect flow
    console.log('🔍 Checking for redirect result...');
    
    getRedirectResult(auth).then((result) => {
      console.log('📋 getRedirectResult completed');
      if (result) {
        console.log('🎉 Redirect auth successful!');
        console.log('User:', result.user?.email);
        console.log('Provider:', result.providerId);
        console.log('Operation type:', result.operationType || 'unknown');
        // User is already set via onAuthStateChanged, but we can log success
      } else {
        console.log('ℹ️ No redirect result found (this is normal for non-redirect flows)');
      }
    }).catch((error) => {
      console.error('❌ getRedirectResult error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      // Specific error handling for redirect issues
      if (error.code === 'auth/missing-iframe-start') {
        console.error('🚨 Missing iframe start - this suggests the redirect flow was interrupted');
      } else if (error.code === 'auth/network-request-failed') {
        console.error('🌐 Network request failed - check internet connection');
      } else if (error.message?.includes('initial state')) {
        console.error('🔄 Initial state missing - redirect flow may have been corrupted');
      }
      
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