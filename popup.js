document.addEventListener('DOMContentLoaded', function() {
  const emailList = document.getElementById('email-list');
  const emptyMsg = document.getElementById('empty-message');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copiedMsg = document.getElementById('copied-msg');
  const settingsBtn = document.getElementById('settings-btn');
  const refetchBtn = document.getElementById('refetch-btn');

  function renderEmails(emails) {
    emailList.innerHTML = '';
    if (emails.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      emails.forEach(email => {
        const li = document.createElement('li');
        li.className = 'ee-email-item';
        li.textContent = email;
        emailList.appendChild(li);
      });
    }
  }

  chrome.storage.local.get({emails: []}, function(result) {
    renderEmails(result.emails);
  });

  // Update UI when stored emails change (e.g., after a re-fetch)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.emails) {
      renderEmails(changes.emails.newValue || []);
    }
  });

  copyBtn.addEventListener('click', function() {
    chrome.storage.local.get({emails: []}, function(result) {
      if (result.emails.length > 0) {
        navigator.clipboard.writeText(result.emails.join('\n')).then(() => {
          copiedMsg.style.display = 'block';
          setTimeout(() => copiedMsg.style.display = 'none', 1200);

          // Trigger heart animation
          const heart = document.querySelector('.heart');
          heart.classList.remove('animate'); // Reset animation
          void heart.offsetWidth; // Force reflow
          heart.classList.add('animate');
          
          // Remove animation class after it completes
          setTimeout(() => {
            heart.classList.remove('animate');
          }, 1000);
        });
      }
    });
  });

  clearBtn.addEventListener('click', function() {
    chrome.storage.local.set({emails: []}, function() {
      renderEmails([]);
    });
  });

  // Notification toggle
  const notifyToggle = document.getElementById('notify-toggle');
  chrome.storage.local.get({notificationsEnabled: true}, function(result) {
    notifyToggle.checked = result.notificationsEnabled;
  });
  notifyToggle.addEventListener('change', function() {
    chrome.storage.local.set({notificationsEnabled: notifyToggle.checked});
  });

  // Settings functionality
  const viewsContainer = document.querySelector('.ee-views-container');
  const settingsView = document.getElementById('settings-view');
  const backBtn = document.getElementById('back-btn');
  const domainInput = document.getElementById('domain-input');
  const addDomainBtn = document.getElementById('add-domain');
  const currentTabBtn = document.getElementById('current-tab-btn');
  const excludedDomainsList = document.getElementById('excluded-domains');

  // Show settings view
  settingsBtn.addEventListener('click', function() {
    viewsContainer.classList.add('show-settings');
  });

  // Re-fetch emails from the current tab by injecting the extractor script
  refetchBtn.addEventListener('click', function() {
    refetchBtn.disabled = true;
    const prevHTML = refetchBtn.innerHTML;
    refetchBtn.innerHTML = '<span class="ee-settings-icon"><i class="material-icons">refresh</i></span> Fetching...';
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0] || !tabs[0].id) {
        refetchBtn.disabled = false;
        refetchBtn.innerHTML = prevHTML;
        return;
      }
      chrome.scripting.executeScript({target: {tabId: tabs[0].id}, files: ['extractor.js']})
        .then(() => {
          // Allow extractor to run and post messages
          setTimeout(() => {
            chrome.storage.local.get({emails: []}, function(result) { renderEmails(result.emails); });
            refetchBtn.disabled = false;
            refetchBtn.innerHTML = prevHTML;
          }, 800);
        })
        .catch(err => {
          console.error('[Email Extractor] Re-fetch failed:', err);
          refetchBtn.disabled = false;
          refetchBtn.innerHTML = prevHTML;
        });
    });
  });

  // Back to main view
  backBtn.addEventListener('click', function() {
    viewsContainer.classList.remove('show-settings');
  });

  function renderExcludedDomains(domains) {
    excludedDomainsList.innerHTML = '';
    domains.forEach(domain => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${domain}</span>
        <button class="ee-delete-btn" data-domain="${domain}">Delete</button>
      `;
      excludedDomainsList.appendChild(li);
    });
  }

  // Load excluded domains
  chrome.storage.local.get({excludedDomains: []}, function(result) {
    renderExcludedDomains(result.excludedDomains);
  });

  // Function to add a domain to the exclusion list
  function addDomainToExclusions(domain) {
    domain = domain.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    if (domain) {
      chrome.storage.local.get({excludedDomains: []}, function(result) {
        const cleanedExistingDomains = result.excludedDomains.map(d => d.replace(/^www\./, ''));
        
        if (!cleanedExistingDomains.includes(domain)) {
          const newDomains = [...result.excludedDomains, domain];
          chrome.storage.local.set({excludedDomains: newDomains}, function() {
            renderExcludedDomains(newDomains);
            domainInput.value = '';
          });
        }
      });
    }
  }

  // Add new domain from input
  addDomainBtn.addEventListener('click', function() {
    addDomainToExclusions(domainInput.value);
  });

  // Add current tab's domain
  currentTabBtn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url) {
        const url = new URL(tabs[0].url);
        addDomainToExclusions(url.hostname);
      }
    });
  });

  // Delete domain
  excludedDomainsList.addEventListener('click', function(e) {
    if (e.target.classList.contains('ee-delete-btn')) {
      const domainToDelete = e.target.getAttribute('data-domain');
      chrome.storage.local.get({excludedDomains: []}, function(result) {
        const newDomains = result.excludedDomains.filter(d => d !== domainToDelete);
        chrome.storage.local.set({excludedDomains: newDomains}, function() {
          renderExcludedDomains(newDomains);
        });
      });
    }
  });

  // Show version from manifest
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = `- V${manifest.version}`;
});
