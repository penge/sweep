/* global chrome, console, Promise */

/*** INSTALLATION ***/

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["folder", "days", "hours", "minutes"], local => {
    const { folder, days, hours, minutes } = local;

    const validFolder = folder || "Sweep";
    const validDays = (typeof days === "number" && days >= 0 && days <= 30) ? days : 0;
    const validHours = (typeof hours === "number" && hours >= 0 && hours <= 23) ? hours : 0;
    const validMinutes = (typeof minutes === "number" && minutes >= 0 && minutes <= 59) ? minutes : 0;

    chrome.storage.local.set({
      folder: validFolder,
      days: validDays,
      hours: validHours,
      minutes: validMinutes,
    });
  });
});


/*** TIME LIMITS ****/

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_MINUTE_MS = 60 * 1000;

const getTimeLimit = () => new Promise((resolve) => {
  chrome.storage.local.get(["days", "hours", "minutes"], local => {
    const { days, hours, minutes } = local;
    const limit = (days * ONE_DAY_MS) + (hours * ONE_HOUR_MS) + (minutes * ONE_MINUTE_MS);
    resolve(limit);
  });
});


/*** TABS LOGIC ***/

const openTabs = {};

const canBookmark = (tab) =>
  tab.title &&
  tab.url &&
  tab.title !== "New Title" &&
  tab.url.includes("http") === true &&
  tab.url.includes("soundcloud.com") === false;

const addTab = (id, title, url) => {
  if (!canBookmark({ title, url })) {
    removeTab(id);
    return;
  }

  console.log(`Adding ${id}, ${title}, ${url}`);
  openTabs[id] = {
    id,
    title,
    url,
    date: new Date(), // current time of adding
  };
};

const removeTab = (tabId) => {
  if (!(tabId in openTabs)) {
    return;
  }

  console.log(`Removing ${tabId}`);
  delete openTabs[tabId];
};

const preflight = async () => {
  const limit = await getTimeLimit();
  const now = new Date();

  const filtered = Object.values(openTabs).filter(tab => {
    return new Date(tab.date.getTime() + limit) <= now;
  });

  return filtered;
};

const findOrCreateBookmarkFolder = (parentId, title) => new Promise((resolve) => {
  chrome.bookmarks.getChildren(parentId, (nodes) => {
    const existingNode = nodes.find(node => node.title === title);
    const existingNodeId = existingNode && existingNode.id;

    if (existingNodeId) {
      resolve(existingNodeId);
      return;
    }

    const bookmark = {
      parentId,
      title,
    };

    chrome.bookmarks.create(bookmark, (result) => {
      resolve(result.id);
    });
  });
});

const bookmark = async (folderName, tabs) => {
  if (!tabs.length) {
    return;
  }

  // 1. Find or create main folder
  const mainFolderId = await findOrCreateBookmarkFolder("1", folderName);
  console.log(`Entry folder ${mainFolderId}`);

  // 2. Find or create months subfolder
  for (let index = 0; index < tabs.length; index += 1) {
    const tab = tabs[index];

    if (!canBookmark(tab)) {
      removeTab(tab.id);
      continue;
    }

    const yearNumber = tab.date.getFullYear();
    const monthNumber = tab.date.getMonth() + 1; // index starts from 0
    const dayNumber = tab.date.getDate();

    const yearFolderId = await findOrCreateBookmarkFolder(mainFolderId, yearNumber.toString());
    const monthFolderId = await findOrCreateBookmarkFolder(yearFolderId, monthNumber.toString());
    const dayFolderId = await findOrCreateBookmarkFolder(monthFolderId, dayNumber.toString());

    const bookmark = {
      parentId: dayFolderId,
      title: tab.title,
      url: tab.url,
    };

    chrome.bookmarks.create(bookmark, (result) => {
      console.log(`Bookmarking ${tab.id} under ${mainFolderId}/${monthFolderId}/${dayFolderId} as ${result.id}`);
    });

    removeTab(tab.id);
    chrome.tabs.remove(tab.id);
  }

  // 3. Have a beer ;)
};


/*** EVENTS ***/

chrome.tabs.query({}, (tabs) => {
  tabs.forEach(tab => {
    addTab(tab.id, tab.title, tab.url);
  });
});

chrome.tabs.onCreated.addListener((tab) => addTab(tab.id, tab.title, tab.url));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => addTab(tab.id, tab.title, tab.url));
chrome.tabs.onRemoved.addListener((tabId) => removeTab(tabId));


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

  if (message.type === "BOOKMARK") {
    const preflightTabs = await preflight();
    chrome.storage.local.get(["folder"], async (local) => {
      await bookmark(local.folder, preflightTabs);
    });
  }
});
