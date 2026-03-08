export function redirectIfNotSetup() {
    const hasBio = localStorage.getItem("bioData");
    const hasTheme = localStorage.getItem("darkMode");

    if (!hasBio || hasTheme === null) {
        window.location.href = "setup.html";
    }
}