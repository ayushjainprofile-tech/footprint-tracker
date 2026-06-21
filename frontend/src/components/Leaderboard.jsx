import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const groupId = user?.user?.group_id;

  useEffect(() => {
    if (groupId) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [groupId]);

  const fetchLeaderboard = async () => {
    try {
      const q = query(collection(db, "users"), where("group_id", "==", groupId));
      const querySnapshot = await getDocs(q);
      
      let members = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        let reduction = 0;
        if (data.weekly_budget_kg > 0) {
           reduction = ((data.weekly_budget_kg - data.total_spent_kg) / data.weekly_budget_kg) * 100;
        }
        
        members.push({
          username: data.username,
          tier: data.tier,
          points: data.points,
          reduction_pct: Number(reduction.toFixed(1))
        });
      });
      
      // Sort by reduction_pct descending (highest reduction first)
      members.sort((a, b) => b.reduction_pct - a.reduction_pct);
      
      setLeaderboard(members);
      setGroupName("Hostel A"); // Mock group name since we don't have a groups collection yet
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading leaderboard...</div>;

  if (!groupId) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        <Trophy size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>Group Leaderboard</h3>
        <p style={{ color: 'var(--text-secondary)' }}>You are not in a group yet. Join one to compete!</p>
        {/* Simplified mock UI for hackathon purposes */}
        <button className="btn btn-secondary mt-4">Join a Group</button>
      </div>
    );
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy size={20} color="#fbbf24" />; // Gold
      case 1: return <Medal size={20} color="#94a3b8" />; // Silver
      case 2: return <Award size={20} color="#b45309" />; // Bronze
      default: return <span style={{ width: '20px', display: 'inline-block', textAlign: 'center', color: 'var(--text-secondary)' }}>{index + 1}</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center mb-4">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trophy size={20} color="var(--accent-color)" /> {groupName} Leaderboard
        </h3>
      </div>
      
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Ranked by % reduction against personal baseline to ensure fairness.</p>

      {leaderboard.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {leaderboard.map((member, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '0.75rem 1rem', 
                background: member.username === user.user.username ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface-color)', 
                border: member.username === user.user.username ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', 
                display: 'flex', 
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px' }}>
                {getRankIcon(index)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: member.username === user.user.username ? 'bold' : 'normal' }}>
                  {member.username} {member.username === user.user.username && '(You)'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Tier: {member.tier} • {member.points} pts
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: member.reduction_pct > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                {member.reduction_pct > 0 ? '↓' : '↑'} {Math.abs(member.reduction_pct)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
