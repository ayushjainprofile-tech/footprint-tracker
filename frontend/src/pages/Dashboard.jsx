import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import ActivityLogger from '../components/ActivityLogger';
import Simulator from '../components/Simulator';
import Leaderboard from '../components/Leaderboard';
import EcoCard from '../components/EcoCard';
import { Leaf, Info } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useUser();
  const userData = user?.user;
  const peerData = user?.peer_comparison;
  const levers = user?.top_levers;
  const recentActivities = user?.recent_activities || [];

  const [selectedActivity, setSelectedActivity] = useState(null);

  if (!userData) return null;

  const percentUsed = Math.min(100, Math.round((userData.total_spent_kg / userData.weekly_budget_kg) * 100));
  
  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h2>Your Weekly Carbon Budget</h2>
        <button onClick={logout} className="btn btn-secondary">Logout</button>
      </div>

      {/* Eco-Rank Gamification Widget */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--accent-color)' }}>{userData.tier} Tier</h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{userData.points} Points • {userData.streak_days} Day Streak <span style={{color: 'var(--warning-color)'}}>({Math.min(userData.streak_days, 5)}x multiplier)</span></div>
        </div>
        
        {userData.next_tier_points && (
          <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <span>Progress to Next Tier</span>
              <span>{userData.points} / {userData.next_tier_points}</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--surface-color-hover)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (userData.points / userData.next_tier_points) * 100)}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Budget Tracker */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Budget Used</h3>
          <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto', borderRadius: '50%', background: `conic-gradient(var(--accent-color) ${percentUsed}%, var(--surface-color-hover) ${percentUsed}%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '130px', height: '130px', background: 'var(--surface-color)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{percentUsed}%</span>
            </div>
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Spent: {userData.total_spent_kg}kg</span>
            <span>Budget: {userData.weekly_budget_kg}kg</span>
          </div>
        </div>

        {/* Top Levers & Peer Comparison */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}><Leaf size={20} color="var(--accent-color)" /> Top Levers for You</h3>
          {levers.map((lever, i) => (
            <div key={i} style={{ padding: '1rem', background: 'var(--surface-color-hover)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
              <strong>{lever.action}</strong>
              <div style={{ color: 'var(--success-color)', fontSize: '0.9rem' }}>Save ~{lever.savings_kg} kg/week</div>
            </div>
          ))}

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>Peer Comparison</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You are using <strong>{Math.round((userData.weekly_budget_kg / peerData.peer_avg)*100)}%</strong> of what similar users emit weekly.</p>
        </div>

      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <ActivityLogger />
        <Leaderboard />
        
        {/* Activity Feed */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3>Recent Activity</h3>
          {recentActivities.length === 0 ? <p>No activities logged yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivities.map(act => (
                <div key={act.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{act.sub_category}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(act.timestamp).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>+{act.co2e_kg} kg</span>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setSelectedActivity(act)} aria-label="View calculation details">
                      <Info size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Simulator />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <EcoCard />
      </div>

      {/* Explainable Calc Modal */}
      {selectedActivity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '400px', width: '100%' }}>
            <h3>Calculation Details</h3>
            <p><strong>Activity:</strong> {selectedActivity.sub_category}</p>
            <p><strong>Formula:</strong> <code>{selectedActivity.formula_used}</code></p>
            <p><strong>Source:</strong> {selectedActivity.source_reference}</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setSelectedActivity(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
