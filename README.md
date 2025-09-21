# Cnetinfosystem - Email Extractor

A Chrome Extension to extract email addresses from any web page you visit. Extracted emails are saved locally and can be viewed, copied, or cleared from the extension popup.

## Features

- **Extracts emails** from the visible text of any web page.
- **Saves emails locally** in your browser using Chrome's storage API.
- **View, copy, or clear** saved emails from the popup interface.
- **Domain Exclusion** - exclude specific domains from email extraction.
- **Quick Domain Add** - easily add current tab's domain to exclusion list.
- **No data is sent** outside your device—privacy friendly.
- **Notifications** when new emails are found.
- **Material Design** interface with smooth transitions.
- **Animated feedback** when copying emails.

## Installation

1. Download or clone this repository.
2. Go to `chrome://extensions/`[Download](https://chromewebstore.google.com/detail/cnetinfosystem-email-extr/bgdjkhlbcenendlkchonblmjajnjggpj) in your browser.
3. Enable "Developer mode" (top right).
4. Click "Load unpacked" and select the project folder.

## Usage

1. Visit any web page.
2. Click the extension icon to open the popup.
3. Extracted emails will be listed.
4. Use "Copy All" to copy emails to clipboard, or "Clear All" to remove them.

## Permissions

This extension requests the following permissions:
- `scripting`, `activeTab`, `storage`, `tabs`, `notifications`: Required for extracting emails, saving them locally, and showing notifications.
- `<all_urls>`: To allow extraction from any website you visit.

## Privacy Policy

- The extension operates **entirely on your local device**.
- **No personal data or browsing information is collected, transmitted, or shared** with external servers or third parties.
- All extracted emails are stored **locally** in your browser and can be managed by you at any time.

For more details, see [privacy](https://cnetinfosystem.com/assets/email_extention_privacy.html).

## Project Structure

- `manifest.json` – Extension manifest.
- `background.js` – Handles script injection and notifications.
- `content.js` – Extracts emails and saves them locally.
- `extractor.js` – Script injected into pages to extract emails.
- `popup.html` / `popup.js` – Popup UI and logic.
- `privacy.html`, `email_extention_privacy.html` – Privacy policy pages.
- `icons/` – Extension icons.
- `build/` – Build artifacts (e.g., `.crx`, `.pem`).

## License

MIT License (or specify your license here).

---

**Contact:** [pratik.shourabh@gmail.com](mailto:pratik.shourabh@gmail.com)