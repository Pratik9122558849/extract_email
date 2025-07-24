(function() {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = document.body.innerText.match(emailRegex) || [];
  if (emails.length > 0) {
    chrome.runtime.sendMessage({type: "saveEmails", emails});
  }
})();