import { getTodayKey } from "./dateUtils.js";

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("bioData")) {
        window.location.href = "./index.html";
        return;
    }

    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            const selectedTheme = document.querySelector('input[name="theme"]:checked')?.value;
            if (selectedTheme === "dark") {
                document.body.classList.add("dark-mode");
            } else {
                document.body.classList.remove("dark-mode");

            }
        });
    });

    const form = document.getElementById("setup-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);

        const name = formData.get("name").trim();
        const age = parseInt(formData.get("age"), 10);
        const sex = formData.get("sex");
        const heightFeet = parseInt(formData.get("height-feet"), 10);
        const heightInches = parseInt(formData.get("height-inches"), 10);
        const height = `${heightFeet}'${heightInches}"`;
        const weight = parseInt(formData.get("weight"), 10);
        const goal = formData.get("goal");
        const waterGoal = parseInt(formData.get("waterGoal"), 10);
        const macroSplit = formData.get("macroSplit");
        const activityLvl = formData.get("activityLvl");
        const workoutFreq = formData.get("workoutFreq");
        const theme = formData.get("theme");

        const bioData = {
            name,
            age,
            sex,
            height,
            weight,
            goal,
            "water-goal": waterGoal,
            "macro-split": macroSplit,
            "activity-lvl": activityLvl,
            "workout-freq": workoutFreq,
            customGoals: []
        };

        localStorage.setItem("bioData", JSON.stringify(bioData));
        localStorage.setItem("darkMode", theme === "dark");
        localStorage.setItem("workout-start-date", getTodayKey());
        localStorage.setItem("current-day", getTodayKey());

        window.location.href = "./index.html";
    });

    const importButn = document.getElementById("import-btn");
    importButn.addEventListener('click', () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "application/json";

        fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (typeof data !== "object") {
                        throw new Error();
                    }

                    localStorage.clear();

                    for (const [key, value] of Object.entries(data)) {
                        localStorage.setItem(key, value);
                    }

                    if (localStorage.getItem("bioData")) {
                        window.location.href = "./index.html";
                    } else {
                        alert("Imported file doesn't contain a valid profile.");
                    }
                } catch (err) {
                    alert("Failed to import a valid JSON profile file");
                }
            };

            reader.readAsText(file);
        });

        fileInput.click();
    });
});