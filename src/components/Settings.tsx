import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Settings.css';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { currentUser, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showProfile) {
    return <UserProfile onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="settings">
      <header className="settings-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h1>Settings</h1>
      </header>
      
      <main className="settings-main">
        <div className="settings-section">
          <h2>Account</h2>
          
          <div className="setting-item" onClick={() => setShowProfile(true)}>
            <div className="setting-info">
              <h3>User Profile</h3>
              <p>View and edit your profile information</p>
            </div>
            <span className="arrow">→</span>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Email</h3>
              <p>{currentUser?.email}</p>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Account Created</h3>
              <p>{currentUser?.metadata.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>App</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <h3>Version</h3>
              <p>1.0.0</p>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <button 
            onClick={handleLogout} 
            disabled={loading}
            className="logout-btn"
          >
            {loading ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </main>
    </div>
  );
}

function UserProfile({ onBack }: { onBack: () => void }) {
  const { currentUser } = useAuth();

  return (
    <div className="settings">
      <header className="settings-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h1>User Profile</h1>
      </header>
      
      <main className="settings-main">
        <div className="profile-section">
          <div className="profile-avatar">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {currentUser?.displayName?.[0] || currentUser?.email?.[0] || 'U'}
              </div>
            )}
          </div>
          
          <div className="profile-info">
            <h2>{currentUser?.displayName || 'User'}</h2>
            <p>{currentUser?.email}</p>
            {currentUser?.emailVerified && (
              <span className="verified-badge">✓ Email Verified</span>
            )}
          </div>
        </div>
        
        <div className="profile-details">
          <div className="detail-item">
            <label>User ID</label>
            <p>{currentUser?.uid}</p>
          </div>
          
          <div className="detail-item">
            <label>Provider</label>
            <p>{currentUser?.providerData[0]?.providerId || 'Email/Password'}</p>
          </div>
          
          <div className="detail-item">
            <label>Last Sign In</label>
            <p>{currentUser?.metadata.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleString() : 'Unknown'}</p>
          </div>
        </div>
      </main>
    </div>
  );
} 