import { getTodayKey, formatDateKey, parseDateKey } from './dateUtils.js';
import { redirectIfNotSetup } from './checkSetup.js';
import { getCycleDay } from './calculations.js';

redirectIfNotSetup();

const DARK_MODE_KEY = "darkMode";
const BIO_KEY = "bioData";
const START_DATE_KEY = "workout-start-date";

const dayLabel = document.getElementById("day-label");
const splitName = document.getElementById("split-name");
const listsDiv = document.getElementById("lists-div");
const prevDayBtn = document.getElementById("prev-day");
const nextDayBtn = document.getElementById("next-day");

let activeDay = getTodayKey();
localStorage.setItem("current-day", activeDay); 

document.addEventListener("DOMContentLoaded", () => {

    const bioData = JSON.parse(localStorage.getItem(BIO_KEY));
    if (!bioData || !bioData["workout-freq"]) {
        return;
    }

    const splitStr = bioData["workout-freq"];
    const splitDays = parseInt(splitStr);

    if (!localStorage.getItem(START_DATE_KEY)) {
        localStorage.setItem(START_DATE_KEY, getTodayKey());
    }

    applyDarkMode(localStorage.getItem(DARK_MODE_KEY) === "true");

    updateDayLabel();
    renderSplitForDay(activeDay, splitDays, bioData);
});

