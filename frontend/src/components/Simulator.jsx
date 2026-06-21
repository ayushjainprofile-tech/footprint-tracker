import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { calculateWhatIf } from '../utils/calcEngine';

const Simulator = () => {
  const { user } = useUser();
  const [action, setAction] = useState('switch_to_ev');
  const [frequency, setFrequency] = useState(3);
  const [savings, setSavings] = useState(null);

  const simulate = async () => {
    try {
      const userBaselineKg = user.user.weekly_budget_kg;
      const calculatedSavings = calculateWhatIf(userBaselineKg, action, Number(frequency));
      setSavings(calculatedSavings);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <h3>"What-If" Simulator</h3>
      <p style={{ color: 'var(--text-secondary)' }}>See how small changes impact your budget.</p>
      
      <div className="flex gap-4 items-center mt-4" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">If you...</label>
          <select className="form-select" value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="switch_to_ev">Switch from Petrol to EV</option>
            <option value="go_vegetarian">Swap Meat for Vegetarian</option>
          </select>
        </div>
        
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">Frequency (days/week)</label>
          <input 
            type="range" 
            min="1" max="7" 
            value={frequency} 
            onChange={(e) => setFrequency(e.target.value)} 
            style={{ width: '100%', accentColor: 'var(--accent-color)' }}
          />
          <div className="text-center">{frequency} days</div>
        </div>
        
        <button className="btn btn-secondary" onClick={simulate} style={{ alignSelf: 'flex-end', marginBottom: '0.5rem' }}>Simulate</button>
      </div>

      {savings !== null && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--surface-color-hover)', borderRadius: 'var(--radius-md)' }}>
          <strong style={{ color: 'var(--accent-color)', fontSize: '1.2rem' }}>You would save {savings} kg CO2e / week!</strong>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>That's equivalent to driving {(savings * 5).toFixed(1)} fewer km in a petrol car.</p>
        </div>
      )}
    </div>
  );
};

export default Simulator;
