(function() {
  // Get the current domain and remove 'www.' if present
  const currentDomain = window.location.hostname.replace(/^www\./, '');

  // First check if the current domain is excluded
  chrome.storage.local.get({excludedDomains: []}, function(result) {
    // Clean up the excluded domains to remove 'www.' if present
    const cleanedExcludedDomains = result.excludedDomains.map(domain => domain.replace(/^www\./, ''));
    
    console.log('Current domain:', currentDomain);
    console.log('Excluded domains:', cleanedExcludedDomains);

    if (cleanedExcludedDomains.some(domain => currentDomain === domain)) {
      console.log('Domain is excluded, skipping email extraction');
      return;
    }

    // If domain is not excluded, proceed with email extraction
    // Normalize common obfuscations like [dot], [at] (case-insensitive, optional spaces)
    const pageText = document.body.innerText;
    const normalizedText = pageText
      .replace(/\s*\[\s*dot\s*\]\s*/gi, '.')
      .replace(/\s*\[\s*at\s*\]\s*/gi, '@')
      .replace(/\s*\(\s*dot\s*\)\s*/gi, '.')
      .replace(/\s*\(\s*at\s*\)\s*/gi, '@');
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = normalizedText.match(emailRegex) || [];

    if (emails.length > 0) {
      chrome.storage.local.get({emails: []}, function(result) {
        const savedEmails = new Set(result.emails);
        emails.forEach(email => savedEmails.add(email));
        chrome.storage.local.set({emails: Array.from(savedEmails)});
      });
    }
  });
})();