import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(location.pathname === '/reset-password');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { login, loginWithGoogle, resetPassword } = useAuth();

  // Update forgot password state when URL changes
  useEffect(() => {
    setIsForgotPassword(location.pathname === '/reset-password');
    if (location.pathname === '/login') {
      setResetEmailSent(false);
    }
  }, [location.pathname]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      setError('Failed to log in: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Provide user-friendly error messages for common Safari issues
      let errorMessage = 'Failed to log in with Google';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login was cancelled. Please try again.';
      } else if (error.message?.includes('sessionStorage') || error.message?.includes('initial state')) {
        errorMessage = 'Browser privacy settings may be blocking login. Please try refreshing the page.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await resetPassword(email);
      setResetEmailSent(true);
    } catch (error: any) {
      setError('Failed to send reset email: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  const goToSignup = () => {
    navigate('/signup');
  };

  const goToLogin = () => {
    navigate('/login');
  };

  const goToResetPassword = () => {
    navigate('/reset-password');
  };

  if (isForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Reset Password</h2>
          {resetEmailSent ? (
            <div className="success-message">
              <p>Password reset email sent! Check your inbox.</p>
              <button 
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetEmailSent(false);
                  goToLogin();
                }}
                className="btn-secondary"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setIsForgotPassword(false);
                  goToLogin();
                }}
                className="btn-secondary"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>fit by evo</h2>
        <p className="auth-subtitle">Sign In</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="divider">
          <span>or</span>
        </div>
        
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="btn-google"
        >
          <svg viewBox="0 0 24 24" className="google-icon">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
        <div className="auth-links">
          <button 
            onClick={goToResetPassword}
            className="link-button"
          >
            Forgot Password?
          </button>
          <span>Don't have an account? </span>
          <button 
            onClick={goToSignup}
            className="link-button"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
} 