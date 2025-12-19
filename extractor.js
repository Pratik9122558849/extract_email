(function() {
  // Get the current domain and remove 'www.' if present
  const currentDomain = window.location.hostname.replace(/^www\./, '');
  
  // Check if the current domain is excluded before extracting emails
  chrome.storage.local.get({excludedDomains: []}, function(result) {
    // Clean up the excluded domains list
    const cleanedExcludedDomains = result.excludedDomains.map(domain => domain.replace(/^www\./, ''));
    
    // Debug logs
    console.log('[Email Extractor] Current domain:', currentDomain);
    console.log('[Email Extractor] Excluded domains:', cleanedExcludedDomains);
    
    // Check if current domain is excluded
    if (cleanedExcludedDomains.some(domain => currentDomain === domain)) {
      console.log('[Email Extractor] Domain is excluded, skipping email extraction');
      return;
    }
    
    // If domain is not excluded, proceed with email extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = document.body.innerText.match(emailRegex) || [];
    
    if (emails.length > 0) {
      console.log('[Email Extractor] Found emails:', emails.length);
      // include the domain where the emails were found so the background
      // script can send this information to the remote endpoint
      chrome.runtime.sendMessage({type: "saveEmails", emails, domain: currentDomain});
    }
  });
})();