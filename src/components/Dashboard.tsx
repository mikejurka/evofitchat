import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Settings } from './Settings';
import './Dashboard.css';

export function Dashboard() {
  const { currentUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return <Settings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Fitness App</h1>
          <div className="user-info">
            <span>Welcome, {currentUser?.displayName || currentUser?.email}</span>
            <button 
              onClick={() => setShowSettings(true)}
              className="settings-btn"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome to Your Fitness Journey!</h2>
          <p>Track your workouts, monitor your progress, and achieve your fitness goals.</p>
        </div>
        
        <div className="quick-actions">
          <div className="action-card">
            <h3>Start Workout</h3>
            <p>Begin a new training session</p>
            <button className="action-btn">Begin</button>
          </div>
          
          <div className="action-card">
            <h3>View Progress</h3>
            <p>Check your fitness metrics</p>
            <button className="action-btn">View</button>
          </div>
          
          <div className="action-card">
            <h3>Set Goals</h3>
            <p>Define your fitness objectives</p>
            <button className="action-btn">Set</button>
          </div>
        </div>
      </main>
    </div>
  );
} 