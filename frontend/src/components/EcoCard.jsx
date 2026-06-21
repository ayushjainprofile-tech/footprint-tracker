import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { generateEcoCardCaption } from '../utils/calcEngine';
import html2canvas from 'html2canvas';
import { Share2, Download } from 'lucide-react';

const EcoCard = () => {
  const { user } = useUser();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);

  const fetchCardData = async () => {
    setLoading(true);
    try {
      const saved_kg = Math.max(0, user.user.weekly_budget_kg - user.user.total_spent_kg);
      const caption = generateEcoCardCaption(saved_kg, user.user.tier, user.user.streak_days);
      
      const cardInfo = {
        username: user.user.username,
        tier: user.user.tier,
        streak_days: user.user.streak_days,
        saved_kg: Number(saved_kg.toFixed(2)),
        caption: caption
      };
      setCardData(cardInfo);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: null, scale: 2 });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `eco-hero-${user.user.username}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center mb-4">
        <h3>Share Your Impact</h3>
        <button onClick={fetchCardData} className="btn btn-primary" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Eco-Card'}
        </button>
      </div>
      
      {cardData && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          
          {/* Card to be captured */}
          <div 
            ref={cardRef} 
            style={{ 
              width: '350px', 
              height: '450px', 
              background: 'linear-gradient(135deg, var(--bg-color), var(--surface-color))',
              border: '2px solid var(--accent-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background decoration */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-color)', opacity: '0.1', borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '100px', height: '100px', background: 'var(--success-color)', opacity: '0.1', borderRadius: '50%' }}></div>

            <h2 style={{ color: 'var(--accent-color)', margin: 0, textAlign: 'center', fontSize: '1.8rem', zIndex: 1 }}>{cardData.caption}</h2>
            
            <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{cardData.username}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tier</div>
                  <div style={{ fontWeight: 'bold', color: 'var(--warning-color)' }}>{cardData.tier}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Streak</div>
                  <div style={{ fontWeight: 'bold' }}>{cardData.streak_days} Days</div>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success-color)', lineHeight: '1' }}>{cardData.saved_kg}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kg CO2e Saved This Week</div>
            </div>

            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', zIndex: 1 }}>Carbon Footprint Tracker</div>
          </div>

          <button onClick={handleDownload} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Download Card
          </button>
        </div>
      )}
    </div>
  );
};

export default EcoCard;
