/* global chrome, window, document */

const count = document.getElementById("count");
const sweep = document.getElementById("sweep");
const options = document.getElementById("options");

/*** INIT ***/

const init = (countValue) => {
  count.innerText = countValue;

  if (countValue > 0) {
    sweep.addEventListener("click", (event) => {
      event.preventDefault();
      chrome.runtime.sendMessage({ type: "BOOKMARK" });
      window.close();
    });

    sweep.classList.remove("hide");
  }

  options.addEventListener("click", (event) => {
    event.preventDefault();
    chrome.tabs.create({ url: "/options/options.html" });
  });
};


/*** PREFLIGHT ***/

chrome.runtime.sendMessage({ type: "PREFLIGHT" });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PREFLIGHT_RESPONSE") {
    init(message.count);
  }
});
