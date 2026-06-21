import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../services/firebase';
import { collection, addDoc, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { calculateEmissions, calculateTier } from '../utils/calcEngine';

const categories = {
  Transport: ['Car (Petrol)', 'Car (Diesel)', 'Car (EV)', 'Bus', 'Metro/Train', 'Flight (Domestic)', 'Walk/Bike'],
  Diet: ['Meat-heavy Meal', 'Average Meal', 'Vegetarian Meal', 'Vegan Meal'],
  Energy: ['Grid Electricity', 'LPG Cylinder'],
  Shopping: ['Clothing (Fast Fashion)', 'Electronics (Smartphone)', 'General Groceries']
};

const ActivityLogger = () => {
  const { user, refreshDashboard } = useUser();
  const [category, setCategory] = useState('Transport');
  const [subCategory, setSubCategory] = useState(categories['Transport'][0]);
  const [quantity, setQuantity] = useState(10);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState('manual');
  const [ocrResult, setOcrResult] = useState(null);

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    setCategory(newCat);
    setSubCategory(categories[newCat][0]);
  };

  const logActivityToFirebase = async (cat, subCat, qty) => {
    const { co2e_kg, formula_str, source } = calculateEmissions(cat, subCat, qty);
    
    // 1. Add activity log
    await addDoc(collection(db, "activities"), {
      user_id: user.user.id,
      category: cat,
      sub_category: subCat,
      quantity: qty,
      unit: "units",
      co2e_kg: co2e_kg,
      formula: formula_str,
      source: source,
      timestamp: new Date().toISOString()
    });

    // 2. Update user stats
    const points_earned = Math.max(0, Math.floor(100 - (co2e_kg * 10)));
    
    const userRef = doc(db, "users", user.user.id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      const newPoints = data.points + points_earned;
      const tierInfo = calculateTier(newPoints);
      
      await updateDoc(userRef, {
        total_spent_kg: increment(co2e_kg),
        points: increment(points_earned),
        tier: tierInfo.currentTier,
        next_tier_points: tierInfo.nextTierPoints
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await logActivityToFirebase(category, subCategory, quantity);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    
    try {
      // Simulate OCR delay
      await new Promise(r => setTimeout(r, 2000));
      
      const mockData = {
        filename: file.name,
        items: [
            {"item": "Beef Steak 500g", "category": "Diet", "sub_category": "Meat-heavy Meal", "quantity": 2, "co2e_kg": 6.6},
            {"item": "Local Apples 1kg", "category": "Shopping", "sub_category": "General Groceries", "quantity": 1, "co2e_kg": 2.5}
        ],
        total_co2e_kg: 9.1
      };
      
      setOcrResult(mockData);
      
      // Auto-log the items
      for (const item of mockData.items) {
        await logActivityToFirebase(item.category, item.sub_category, item.quantity);
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Log Activity</h3>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-color)', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
          <button 
            type="button"
            style={{ padding: '0.5rem 1rem', background: mode === 'manual' ? 'var(--accent-color)' : 'transparent', color: mode === 'manual' ? 'white' : 'inherit', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onClick={() => setMode('manual')}
          >Manual</button>
          <button 
            type="button"
            style={{ padding: '0.5rem 1rem', background: mode === 'ocr' ? 'var(--accent-color)' : 'transparent', color: mode === 'ocr' ? 'white' : 'inherit', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            onClick={() => setMode('ocr')}
          >Receipt OCR</button>
        </div>
      </div>
      
      {mode === 'manual' ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group mt-4">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={handleCategoryChange}>
              {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-select" value={subCategory} onChange={(e) => setSubCategory(e.target.value)}>
              {categories[category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity (km, meals, kWh, etc.)</label>
            <input type="number" className="form-input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="0" step="0.1" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging...' : 'Quick Add'}
          </button>
        </form>
      ) : (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload a grocery receipt. We'll automatically extract items and log their footprint!</p>
          <label className="btn btn-secondary" style={{ display: 'block', textAlign: 'center', cursor: 'pointer' }}>
            {loading ? 'Scanning...' : 'Upload Image'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={loading} />
          </label>
          
          {ocrResult && (
            <div style={{ marginTop: '1.5rem', background: 'var(--surface-color)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--success-color)' }}>Successfully auto-logged!</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem' }}>
                {ocrResult.items.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{item.item}</span>
                    <span style={{ color: 'var(--accent-color)' }}>+{item.co2e_kg} kg</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontWeight: 'bold' }}>
                <span>Total Added:</span>
                <span>{ocrResult.total_co2e_kg} kg</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogger;
