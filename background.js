function injectExtractor(tabId, url) {
  if (/^https?:/.test(url)) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["extractor.js"]
    });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    
    injectExtractor(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.status === "complete" && tab.url) {
      
      injectExtractor(tab.id, tab.url);
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "saveEmails" && Array.isArray(message.emails)) {
    chrome.storage.local.get({emails: [], notificationsEnabled: true}, function(result) {
      const savedEmails = new Set(result.emails);
      let newEmails = [];
      message.emails.forEach(email => {
        if (!savedEmails.has(email)) {
          newEmails.push(email);
          savedEmails.add(email);
        }
      });
      chrome.storage.local.set({emails: Array.from(savedEmails)}, () => {
        if (newEmails.length > 0 && result.notificationsEnabled) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Email Extracted",
            message: `Found ${newEmails.length} new email${newEmails.length > 1 ? 's' : ''}!`
          });
        }
      });
    });
  }
});