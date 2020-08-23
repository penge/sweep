/* global chrome, console, Promise */


/*** TIME LIMITS ****/

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

const getTimeLimit = () => new Promise((resolve) => {
  chrome.storage.local.get(["days", "hours", "minutes"], local => {
    const { days, hours, minutes } = local;

    const limit =
      (days || 0 * ONE_DAY_MS) +
      (hours || 0 * ONE_HOUR_MS) +
      (minutes || 0 * ONE_MINUTE_MS);

    resolve(limit);
  });
});


/*** TABS LOGIC ***/

const openTabs = {};

const addTab = (id, url, title) => {
  console.log(`Adding ${id}`);
  openTabs[id] = {
    id,
    url,
    title,
    date: new Date(), // current time of adding
  };
};

const removeTab = (id) => {
  if (!(id in openTabs)) {
    return;
  }

  console.log(`Removing ${id}`);
  delete openTabs[id];
};

const preflight = async () => {
  const limit = await getTimeLimit();
  const now = new Date();

  const filtered = Object.values(openTabs).filter(tab => {
    return new Date(tab.date.getTime() + limit) <= now;
  });

  return filtered;
};


/*** EVENTS ***/

chrome.tabs.query({}, (tabs) => {
  tabs.forEach(tab => {
    addTab(tab.id);
  });
});

chrome.tabs.onCreated.addListener((tab) => addTab(tab.id, tab.url, tab.title));
chrome.tabs.onUpdated.addListener((tab) => addTab(tab.id, tab.url, tab.title));
chrome.tabs.onRemoved.addListener((tab) => removeTab(tab.id));


/*** MESSAGES ***/

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === "PREFLIGHT") {
    const preflightTabs = await preflight();
    const preflightTabsCount = preflightTabs.length;

    chrome.runtime.sendMessage({
      type: "PREFLIGHT_RESPONSE",
      count: preflightTabsCount
    });
  }
});
