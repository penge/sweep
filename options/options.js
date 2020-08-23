/* global document */

/*** INPUTS ***/

const days = document.getElementById("days");
const hours = document.getElementById("hours");
const minutes = document.getElementById("minutes");

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

});
