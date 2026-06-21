import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    import('firebase/auth').then(({ onAuthStateChanged }) => {
      import('../services/firebase').then(({ auth }) => {
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
          if (authUser) {
            setUserId(authUser.uid);
          } else {
            setUserId(null);
            setIsLoading(false);
          }
        });
        return unsubscribe;
      });
    });
  }, []);

  // Set up real-time listener when userId is set
  useEffect(() => {
    let unsubscribeUser = () => {};
    let unsubscribeActivities = () => {};
    
    if (userId) {
      setIsLoading(true);
      unsubscribeUser = onSnapshot(doc(db, "users", userId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          setUser(prev => ({
            ...prev,
            user: {
              id: userId,
              username: data.username,
              tier: data.tier,
              points: data.points,
              next_tier_points: data.next_tier_points,
              streak_days: data.streak_days,
              weekly_budget_kg: data.weekly_budget_kg,
              total_spent_kg: data.total_spent_kg,
              remaining_budget_kg: Number((data.weekly_budget_kg - data.total_spent_kg).toFixed(2)),
              group_id: data.group_id
            },
            peer_comparison: { peer_avg: data.weekly_budget_kg * 1.1 },
            top_levers: [
                {"action": "Switch 2x/week to public transit", "savings_kg": 15.0},
                {"action": "Go vegetarian 3 days/week", "savings_kg": 8.5}
            ]
          }));
        }
        setIsLoading(false);
      }, (error) => {
        console.error("Error listening to user doc:", error);
        setIsLoading(false);
      });

      // Fetch recent activities
      import('firebase/firestore').then(({ query, collection, where, onSnapshot }) => {
        const q = query(
          collection(db, "activities"), 
          where("user_id", "==", userId)
        );
        unsubscribeActivities = onSnapshot(q, (snapshot) => {
          const acts = [];
          snapshot.forEach(doc => {
            acts.push({ id: doc.id, ...doc.data() });
          });
          // Sort descending and limit to 10 to avoid requiring a composite index
          acts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          const topActs = acts.slice(0, 10);
          setUser(prev => prev ? { ...prev, recent_activities: topActs } : null);
        });
      });
    }
    return () => {
      unsubscribeUser();
      unsubscribeActivities();
    };
  }, [userId]);

  const loginOrOnboard = async (userData) => {
    // No longer needed, onAuthStateChanged handles the userId update
    // But we might want to ensure the user doc is created before redirecting
  };

  const logout = () => {
    import('firebase/auth').then(({ signOut }) => {
      import('../services/firebase').then(({ auth }) => {
        signOut(auth).then(() => {
          setUser(null);
          setUserId(null);
        });
      });
    });
  };

  const refreshDashboard = async () => {
    // No-op for Firebase since onSnapshot automatically updates
  };

  return (
    <UserContext.Provider value={{ user, isLoading, loginOrOnboard, logout, refreshDashboard }}>
      {children}
    </UserContext.Provider>
  );
};

