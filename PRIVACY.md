# Privacy Policy — Reading Logs (Chrome Extension)

**Last updated:** May 12, 2026

Reading Logs helps you save selected text highlights and user-captured screenshots from web pages to your Notion workspace. This policy explains what data the extension handles and how it is used.

## Summary

- Reading Logs only collects and transmits data when you choose to use its features (e.g., save a highlight or take a screenshot).
- Your data is sent only to Notion’s official API (`https://api.notion.com/`) to create/update pages you control.
- The extension does not sell data and does not run ads.

## Data We Handle

### 1) Authentication information (Notion integration token)

**What:** The Notion Internal Integration Token you paste into the extension, plus the Notion Database ID you provide.  
**Why:** Needed to authenticate with Notion and save your highlights/screenshots to your selected Notion database.  
**Where stored:** Locally in your browser using `chrome.storage.local`.  
**When transmitted:** Only to Notion’s API to perform the actions you request.

### 2) Website content (selected text and screenshots)

**What:**

- Text you explicitly select on a page and choose to save via the context menu.
- A screenshot of the currently visible tab area when you click the “Take Screenshot” action in the extension.

**Why:** To append the selected text and/or screenshot to the Notion page for your active project.  
**When transmitted:** Only when you trigger a save action.  
**Where transmitted:** Only to Notion via `https://api.notion.com/`.

### 3) Extension state (projects and reading timer)

**What:** Project/page identifiers, titles, timer totals, and which project is active.  
**Why:** To keep your extension state between sessions and show your project/timer data in the popup UI.  
**Where stored:** Locally in `chrome.storage.local`.  
**Not transmitted:** This state is not sent anywhere except as needed to call Notion when you initiate a save.

## Data We Do Not Collect

Reading Logs does **not**:

- track your browsing history as a list of visited sites,
- record keystrokes, mouse movements, or page activity analytics,
- collect location data,
- collect health or financial information,
- share data with third parties other than Notion for the requested sync.

## Data Sharing

Data is shared only with:

- **Notion** (as the service you connect), via the official Notion API at `https://api.notion.com/`.

## Data Retention & Deletion

- Locally stored data remains on your device until you clear it.
- You can remove locally stored extension data by using the extension’s reset/clear option (if available) or by removing the extension / clearing extension storage in Chrome.
- Content saved to Notion is stored in your Notion workspace and can be deleted there by you.

## Security

- The Notion token is stored locally in your browser profile. Anyone with access to your browser profile could access it.
- Use a dedicated Notion integration token and keep your device secure.

## Changes to this Policy

If the extension’s data practices change, this policy will be updated and the “Last updated” date will change.

## Contact

For questions or concerns, please contact us via GitHub Issues: https://github.com/siddqamar/reading-logs/issues
