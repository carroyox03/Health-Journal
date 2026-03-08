import { getTodayKey, parseDateKey } from './dateUtils.js';
import { calculateTDEE, calculateMacroGoals, calculatePercentages, getCycleDay } from './calculations.js';
import { redirectIfNotSetup } from './checkSetup.js';

redirectIfNotSetup();

const activeDay = getTodayKey();
localStorage.setItem("current-day", activeDay);

document.addEventListener("DOMContentLoaded", () => {
    const todayKey = getTodayKey();
    let dayData = JSON.parse(localStorage.getItem(`day-${todayKey}`));

    const DARK_MODE_KEY = "darkMode";
    function applyDarkMode(enable) {
        if (enable) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

    applyDarkMode(localStorage.getItem(DARK_MODE_KEY) === "true");

    const nameHeader = document.getElementById("name");
    const splitDayText = document.getElementById("split-day");

    const bioData = JSON.parse(localStorage.getItem("bioData"));
    if (bioData && bioData.name) {
        nameHeader.textContent = bioData.name;
    }


    if (!dayData) {
        dayData = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [], water: 0};
    }
    
    let calories = 0;
    let carbs = 0;
    let fat = 0;
    let protein = 0;
    let fiber = 0;
    let sodium = 0;
    let sugar = 0;
    let water = 0;
    const meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];
    meals.forEach(meal => {
        let foods = dayData[meal];
        if (!foods) {
            foods = [];
        }
        foods.forEach(food => {
            calories += food.calories;
            carbs += food.carbs;
            fat += food.fat;
            protein += food.protein;
            fiber += food.fiber;
            sodium += food.sodium;
            sugar += food.sugar;
        });     
    });

    const calorieGoal = calculateTDEE({
        sex: bioData.sex,
        weight: bioData.weight,
        height: bioData.height,
        age: parseInt(bioData.age),
        activity: bioData["activity-lvl"]
    }, bioData.goal);

    const macroGoals = calculateMacroGoals(calorieGoal, bioData["macro-split"]);
    const waterGoal = parseInt(bioData["water-goal"]);

    calories = calculatePercentages(calories, calorieGoal);
    carbs = calculatePercentages(carbs, macroGoals.carbs);
    fat = calculatePercentages(fat, macroGoals.fat);
    protein = calculatePercentages(protein, macroGoals.protein);
    water = calculatePercentages(dayData.water, waterGoal);

    document.getElementById("cal").textContent = `${calories}%`;
    document.getElementById("carb").textContent = `${carbs}%`;
    document.getElementById("fat").textContent = `${fat}%`;
    document.getElementById("prot").textContent = `${protein}%`;
    document.getElementById("water").textContent = `${water}%`;


    const goalsContainer = document.querySelector(".goals-div");

    if (bioData && Array.isArray(bioData.customGoals)) {
        goalsContainer.innerHTML = "";

        bioData.customGoals.forEach((goal, index) => {
            const label = document.createElement("label");
            label.setAttribute("for", `goal-${index}`);

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `goal-${index}`;
            checkbox.className = "goals";
            checkbox.checked = goal.checked || false;

            label.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    e.preventDefault();
                }
            });

            checkbox.addEventListener("change", () => {
                goal.checked = checkbox.checked;
                localStorage.setItem("bioData", JSON.stringify(bioData));
            });

            const goalText = document.createTextNode(` ${goal.text}`);
            label.appendChild(checkbox);
            label.appendChild(goalText);
            goalsContainer.appendChild(label);
        });

        if (goalsContainer.innerHTML === "") {
            const p = document.createElement("p");
            p.textContent = "You have no goals set!"
            goalsContainer.appendChild(p);
        }
    }

    const START_DATE_KEY = "workout-start-date";
    if (!localStorage.getItem(START_DATE_KEY)) {
        localStorage.setItem(START_DATE_KEY, todayKey);
    }

    const splitDays = parseInt(bioData["workout-freq"]);

    const workoutSplits = {
        1: ["Full Body Day"],
        2: ["Upper Body Day", "Lower Body + Core Day"],
        3: ["Push Day", "Pull Day", "Leg Day"],
        4: ["Upper Strength", "Lower Strength", "Cardio + Core", "Legs Hypertrophy"],
        5: ["Chest + Triceps", "Back + Biceps", "Legs", "Shoulders + Abs", "Cardio + Mobility"],
        6: ["Push", "Pull", "Legs", "Push 2", "Pull 2", "Core + Cardio"],
        7: ["Push A", "Pull A", "Legs A", "Active Recovery", "Push B", "Pull B", "Legs B"]
    };
    
    const cycleDay = getCycleDay(7, localStorage.getItem(START_DATE_KEY), todayKey);
    const splitList = workoutSplits[splitDays];
    let splitName = "Rest Day";
    if (splitList && cycleDay < splitList.length) {
        splitName = splitList[cycleDay];
    }

    splitDayText.textContent = splitName;
});





