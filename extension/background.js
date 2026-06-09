const BASE_URL = "https://test-repo-seven-lyart.vercel.app";

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "3csearch",
    title: '3C Search: "%s"',
    contexts: ["selection"],
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "3csearch" && info.selectionText) {
    const query = info.selectionText.trim().slice(0, 200);
    chrome.tabs.create({
      url: `${BASE_URL}/?q=${encodeURIComponent(query)}`,
    });
  }
});
