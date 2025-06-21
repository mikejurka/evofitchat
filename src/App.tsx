import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Dashboard } from './components/Dashboard';
import './App.css';

function AppContent() {
  const { currentUser } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (!currentUser) {
    return showSignup ? (
      <Signup onSwitchToLogin={() => setShowSignup(false)} />
    ) : (
      <Login onSwitchToSignup={() => setShowSignup(true)} />
    );
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
