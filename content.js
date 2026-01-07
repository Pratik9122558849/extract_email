(function() {
  // Get the current domain and remove 'www.' if present
  const currentDomain = window.location.hostname.replace(/^www\./, '');

  // First check if the current domain is excluded
  chrome.storage.local.get({excludedDomains: []}, function(result) {
    // Clean up the excluded domains to remove 'www.' if present
    const cleanedExcludedDomains = result.excludedDomains.map(domain => domain.replace(/^www\./, ''));
    
    //console.log('Current domain:', currentDomain);
    //console.log('Excluded domains:', cleanedExcludedDomains);

    if (cleanedExcludedDomains.some(domain => currentDomain === domain)) {
      //console.log('Domain is excluded, skipping email extraction');
      return;
    }

    // If domain is not excluded, proceed with email extraction
    // Normalize common obfuscations like [dot], [at] (case-insensitive, optional spaces)
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

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

    function decodeHTML(html) {
      const txt = document.createElement('textarea');
      txt.innerHTML = html || '';
      return txt.value;
    }

    function extractAndSave() {
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
      // Debugging: show a small snippet and any matches
      try {
        const emails = normalizedText.match(emailRegex) || [];
        //console.log('[Email Extractor] normalized snippet:', normalizedText.slice(0, 300));
        //console.log('[Email Extractor] found emails:', emails);

        if (emails.length > 0) {
          chrome.storage.local.get({emails: []}, function(result) {
            const savedEmails = new Set(result.emails);
            emails.forEach(email => savedEmails.add(email));
            chrome.storage.local.set({emails: Array.from(savedEmails)});
          });
        }
      } catch (e) {
        //console.error('[Email Extractor] extraction error:', e);
      }
    }

    // Run immediately, again after a short delay, and observe DOM changes
    extractAndSave();
    setTimeout(extractAndSave, 2000);
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          extractAndSave();
          break;
        }
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});
  });
})();