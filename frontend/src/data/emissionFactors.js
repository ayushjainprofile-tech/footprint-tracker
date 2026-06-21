export const emissionFactors = {
  "Transport": {
    "Car (Petrol)": { "factor": 0.25, "unit": "km", "source": "EPA" },
    "Car (Diesel)": { "factor": 0.27, "unit": "km", "source": "EPA" },
    "Car (EV)": { "factor": 0.05, "unit": "km", "source": "EPA" },
    "Bus": { "factor": 0.08, "unit": "km", "source": "EPA" },
    "Metro/Train": { "factor": 0.04, "unit": "km", "source": "EPA" },
    "Flight (Domestic)": { "factor": 0.25, "unit": "km", "source": "EPA" },
    "Walk/Bike": { "factor": 0.0, "unit": "km", "source": "EPA" }
  },
  "Diet": {
    "Meat-heavy Meal": { "factor": 7.0, "unit": "meal", "source": "IPCC" },
    "Average Meal": { "factor": 4.5, "unit": "meal", "source": "IPCC" },
    "Vegetarian Meal": { "factor": 2.5, "unit": "meal", "source": "IPCC" },
    "Vegan Meal": { "factor": 2.0, "unit": "meal", "source": "IPCC" }
  },
  "Energy": {
    "Grid Electricity": { "factor": 0.2, "unit": "kWh", "source": "Local Grid" },
    "LPG Cylinder": { "factor": 3.0, "unit": "kg", "source": "EPA" }
  },
  "Shopping": {
    "Clothing (Fast Fashion)": { "factor": 15.0, "unit": "item", "source": "UNEP" },
    "Electronics (Smartphone)": { "factor": 50.0, "unit": "item", "source": "UNEP" },
    "General Groceries": { "factor": 2.5, "unit": "bag", "source": "UNEP" }
  }
};

export default emissionFactors;
