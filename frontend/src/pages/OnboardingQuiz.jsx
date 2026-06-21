import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { db, auth } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { getBaselineFromQuiz } from '../utils/calcEngine';
const OnboardingQuiz = () => {
  const { loginOrOnboard } = useUser();
  const [formData, setFormData] = useState({
    username: '',
    transport_mode: 'Car (Petrol)',
    diet_type: 'Average Meal',
    energy_usage: 'Average Grid'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Authenticate anonymously
      const userCredential = await signInAnonymously(auth);
      const newUserId = userCredential.user.uid;
      
      const baseline = getBaselineFromQuiz(formData);
      
      const newUserData = {
        username: formData.username,
        weekly_budget_kg: baseline,
        tier: "Bronze",
        points: 0,
        next_tier_points: 500,
        streak_days: 0,
        total_spent_kg: 0,
        group_id: null
      };

      await setDoc(doc(db, "users", newUserId), newUserData);
      
      // Successfully onboarded backend user, now set local state
      loginOrOnboard({ id: newUserId, username: formData.username });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 className="text-center" style={{ color: 'var(--accent-color)' }}>Welcome to Carbon Tracker</h2>
        <p className="text-center mb-4">Let's set your baseline budget. Be honest!</p>
        
        {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Choose a Username</label>
            <input 
              type="text" 
              name="username" 
              className="form-input" 
              value={formData.username} 
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Primary Transport Mode</label>
            <select name="transport_mode" className="form-select" value={formData.transport_mode} onChange={handleChange}>
              <option value="Car (Petrol)">Car (Petrol)</option>
              <option value="Car (Diesel)">Car (Diesel)</option>
              <option value="Car (EV)">Car (EV)</option>
              <option value="Bus">Bus</option>
              <option value="Metro/Train">Metro/Train</option>
              <option value="Walk/Bike">Walk/Bike</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Typical Diet</label>
            <select name="diet_type" className="form-select" value={formData.diet_type} onChange={handleChange}>
              <option value="Meat-heavy Meal">Meat-heavy</option>
              <option value="Average Meal">Mixed (Average)</option>
              <option value="Vegetarian Meal">Vegetarian</option>
              <option value="Vegan Meal">Vegan</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate My Budget'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingQuiz;
