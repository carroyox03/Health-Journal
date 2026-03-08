document.addEventListener('DOMContentLoaded', function() {
  const navExpand = document.getElementById("nav-expand");
  const menuBar = document.getElementById("menubar");

  navExpand.addEventListener("click", () => {
    menuBar.classList.toggle("show");
    navExpand.classList.toggle("rotated");
  });

  fetchWorldTime();
});

async function fetchWorldTime() {
  try {
    const response = await fetch("https://worldtimeapi.org/api/ip");
    const data = await response.json();

    const datetime = new Date(data.datetime);
    updateClockDisplay(datetime);

    setInterval(() => {
      datetime.setSeconds(datetime.getSeconds() + 1);
      updateClockDisplay(datetime);
    }, 1000);
  } catch (error) {
    console.error("Failed to fetch time:", error);
    const fallback = new Date();
    startClock(fallback);
  }
}

function updateClockDisplay(dateObj) {
  const timeStr = dateObj.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  document.getElementById("world-clock").textContent = `${timeStr}`;
}

function startClock(datetime) {
  updateClockDisplay(datetime);

  setInterval(() => {
    datetime.setSeconds(datetime.getSeconds() + 1);
    updateClockDisplay(datetime);
  }, 1000);
}
