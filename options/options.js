/* global chrome, document */

/*** INPUTS ***/

const folder = document.getElementById("folder");

const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");


/*** INPUT EVENTS ***/

folder.addEventListener("blur", () => {
  if (!folder.value) {
    folder.value = "Sweep";
  }
});

[folder, days, hours, minutes].forEach(input => {
  input.addEventListener("input", () => {
    save.innerText = "Save"; // reset button text after previous saving
  });
});

[days, hours, minutes].forEach(input => {
  input.addEventListener("input", () => {
    const { min, max, value } = input;
    const parsedValued = parseInt(value);

    if (parsedValued < min) {
      input.value = min;
    }

    if (parsedValued > max) {
      input.value = max;
    }
  });
});


/*** SAVE ***/

const save = document.getElementById("save");

save.addEventListener("click", (event) => {
  event.preventDefault();

  chrome.storage.local.set({
    folder: folder.value,
    days: parseInt(days.value),
    hours: parseInt(hours.value),
    minutes: parseInt(minutes.value),
  }, () => {
    save.innerText = "Saved!";
  });
});


/*** INIT ***/

chrome.storage.local.get(["folder", "days", "hours", "minutes"], (local) => {
  folder.value = local.folder;

  days.value = local.days;
  hours.value = local.hours;
  minutes.value = local.minutes;

  document.body.classList.add("loaded");
});
