import { getTodayKey, formatDateKey, parseDateKey } from './dateUtils.js';
import { calculateTDEE, calculateMacroGoals } from './calculations.js';
import { redirectIfNotSetup } from './checkSetup.js';

redirectIfNotSetup();

const macroViewBox = document.getElementById("macro-view-box");
const foodViewBox = document.getElementById("food-view-box");
const addFoodButn = document.getElementById("add-food-butn");
const toggleViewButn = document.getElementById("toggle-view-butn");
const exitButn = document.getElementById("exit-search");
const nutritionContainer = document.getElementById("nutrition-container");
macroViewBox.style.display = "flex";
foodViewBox.style.display = "none";
toggleViewButn.textContent = "See Foods";
const customForm = document.getElementById("custom-form");
const waterForm = document.getElementById("water-form");
const addWaterButn = document.getElementById("change-water-butn");

const prevDayButn = document.getElementById("prev-day");
const nextDayButn = document.getElementById("next-day");
const dayLabel = document.getElementById("day-label");

const mealList = ["Breakfast", "Lunch", "Dinner", "Snacks"];

let activeDay = getTodayKey();
localStorage.setItem("current-day", activeDay);

function getOrCreateDayData(dayKey) {
    let data = JSON.parse(localStorage.getItem(`day-${dayKey}`));
    if (!data) {
        data = {Breakfast: [], Lunch: [], Dinner: [], Snacks: [], water: 0 };
    }

    return data;
}

let bioData = JSON.parse(localStorage.getItem("bioData"));
if (!bioData) {
    bioData = {};
}

updateDayLabel();

document.addEventListener("DOMContentLoaded", () => {
    const DARK_MODE_KEY = "darkMode";
    function applyDarkMode(enable) {
        if (enable) {
            document.body.classList.add("dark-mode");
        } else {
            document.body.classList.remove("dark-mode");
        }
    }

    const darkModeEnabled = localStorage.getItem(DARK_MODE_KEY) === "true";
    applyDarkMode(darkModeEnabled);
});

toggleViewButn.addEventListener('click', () => {
    if (macroViewBox.style.display === "none")
    {
        macroViewBox.style.display = "flex";
        foodViewBox.style.display = "none";
        toggleViewButn.textContent = "See Foods"
    }
    else
    {
        macroViewBox.style.display = "none";
        foodViewBox.style.display = "flex";
        toggleViewButn.textContent = "See Macros";
    }
});

prevDayButn.addEventListener('click', () => {
    const prev = parseDateKey(activeDay);
    prev.setDate(prev.getDate() - 1);
    activeDay = formatDateKey(prev);
    updateDayLabel();
});

nextDayButn.addEventListener('click', () => {
    const next = parseDateKey(activeDay);
    next.setDate(next.getDate() + 1);
    activeDay = formatDateKey(next);
    updateDayLabel();
});

function updateDayLabel() {
    const displayDate = parseDateKey(activeDay);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    dayLabel.textContent = displayDate.toLocaleDateString(undefined, options);
    loadFoodsForDay(activeDay);
}

