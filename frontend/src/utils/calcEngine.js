import emissionFactors from '../data/emissionFactors';

// Tiers logic
const TIERS = [
    { name: "Bronze", min_points: 0 },
    { name: "Silver", min_points: 500 },
    { name: "Gold", min_points: 1500 },
    { name: "Platinum", min_points: 3500 },
    { name: "Diamond", min_points: 7000 }
];

export const calculateEmissions = (category, subCategory, quantity) => {
    if (!emissionFactors[category]) {
        throw new Error(`Unknown category: ${category}`);
    }
    if (!emissionFactors[category][subCategory]) {
        throw new Error(`Unknown sub-category: ${subCategory} in category ${category}`);
    }

    const factorData = emissionFactors[category][subCategory];
    const factor = factorData.factor;
    const unit = factorData.unit;
    const source = factorData.source;

    const co2e_kg = Number((quantity * factor).toFixed(3));
    const formula_str = `${quantity} ${unit} * ${factor} kgCO2e/${unit} = ${co2e_kg} kgCO2e`;

    return { co2e_kg, formula_str, source };
};

export const getBaselineFromQuiz = (quizData) => {
    let weeklyTotal = 0.0;

    // Transport (assuming 100km / week)
    const transportMode = quizData.transport_mode || "Car (Petrol)";
    weeklyTotal += calculateEmissions("Transport", transportMode, 100).co2e_kg;

    // Diet (21 meals / week)
    const dietType = quizData.diet_type || "Average Meal";
    weeklyTotal += calculateEmissions("Diet", dietType, 21).co2e_kg;

    // Energy (assume 50 kWh / week baseline)
    weeklyTotal += calculateEmissions("Energy", "Grid Electricity", 50).co2e_kg;

    // Shopping (assume 1 mixed clothing/grocery per week)
    weeklyTotal += calculateEmissions("Shopping", "General Groceries", 10).co2e_kg;

    return Number(weeklyTotal.toFixed(2));
};

export const calculateWhatIf = (userBaselineKg, actionType, frequency) => {
    let savings = 0.0;
    
    if (actionType === "switch_to_ev") {
        const petrol = calculateEmissions("Transport", "Car (Petrol)", frequency * 10).co2e_kg;
        const ev = calculateEmissions("Transport", "Car (EV)", frequency * 10).co2e_kg;
        savings = petrol - ev;
    } else if (actionType === "go_vegetarian") {
        const meat = calculateEmissions("Diet", "Meat-heavy Meal", frequency).co2e_kg;
        const veg = calculateEmissions("Diet", "Vegetarian Meal", frequency).co2e_kg;
        savings = meat - veg;
    }

    return Number(savings.toFixed(2));
};

export const calculateTier = (points) => {
    let currentTier = TIERS[0].name;
    let nextTierPoints = TIERS[1].min_points;

    for (let i = 0; i < TIERS.length; i++) {
        if (points >= TIERS[i].min_points) {
            currentTier = TIERS[i].name;
            if (i + 1 < TIERS.length) {
                nextTierPoints = TIERS[i + 1].min_points;
            } else {
                nextTierPoints = null; // Max tier
            }
        } else {
            break;
        }
    }

    return { currentTier, nextTierPoints };
};

// Mock LLM EcoCard caption generator logic ported from backend
export const generateEcoCardCaption = (savedKg, tier, streakDays) => {
    if (tier === "Diamond" || savedKg > 50) {
        return `Earth's MVP! Saved ${savedKg.toFixed(1)}kg CO2e this week!`;
    } else if (streakDays >= 7) {
        return `${streakDays} Day Streak! Unstoppable Eco-Warrior!`;
    } else if (savedKg > 0) {
        return `Making moves! ${savedKg.toFixed(1)}kg CO2e kept out of the atmosphere.`;
    } else {
        return "Small steps matter. On my way to a greener footprint!";
    }
};
