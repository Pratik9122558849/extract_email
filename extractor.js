(function() {
  // Get the current domain and remove 'www.' if present
  const currentDomain = window.location.hostname.replace(/^www\./, '');
  
  // Check if the current domain is excluded before extracting emails
  chrome.storage.local.get({excludedDomains: []}, function(result) {
    // Clean up the excluded domains list
    const cleanedExcludedDomains = result.excludedDomains.map(domain => domain.replace(/^www\./, ''));
    
    // Debug logs
    //console.log('[Email Extractor] Current domain:', currentDomain);
    //console.log('[Email Extractor] Excluded domains:', cleanedExcludedDomains);
    
    // Check if current domain is excluded
    if (cleanedExcludedDomains.some(domain => currentDomain === domain)) {
      //console.log('[Email Extractor] Domain is excluded, skipping email extraction');
      return;
    }
    

    function normalizeText(text) {
      return (text || '')
        .replace(/\s*\[\s*dot\s*\]\s*/gi, '.')
        .replace(/\s*\[\s*at\s*\]\s*/gi, '@')
        .replace(/\s*\(\s*dot\s*\)\s*/gi, '.')
        .replace(/\s*\(\s*at\s*\)\s*/gi, '@')
        .replace(/&#91;\s*dot\s*&#93;/gi, '.')
        .replace(/&#91;\s*at\s*&#93;/gi, '@')
        .replace(/&#40;\s*dot\s*&#41;/gi, '.')
        .replace(/&#40;\s*at\s*&#41;/gi, '@');
    }
    function decodeHTML(html) {
      const txt = document.createElement('textarea');
      txt.innerHTML = html || '';
      return txt.value;
    }

    const pageText = document.body.innerText || '';

      // Collect attribute values (href, data-*, title, etc.) which may contain obfuscated emails
      const attrs = [];
      document.querySelectorAll('*').forEach(el => {
        for (let i = 0; i < el.attributes.length; i++) {
          attrs.push(el.attributes[i].value);
        }
      });
      const attrText = attrs.join(' ');
      const htmlText = document.body.innerHTML || '';
      //console.log('[Email Extractor] pageText snippet:', pageText.slice(0, 300));
      //console.log('[Email Extractor] attrText snippet:', attrText.slice(0, 300));
      //console.log('[Email Extractor] htmlText snippet:', htmlText.slice(0, 300));
      
      
      // Decode HTML entities then normalize obfuscations
      //const normalizedText = normalizeText(decodeHTML(pageText)) + ' ' +
      //                       normalizeText(decodeHTML(attrText)) + ' ' +
      //                       normalizeText(decodeHTML(htmlText));
      
      const normalizedText = normalizeText(decodeHTML(htmlText));

      //console.log('[Email Extractor] normalizedText snippet:', normalizedText.slice(0, 300));
      


    // If domain is not excluded, proceed with email extraction
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = normalizedText.match(emailRegex) || [];
    
    if (emails.length > 0) {
      //console.log('[Email Extractor] Found emails2:', emails.length);
      // include the domain where the emails were found so the background
      // script can send this information to the remote endpoint
      chrome.runtime.sendMessage({type: "saveEmails", emails, domain: currentDomain});
    }
  });
})();