function loadFoodsForDay(day) {
    const key = `day-${day}`;
    let dayData = getOrCreateDayData(day);

    mealList.forEach(meal => {
        document.getElementById(`${meal.toLowerCase()}-list`).innerHTML = '';
    });

    let calories = 0;
    let carbs = 0;
    let fat = 0;
    let protein = 0;
    let fiber = 0;
    let sodium = 0;
    let sugar = 0;
        
    mealList.forEach(meal => {
        let mealFoods = dayData[meal]
        if (!mealFoods) {
            mealFoods = [];
        }

        const list = document.getElementById(`${meal.toLowerCase()}-list`);

        mealFoods.forEach(food => {
            calories += food.calories;
            carbs += food.carbs;
            fat += food.fat;
            protein += food.protein;
            fiber += food.fiber;
            sodium += food.sodium;
            sugar += food.sugar;

            const li = document.createElement("li");

            const span = document.createElement("span");
            span.textContent = `${food.name} (${food.quantity}) - ${food.calories} cal`;

            const button = document.createElement("button");
            button.textContent = "x";
            button.classList.add("food-delete-butn");

            button.addEventListener('click', () => {
                let currentData = getOrCreateDayData(activeDay);
                if (!currentData || !currentData[meal]) {
                    return;
                }

                const index = currentData[meal].findIndex(f =>
                    f.name === food.name && f.calories === food.calories
                );

                if (index !== -1) {
                    currentData[meal].splice(index, 1);
                    localStorage.setItem(key, JSON.stringify(currentData));
                    loadFoodsForDay(activeDay);
                }

            });

            li.appendChild(span);
            li.appendChild(button);
            list.appendChild(li);
        });

        calculateMealTotals(dayData, meal);
        
            
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

    let fiberGoal = 0;
    const sodiumGoal = 2300;
    let sugarGoal = 0;
    if (bioData.sex.toLowerCase() === "male") {
        fiberGoal = 38;
        sugarGoal = 36;
    } else {
        fiberGoal = 25;
        sugarGoal = 25;
    }

    document.getElementById("cal-count").textContent = `${calories} / ${calorieGoal}`;
    document.getElementById("carb-count").textContent = `${carbs}g / ${macroGoals.carbs}g`;
    document.getElementById("fat-count").textContent = `${fat}g / ${macroGoals.fat}g`;
    document.getElementById("prot-count").textContent = `${protein}g / ${macroGoals.protein}g`;
    document.getElementById("fib-count").textContent = `${fiber}g / ${fiberGoal}g`;
    document.getElementById("sod-count").textContent = `${sodium}mg / ${sodiumGoal}mg`;
    document.getElementById("sug-count").textContent = `${sugar}g / ${sugarGoal}g`;
    document.getElementById("water-count").textContent = `${dayData.water}ml / ${waterGoal}ml`;

        
}


document.getElementById("food-input").addEventListener('keydown', async (event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        const query = event.target.value.trim();
        const usdaAPI = "YOUR_API_KEY_HERE";

        try {
            const resp = await fetch(usdaAPI);
            const data = await resp.json();
            const foods = data.foods;
      
            const resultsDiv = document.getElementById("autocomplete-list");
            resultsDiv.innerHTML = "";
      
            if (!foods || foods.length === 0) {
              const noMatch = document.createElement("div");
              noMatch.textContent = "No results found.";
              resultsDiv.appendChild(noMatch);
              return;
            }

            const seen = new Set();
      
            foods.forEach(food => {
                const name = food.description.toLowerCase();
                if (seen.has(name)) {
                    return;
                }
                seen.add(name);

                const itemDiv = document.createElement("div");
                itemDiv.innerHTML = `<strong>${food.description.toLowerCase()}</strong>`;

              
                itemDiv.addEventListener("click", () => {
                    document.getElementById("food-input").value = food.description.toLowerCase();
                    resultsDiv.innerHTML = "";
                
                    const nutrientMap = {
                        calories: 0,
                        carbs: 0,
                        fat: 0,
                        protein: 0,
                        fiber: 0,
                        sodium: 0,
                        sugar: 0
                    };
                
                    
                    for (const nutrient of food.foodNutrients) {
                        const name = nutrient.nutrientName.toLowerCase();
                        const value = nutrient.value;
                
                        if (name.includes("energy"))
                            nutrientMap.calories = Math.round(value);
                        if (name.includes("carbohydrate"))
                            nutrientMap.carbs = Math.round(value);
                        if (name.includes("total lipid") || name === "fat")
                            nutrientMap.fat = Math.round(value);
                        if (name.includes("protein"))
                            nutrientMap.protein = Math.round(value);
                        if (name.includes("fiber"))
                            nutrientMap.fiber = Math.round(value);
                        if (name.includes("sodium"))
                            nutrientMap.sodium = Math.round(value);
                        if (name.includes("sugars") || name === "sugar")
                            nutrientMap.sugar = Math.round(value);
                    }
                
                    const form = document.getElementById("custom-form");
                    const inputs = form.querySelectorAll("input");
                
                    inputs.forEach(input => {
                        const field = input.placeholder.toLowerCase();
                        if (field === "name") {
                            input.value = food.description.toLowerCase();
                        } else if (nutrientMap[field] !== undefined) {
                            input.value = nutrientMap[field];
                        } else {
                            input.value = "";
                        }
                    });
                });


                resultsDiv.appendChild(itemDiv);
            });
      
          } catch (err) {
            console.error(err);
          }
        }
      });
 
document.addEventListener("click", function (event) {
    const searchBox = document.getElementById("usda-search");
    const resultList = document.getElementById("autocomplete-list");
      
    if (!searchBox.contains(event.target)) {
        resultList.innerHTML = "";
    }
});

addFoodButn.addEventListener('click', () => {
    if (macroViewBox) {
        macroViewBox.style.display = "none";
    }
    if (foodViewBox) {
        foodViewBox.style.display = "none";
    }

    addFoodButn.style.visibility = "hidden";
    toggleViewButn.style.visibility = "hidden";
    nutritionContainer.style.display = "flex";
    nextDayButn.style.visibility = "hidden";
    prevDayButn.style.visibility = "hidden";
    document.getElementById("day-label").style.visibility = "hidden";

    exitButn.style.display = "inline-block";
});

exitButn.addEventListener('click', () => {
    addFoodButn.style.visibility = "visible";
    toggleViewButn.style.visibility = "visible";
    nextDayButn.style.visibility = "visible";
    prevDayButn.style.visibility = "visible";
    document.getElementById("day-label").style.visibility = "visible";
    macroViewBox.style.display = "flex";
    customForm.reset();
    document.getElementById("food-input").value = "";

    nutritionContainer.style.display = "none";
    exitButn.style.display = "none";

})

function calculateMealTotals(dayData, meal) {
    const exists = document.getElementById(`${meal.toLowerCase()}`).querySelector(".meal-total-cals");
    if (exists) {
        exists.remove();
    }

    if (dayData[meal].length > 0) {
        const p = document.createElement("p");
        let cals = 0;
        dayData[meal].forEach(food => {
            cals += food.calories;
        })
        p.textContent = `Calories: ${cals}`;
        p.classList.add("meal-total-cals");
        document.getElementById(`${meal.toLowerCase()}`).appendChild(p);
        
    }
}

customForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(customForm);
    const mealType = formData.get("meal-input").trim();

    if (!mealList.some(meal => meal.toLowerCase() === mealType.toLowerCase())) {
        alert("Please select a valid meal type (Breakfast, Lunch, Dinner, Snacks)");
        return;
    }
    const quantity = Math.max(0, parseFloat(formData.get("food-quantity")) || 1.0);

    const foodData = {
        name: formData.get("food-name"),
        quantity: quantity,
        calories: Math.round(Math.max(0, Number(formData.get("food-calories"))) * quantity),
        carbs: Math.round(Math.max(0, Number(formData.get("food-carbs"))) * quantity),
        fat: Math.round(Math.max(0, Number(formData.get("food-fat"))) * quantity),
        protein: Math.round(Math.max(0, Number(formData.get("food-protein"))) * quantity),
        fiber: Math.round(Math.max(0, Number(formData.get("food-fiber"))) * quantity),
        sodium: Math.round(Math.max(0, Number(formData.get("food-sodium"))) * quantity),
        sugar: Math.round(Math.max(0, Number(formData.get("food-sugar"))) * quantity)
    };

    const key = `day-${activeDay}`;
    let dayData = getOrCreateDayData(activeDay);
    dayData[mealType].push(foodData);
    localStorage.setItem(key, JSON.stringify(dayData));
    customForm.reset();
    document.getElementById("food-input").value = "";
    loadFoodsForDay(activeDay);
    window.location.href = './nutrition.html';
});

let addingWater = false;

addWaterButn.addEventListener('click', () => {
    const waterInput = document.getElementById("water-quantity");
    if (addingWater) {
        waterInput.style.display = "none";
        document.getElementById("water-input").value = "";
    } else {
        waterInput.style.display = "flex";
    }

    addingWater = !addingWater;
});

waterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputVal = Number(document.getElementById("water-input").value);
    if (isNaN(inputVal) || inputVal < 0) {
        document.getElementById("water-input").value = "";
        document.getElementById("water-quantity").style.display = "none";
        return;
    }

    const key = `day-${activeDay}`;
    let dayData = getOrCreateDayData(activeDay);

    if (!dayData.water) {
        dayData.water = 0;
    }

    dayData.water += inputVal;
    localStorage.setItem(key, JSON.stringify(dayData));
    document.getElementById("water-count").textContent = `${dayData.water}ml / 3000ml`;

    document.getElementById("water-input").value = "";
    document.getElementById("water-quantity").style.display = "none";
});



