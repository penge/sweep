/* global chrome, console */

/*** MAIN LOGIC ***/

const openTabs = {};
const ONE_MINUTE = 0;

const addTab = (id, url, title) => {
  console.log(`Adding ${id}`);
  openTabs[id] = {
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

const bookmarkTab = (id) => {
  if (!(id in openTabs)) {
    return;
  }

  chrome.bookmarks.search("MyNewSpecial", (results) => {
    console.log(results);
  });
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

/*** TOOLBAR ICON CLICK ***/

// chrome.browserAction.onClicked.addListener(() => {
//   const now = new Date();
//   const keys = Object.keys(openTabs);

//   for (const tabId of keys) {
//     if (now < new Date(openTabs[tabId].getTime() + ONE_MINUTE)) {
//       console.log("Skipping", tabId);
//       continue;
//     }

//     const parsedTabId = parseInt(tabId);
//     bookmarkTab(parsedTabId);
//     removeTab(parsedTabId);
//   }
// });
