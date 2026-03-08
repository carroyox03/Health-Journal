import { redirectIfNotSetup } from './checkSetup.js';

redirectIfNotSetup();

const editButn = document.getElementById("edit-profile-butn");
const changeButn = document.getElementById("change-mode-butn");
const bioBox = document.getElementById("bio-box");
let isEditing = false;
let originalGoals = [];
let originalBioData = null;

const storageKey = "bioData";

const savedData = JSON.parse(localStorage.getItem(storageKey));
if (savedData) {
    for (const [key, value] of Object.entries(savedData)) {
        const span = document.querySelector(`[data-key="${key}"]`);
        if (span) {
            if (key === "water-goal") {
                span.textContent = `${value} ml`;
            } else if (key === "weight") {
                span.textContent = `${value} lbs`;
            } else if (key === "workout-freq") {
                span.textContent = `${value}`;
            } else {
                span.textContent = value;
            }
        }
    }
}



const DARK_MODE_KEY = "darkMode";
function applyDarkMode(enable) {
        if (enable) {
            document.body.classList.add("dark-mode");
            changeButn.textContent = "Light Mode";
        } else {
            document.body.classList.remove("dark-mode");
            changeButn.textContent = "Dark Mode";
        }
}

function buildGoals(goals = []) {
    const goalsList = document.getElementById("goals-list");
    goalsList.innerHTML = "";

    goals.forEach((goal, index) => {
        const li = document.createElement("li");
        li.classList.add("goal-item");

        if (isEditing) {
            const input = document.createElement("input");
            input.type = "text";
            input.value = goal.text;
            input.setAttribute("data-index", index);
            input.classList.add("goal-input");
            input.maxLength = 35;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "x";
            removeBtn.type = "button";
            removeBtn.classList.add("delete-goal");
            removeBtn.onclick = () => {
                savedData.customGoals.splice(index, 1);
                buildGoals(savedData.customGoals);
            };

            li.appendChild(input);
            li.appendChild(removeBtn);
        } else {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = goal.checked || false;
            checkbox.addEventListener("change", () => {
                goal.checked = checkbox.checked;
                localStorage.setItem("bioData", JSON.stringify(savedData));
            })
            const span = document.createElement("span");
            span.textContent = goal.text;

            label.appendChild(checkbox);
            label.appendChild(span);
            li.appendChild(label);
        }

        goalsList.appendChild(li);
    });

    if (isEditing && goals.length < 5) {
        const addBtn = document.createElement("button");
        addBtn.textContent = "Add Goal";
        addBtn.type = "button";
        addBtn.id = "add-goal";
        addBtn.onclick = () => {
            const currentInputs = document.querySelectorAll('.goal-input');
            currentInputs.forEach(input => {
                const index = parseInt(input.getAttribute("data-index"), 10);
                savedData.customGoals[index].text = input.value.trim();
            });
            if (savedData.customGoals.length < 5) {
                savedData.customGoals.push({ text: "", checked: false });
                buildGoals(savedData.customGoals);
            }
        };
        goalsList.appendChild(addBtn);
    }

    const goalHint = document.getElementById("goal-hint");
    if (goalHint) {
        if (!isEditing && goals.length === 0) {
            goalHint.style.display = "inline";
        } else {
            goalHint.style.display = "none";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {

    changeButn.addEventListener("click", () => {
        const currentlyDark = localStorage.getItem(DARK_MODE_KEY) === "true";
        const newMode = !currentlyDark;
        localStorage.setItem(DARK_MODE_KEY, newMode);
        applyDarkMode(newMode);
    });
    
    const darkModeEnabled = localStorage.getItem(DARK_MODE_KEY) === "true";
    applyDarkMode(darkModeEnabled);

    buildGoals(savedData.customGoals);
    const goalHint = document.getElementById("goal-hint");
    if (goalHint) {
        if (!savedData.customGoals || savedData.customGoals.length === 0) {
            goalHint.style.display = "inline";
        } else {
            goalHint.style.display = "none";
        }
    }

    editButn.addEventListener("click", () => {
        if (!isEditing) {
            enterEditMode();
        } else {
            exitEditMode();
        }
    });

    function enterEditMode() {
        isEditing = true;
        Object.assign(savedData, JSON.parse(localStorage.getItem(storageKey)));
        originalBioData = JSON.parse(JSON.stringify(savedData));
        originalGoals = JSON.parse(JSON.stringify(savedData.customGoals));
        editButn.textContent = "Exit Edit";
        
        const spans = document.querySelectorAll(".bio-section span[data-key]");
        spans.forEach((span) => {
            const key = span.getAttribute("data-key");
            let input;

            if (key === "weight") {
                input = document.createElement("input");
                input.type = "number";
                input.min = "0";
                input.value = span.textContent.replace("lbs", "").trim();
                input.setAttribute("data-key", key);
                span.replaceWith(input);
            } else if (key === "height") {
                const text = span.textContent.trim();
                const feetEnd = text.indexOf("'");
                const inchEnd = text.indexOf('"');

                const feet = text.substring(0, feetEnd);
                const inches = text.substring(feetEnd + 1, inchEnd);

                const container = document.createElement("span");
                const feetInput = document.createElement("input");
                feetInput.type = "number";
                feetInput.classList.add("feet-input");
                feetInput.min = "0";
                feetInput.value = feet;
                feetInput.setAttribute("data-key", "height-feet");

                const inchesInput = document.createElement("input");
                inchesInput.type = "number";
                inchesInput.classList.add("inches-input");
                inchesInput.min = "0";
                inchesInput.max = "11";
                inchesInput.value = inches;
                inchesInput.setAttribute("data-key", "height-inches");

                container.append("ft: ", feetInput, " in: ", inchesInput);
                span.replaceWith(container);
            } else if (key === "sex") {
                const currentValue = span.textContent.trim();
                const select = createSelect(key, currentValue, ["Male", "Female"]);
                span.replaceWith(select);
            } else if (["goal", "water-goal", "macro-split", "activity-lvl", "workout-freq"].includes(key)) {
                const currentValue = span.textContent.trim();
                let select;
            
                if (key === "goal") {
                    select = createSelect(key, currentValue, ["Maintain Weight", "Lose 0.5 lbs/week", "Lose 1 lbs/week", "Lose 1.5 lbs/week", "Lose 2 lbs/week", "Gain 0.5 lbs/week", "Gain 1 lbs/week", "Gain 1.5 lbs/week", "Gain 2 lbs/week"]);
                } else if (key === "water-goal") {
                    input = document.createElement("input");
                    input.type = "number";
                    input.min = "0";
                    input.value = parseInt(currentValue);
                    input.setAttribute("data-key", key);
                } else if (key === "macro-split") {
                    select = createSelect(key, currentValue, ["Balanced", "High Protein", "High Carb", "Low Carb"]);
                } else if (key === "activity-lvl") {
                    select = createSelect(key, currentValue, ["Sedentary", "Light", "Moderate", "Active", "Very Active"]);
                } else if (key === "workout-freq") {
                    select = createSelect(key, currentValue, ["1 Day", "2 Days", "3 Days", "4 Days", "5 Days", "6 Days", "7 Days"]);
                }
                span.replaceWith(input || select);
            } else {
                input = document.createElement("input");
                input.value = span.textContent.trim();
                input.setAttribute("data-key", key);
                span.replaceWith(input);
            }
        });

        buildGoals(savedData.customGoals);
        const goalHint = document.getElementById("goal-hint");
        if (goalHint) {
            goalHint.style.display = "none";
        }
    }


    function exitEditMode() {
        const editableElements = document.querySelectorAll('.bio-section input[data-key], .bio-section select[data-key]');
        if (editableElements.length === 0) return;
    
        const shouldSave = confirm("Do you want to save your changes?");
        let dataToSave = {};
    
        if (shouldSave) {
            editableElements.forEach((input) => {
                const key = input.getAttribute("data-key");
                const value = input.value.trim();
    
                if (key === "height-feet" || key === "height-inches") return;
    
                const span = document.createElement("span");
                span.setAttribute("data-key", key);
    
                if (key === "weight") {
                    dataToSave[key] = value;
                    span.textContent = ` ${value} lbs`;
                } else if (key === "water-goal") {
                    dataToSave[key] = value;
                    span.textContent = `${value} ml`;
                } else if (["goal", "macro-split"].includes(key)) {
                    dataToSave[key] = value;
                    span.textContent = value;
                } else if (key === "workout-freq") {
                    dataToSave[key] = value;
                    span.textContent = value;
                } else {
                    dataToSave[key] = value;
                    span.textContent = ` ${value}`;
                }
    
                input.parentElement.replaceChild(span, input);
            });
    
            const feetInput = document.querySelector('input[data-key="height-feet"]');
            const inchesInput = document.querySelector('input[data-key="height-inches"]');
            if (feetInput && inchesInput) {
                const heightValue = `${feetInput.value}'${inchesInput.value}"`;
                const span = document.createElement("span");
                span.setAttribute("data-key", "height");
                span.textContent = ` ${heightValue}`;
    
                dataToSave["height"] = heightValue;
                feetInput.parentElement.replaceWith(span);
            }



            const goalInputs = document.querySelectorAll('#goals-list input[type="text"]');
            const newGoals = [];
            goalInputs.forEach(input => {
                const text = input.value.trim();
                if (text !== "") {
                    newGoals.push({ text, checked: false });
                }
            });
            dataToSave.customGoals = newGoals;
            savedData.customGoals = newGoals;
            localStorage.setItem(storageKey, JSON.stringify(dataToSave));
            buildGoals(savedData.customGoals);

        } else {
            Object.assign(savedData, originalBioData);
            savedData.customGoals = JSON.parse(JSON.stringify(originalGoals));
            const goalHint = document.getElementById("goal-hint");
            if (goalHint) {
                goalHint.style.display = savedData.customGoals.length === 0 ? "inline" : "none";
            }

            editableElements.forEach((input) => {
                const key = input.getAttribute("data-key");
                const span = document.createElement("span");
                span.setAttribute("data-key", key);
    
                if (key === "weight") {
                    span.textContent = ` ${savedData?.[key] || input.value} lbs`;
                    input.parentElement.replaceChild(span, input);
                } else if (key === "height-feet" || key === "height-inches") {
                    const heightStr = savedData?.["height"] || `${input.value}'0"`;
                    const heightSpan = document.createElement("span");
                    heightSpan.setAttribute("data-key", "height");
                    heightSpan.textContent = ` ${heightStr}`;
                    input.parentElement.replaceWith(heightSpan);
                } else if (key === "water-goal") {
                    span.textContent = ` ${savedData?.[key] || input.value} ml`;
                    input.parentElement.replaceChild(span, input);
                } else if (key === "workout-freq") {
                    span.textContent = ` ${savedData?.[key] || input.value}`;
                    input.parentElement.replaceChild(span, input);
                } else {
                    span.textContent = ` ${savedData?.[key] || input.value}`;
                    input.parentElement.replaceChild(span, input);
                }
            });
        }
    
        isEditing = false;
        buildGoals(savedData.customGoals);
        editButn.textContent = "Edit Profile";
    }
});

function createSelect(key, currentValue, options) {
    const select = document.createElement("select");
    select.setAttribute("data-key", key);

    options.forEach(optionVal => {
        const option = document.createElement("option");
        option.value = optionVal;
        option.textContent = optionVal;
        if (optionVal.toLowerCase().trim() === currentValue.toLowerCase().trim()) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    return select;
}

const deleteProfileBtn = document.getElementById("delete-profile");
deleteProfileBtn.addEventListener('click', () => {
    const confirmDeletion = confirm("Are you sure you want to delete your profile? (This can't be undone!)");
    if (confirmDeletion) {
        localStorage.clear();
        window.location.href = "./setup.html";
    }

});

const exportBtn = document.getElementById("export-profile");

exportBtn.addEventListener("click", () => {
    let filename = "profile.json";
    const bio = JSON.parse(localStorage.getItem("bioData"));
    if (bio && bio.name) {
        const parts = bio.name.split(" ");
        filename = parts.join("_").toLowerCase() + "_profile.json";
    }

    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        allData[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
});



