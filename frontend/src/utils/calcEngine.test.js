import { describe, it, expect } from 'vitest';
import { getBaselineFromQuiz, calculateWhatIf, calculateTier } from './calcEngine';

describe('calcEngine', () => {
  it('should calculate the correct baseline for a Vegan without a car', () => {
    const formData = {
      transport_mode: 'Walk/Bike',
      diet_type: 'Vegan Meal',
      energy_usage: 'Average Grid'
    };
    // 0 (transport) + 2*21 (diet) + 10 (energy) + 25 (shopping) = 77
    const baseline = getBaselineFromQuiz(formData);
    expect(baseline).toBe(77);
  });

  it('should calculate the correct baseline for a Petrol Car and Meat diet', () => {
    const formData = {
      transport_mode: 'Car (Petrol)',
      diet_type: 'Meat-heavy Meal',
      energy_usage: 'Average Grid'
    };
    // 25 (transport) + 7*21 (diet) + 10 (energy) + 25 (shopping) = 207
    const baseline = getBaselineFromQuiz(formData);
    expect(baseline).toBe(207);
  });

  it('should simulate savings for switching to EV', () => {
    // 0.25 * 70 (Petrol) - 0.05 * 70 (EV) = 17.5 - 3.5 = 14 kg difference
    const savings = calculateWhatIf(207, 'switch_to_ev', 7);
    expect(savings).toBe(14.0);
  });

  it('should compute the next tier correctly based on points', () => {
    // Bronze: 0-499, Silver: 500-1499, Gold: 1500-3499, Platinum: 3500-6999, Diamond: 7000+
    expect(calculateTier(0).currentTier).toBe('Bronze');
    expect(calculateTier(499).currentTier).toBe('Bronze');
    expect(calculateTier(500).currentTier).toBe('Silver');
    expect(calculateTier(2000).currentTier).toBe('Gold');
    expect(calculateTier(8000).currentTier).toBe('Diamond');
    expect(calculateTier(8000).nextTierPoints).toBe(null);
  });
});
