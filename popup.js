document.addEventListener('DOMContentLoaded', function() {
  const emailList = document.getElementById('email-list');
  const emptyMsg = document.getElementById('empty-message');
  const copyBtn = document.getElementById('copy-btn');
  const clearBtn = document.getElementById('clear-btn');
  const copiedMsg = document.getElementById('copied-msg');

  function renderEmails(emails) {
    emailList.innerHTML = '';
    if (emails.length === 0) {
      emptyMsg.style.display = 'block';
    } else {
      emptyMsg.style.display = 'none';
      emails.forEach(email => {
        const li = document.createElement('li');
        li.textContent = email;
        emailList.appendChild(li);
      });
    }
  }

  chrome.storage.local.get({emails: []}, function(result) {
    renderEmails(result.emails);
  });

  copyBtn.addEventListener('click', function() {
    chrome.storage.local.get({emails: []}, function(result) {
      if (result.emails.length > 0) {
        navigator.clipboard.writeText(result.emails.join('\n')).then(() => {
          copiedMsg.style.display = 'block';
          setTimeout(() => copiedMsg.style.display = 'none', 1200);
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

  // Show version from manifest
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = `- V${manifest.version}`;
});
