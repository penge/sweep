/* global chrome, window, document */

const count = document.getElementById("count");
const sweep = document.getElementById("sweep");
const options = document.getElementById("options");

const init = (countValue) => {
  count.innerText = countValue;

  sweep.addEventListener("click", (event) => {
    event.preventDefault();
    window.close();
  });

  options.addEventListener("click", (event) => {
    event.preventDefault();
    chrome.tabs.create({ url: "/options/options.html" });
  });
};

chrome.runtime.sendMessage({ type: "PREFLIGHT" });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "PREFLIGHT_RESPONSE") {
    init(message.count);
  }
});
