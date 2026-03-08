import { parseDateKey } from "./dateUtils.js";

export function calculateTDEE({ sex, weight, height, age, activity }, goal) {
    const LBTOKG = 0.4536;
    const kgWeight = parseFloat(weight) * LBTOKG;
    const [feet, inches] = height.split("'").map(s => parseInt(s));
    const heightCm = (feet * 12 + inches) * 2.54;

    let bmr;
    if (sex.toLowerCase() === "male") {
        bmr = 10 * kgWeight + 6.25 * heightCm - 5 * age + 5;
    } else {
        bmr = 10 * kgWeight + 6.25 * heightCm - 5 * age - 161;
    }

    const activityLevels = {
        "Sedentary": 1.2,
        "Light": 1.375,
        "Moderate": 1.55,
        "Active": 1.725,
        "Very Active": 1.9
    };

    const activityMultiplier = activityLevels[activity];
    let tdee = bmr * activityMultiplier;

    if (goal) {
        const parts = goal.split(" ");
        const direction = parts[0].toLowerCase();
        const rate = parseFloat(parts[1]);
        const calorieChange = rate * 500;

        if (direction === "lose") {
            tdee -= calorieChange;
        } else if (direction === "gain") {
            tdee += calorieChange;
        }
    }

    return Math.round(tdee / 50) * 50;
}

export function getMacroRatios(split) {
    switch (split) {
        case "High Protein":
            return { carb: 0.30, fat: 0.25, protein: 0.45 };
        case "High Carb":
            return { carb: 0.50, fat: 0.20, protein: 0.30 };
        case "Low Carb":
            return { carb: 0.20, fat: 0.40, protein: 0.40 };
        case "Balanced":
        default:
            return { carb: 0.40, fat: 0.30, protein: 0.30 };
    }
}

export function calculateMacroGoals(calories, split) {
    const ratios = getMacroRatios(split);
    return {
        carbs: Math.round((calories * ratios.carb) / 4),
        fat: Math.round((calories * ratios.fat) / 9),
        protein: Math.round((calories * ratios.protein) / 4)
    };
}

export function calculatePercentages(current, target) {
    return Math.min(999, Math.round((current / target) * 100));
}

export function getCycleDay(splitLength, startDateStr, dayStr) {
    const startDate = parseDateKey(startDateStr);
    const currentDate = parseDateKey(dayStr);
    const diffDays = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    return ((diffDays % 7) + 7) % 7;
}