function applyDarkMode(enable) {
    if (enable) {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

function updateDayLabel() {
    const displayDate = parseDateKey(activeDay);
    const options = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    dayLabel.textContent = displayDate.toLocaleDateString(undefined, options);
}

prevDayBtn.addEventListener('click', () => {
    const prev = parseDateKey(activeDay);
    prev.setDate(prev.getDate() - 1);
    activeDay = formatDateKey(prev);
    localStorage.setItem("current-day", activeDay);

    const bioData = JSON.parse(localStorage.getItem(BIO_KEY));
    const splitDays = parseInt(bioData["workout-freq"]);
    updateDayLabel();
    renderSplitForDay(activeDay, splitDays, bioData);
});

nextDayBtn.addEventListener('click', () => {
    const next = parseDateKey(activeDay);
    next.setDate(next.getDate() + 1);
    activeDay = formatDateKey(next);
    localStorage.setItem("current-day", activeDay);

    const bioData = JSON.parse(localStorage.getItem(BIO_KEY));
    const splitDays = parseInt(bioData["workout-freq"]);
    updateDayLabel();
    renderSplitForDay(activeDay, splitDays, bioData);
});

function renderSplitForDay(dateKey, splitDays, bioData) {
    const workoutSplits = {
        1: [
            { name: "Full Body Day", groups: {
                Chest: ["Incline Dumbbell Press", "Push-Ups"],
                Back: ["Lat Pulldown", "Dumbbell Row"],
                Legs: ["Goblet Squat", "Romanian Deadlift"],
                Core: ["Plank", "Hanging Leg Raise"]
            }}
        ],
    
        2: [
            { name: "Upper Body Day", groups: {
                Chest: ["Bench Press", "Cable Fly"],
                Back: ["Pull-Ups", "Seated Row"],
                Shoulders: ["Lateral Raises", "Overhead Press"],
                Arms: ["Barbell Curl", "Tricep Pushdown"]
            }},
            { name: "Lower Body + Core Day", groups: {
                Quads: ["Barbell Squat", "Walking Lunge"],
                Hamstrings: ["Deadlift", "Leg Curl"],
                Calves: ["Standing Calf Raise", "Seated Calf Raise"],
                Core: ["Weighted Sit-Ups", "Russian Twists"]
            }}
        ],
    
        3: [
            { name: "Push Day", groups: {
                Chest: ["Incline Bench Press", "Cable Chest Flies"],
                Shoulders: ["Overhead Press", "Lateral Raises"],
                Tricep: ["Skullcrushers", "Tricep Dips"]
            }},
            { name: "Pull Day", groups: {
                Back: ["Barbell Row", "Lat Pulldown"],
                Bicep: ["EZ Bar Curl", "Incline Dumbbell Curl"],
                RearDelt: ["Face Pulls", "Reverse Pec Deck"]
            }},
            { name: "Leg Day", groups: {
                Quads: ["Front Squat", "Leg Press"],
                Hamstrings: ["Romanian Deadlift", "Hamstring Curl"],
                Calves: ["Seated Calf Raise", "Donkey Calf Raise"]
            }}
        ],
    
        4: [
            { name: "Upper Strength", groups: {
                Chest: ["Barbell Bench Press", "Incline DB Press"],
                Back: ["Pull-Ups", "Pendlay Row"],
                Shoulders: ["Overhead Press", "Shrugs"],
                Arms: ["Preacher Curl", "Rope Pushdown"]
            }},
            { name: "Lower Strength", groups: {
                Quads: ["Back Squat", "Walking Lunges"],
                Hamstrings: ["Deadlift", "Lying Leg Curl"],
                Core: ["Weighted Crunch", "Cable Twists"],
                Calves: ["Standing Calf Raise", "Single Leg Calf Raise"]
            }},
            { name: "Cardio + Core", groups: {
                Cardio: ["30-min HIIT", "Rowing Machine"],
                Core: ["Plank Variations", "Hanging Leg Raise", "Bicycle Crunches"]
            }},
            { name: "Legs", groups: {
                Quads: ["Leg Extensions", "Step Ups"],
                Hamstrings: ["Single Leg RDL", "Glute Ham Raise"],
                Glutes: ["Hip Thrust", "Cable Kickbacks"]
            }}
        ],
    
        5: [
            { name: "Chest + Triceps", groups: {
                Chest: ["Flat Bench", "Incline Dumbbell Fly"],
                Triceps: ["Rope Pushdown", "Close-Grip Bench Press"]
            }},
            { name: "Back + Biceps", groups: {
                Back: ["Deadlifts", "Lat Pulldown", "Chest-Supported Row"],
                Biceps: ["Concentration Curl", "Cable Curl"]
            }},
            { name: "Legs", groups: {
                Quads: ["Hack Squat", "Bulgarian Split Squat"],
                Hamstrings: ["Stiff-Leg Deadlift", "Leg Curl"],
                Calves: ["Seated Calf Raise", "Tibialis Raise"]
            }},
            { name: "Shoulders + Abs", groups: {
                Shoulders: ["Military Press", "Lateral Raise", "Rear Delt Fly"],
                Core: ["Cable Crunch", "Hanging Knee Raise"]
            }},
            { name: "Cardio + Mobility", groups: {
                Cardio: ["Stairmaster Intervals", "Incline Walk 20 min"],
                Mobility: ["Foam Roll", "Dynamic Stretching"]
            }}
        ],
    
        6: [
            { name: "Push", groups: {
                Chest: ["Incline Bench", "Cable Flies"],
                Shoulders: ["Arnold Press", "Front Raise"],
                Triceps: ["Overhead Rope Extension", "Bench Dips"]
            }},
            { name: "Pull", groups: {
                Back: ["T-Bar Row", "Lat Pulldown"],
                Biceps: ["Barbell Curl", "Incline Curl"],
                RearDelt: ["Face Pulls", "Band Pull-Aparts"]
            }},
            { name: "Legs", groups: {
                Quads: ["Squats", "Leg Press"],
                Hamstrings: ["Hip Hinge RDL", "Leg Curl"],
                Calves: ["Smith Calf Raise", "Donkey Raise"]
            }},
            { name: "Push 2", groups: {
                Chest: ["Flat Dumbbell Press", "Machine Fly"],
                Shoulders: ["Machine Press", "Upright Row"],
                Triceps: ["Kickbacks", "Overhead Skullcrusher"]
            }},
            { name: "Pull 2", groups: {
                Back: ["Meadows Row", "Pull-Ups"],
                Biceps: ["Cable Curl", "Hammer Curl"],
                Core: ["Weighted Plank", "Decline Sit-Up"]
            }},
            { name: "Core + Cardio", groups: {
                Cardio: ["Assault Bike Intervals", "Jump Rope"],
                Core: ["V-Ups", "Cable Rotations", "Leg Raises"]
            }}
        ],
    
        7: [
            { name: "Push A", groups: {
                Chest: ["Incline Bench", "Cable Crossover"],
                Shoulders: ["DB Press", "Lateral Raise"],
                Triceps: ["Skullcrushers", "Triceps Dip"]
            }},
            { name: "Pull A", groups: {
                Back: ["Weighted Pull-Ups", "Dumbbell Row"],
                Biceps: ["EZ Curl", "Spider Curl"],
                RearDelt: ["Reverse Pec Deck", "Face Pulls"]
            }},
            { name: "Legs A", groups: {
                Quads: ["Squat", "Leg Extension"],
                Hamstrings: ["Stiff-Leg Deadlift", "Lying Curl"],
                Glutes: ["Hip Thrust", "Cable Abduction"]
            }},
            { name: "Active Recovery", groups: {
                Cardio: ["Zone 2 Treadmill (45min)", "Swimming"],
                Mobility: ["Yoga Flow", "Foam Rolling"]
            }},
            { name: "Push B", groups: {
                Chest: ["Flat DB Press", "Dips"],
                Shoulders: ["Landmine Press", "Cable Lateral Raise"],
                Triceps: ["Pushdown", "OH Extension"]
            }},
            { name: "Pull B", groups: {
                Back: ["Deadlift", "Cable Row"],
                Biceps: ["Preacher Curl", "Incline Curl"],
                Core: ["Cable Crunch", "Ab Rollouts"]
            }},
            { name: "Legs B", groups: {
                Quads: ["Front Squat", "Step-Ups"],
                Hamstrings: ["Good Mornings", "Leg Curl Machine"],
                Calves: ["Donkey Calf Raise", "Single Leg Calf Raise"]
            }}
        ]
    };
    

    const startDateStr = localStorage.getItem(START_DATE_KEY);
    const cycleDay = getCycleDay(7, startDateStr, dateKey);
    const splitPlan = workoutSplits[splitDays];
    let plan = null;
    if (splitPlan && cycleDay < splitPlan.length) {
        plan = splitPlan[cycleDay];
    }

    if (!plan) {
        splitName.textContent = "Rest Day";
        listsDiv.innerHTML = "";
    
        const restDiv = document.createElement("div");
        restDiv.id = "rest-div"
    
        restDiv.textContent = "Take this time to recover, hydrate, and focus on eating healthy";
    
        listsDiv.appendChild(restDiv);
        return;
    }

    splitName.textContent = plan.name;
    listsDiv.innerHTML = "";

    for (const [muscle, exercises] of Object.entries(plan.groups)) {
        const div = document.createElement("div");
        div.classList.add("muscle-box");
        const label = document.createElement("label");
        label.textContent = muscle;
        if (label.textContent === "RearDelt") {
            label.textContent = "Rear Delt";
        }

        const ul = document.createElement("ul");
        ul.classList.add("exercise-list");
        exercises.forEach(ex => {
            const li = document.createElement("li");
            li.textContent = ex;
            ul.appendChild(li);
        });

        div.appendChild(label);
        div.appendChild(ul);
        listsDiv.appendChild(div);
    }
}