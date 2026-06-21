import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import OnboardingQuiz from './pages/OnboardingQuiz';
import Dashboard from './pages/Dashboard';

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="container text-center"><p>Loading Carbon Footprint Tracker...</p></div>;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <header style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0' }}>
            <h1 style={{ fontSize: '1.5rem', color: 'var(--accent-color)', margin: 0 }}>Carbon Tracker</h1>
            {user && <span>Welcome, {user.user.username} | <span style={{color: 'var(--warning-color)'}}>Tier: {user.user.tier}</span></span>}
          </div>
        </header>

        <main>
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <OnboardingQuiz />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
