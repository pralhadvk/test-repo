# 3C Search — Browser Extension

## Load in Chrome (Developer Mode)
1. Open `chrome://extensions`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select this `extension/` folder
5. Pin the 3C Search icon from the toolbar

## Features
- **Right-click any selected text** → "3C Search: ..." → opens result in a new tab
- **Toolbar popup** → mini search UI with category selector and recent searches
- **Pre-fills selected text** from the current page into the popup search box

## To Submit to Chrome Web Store
1. Add 16×16, 48×48, and 128×128 PNG icons to `icons/` folder
2. Zip the entire `extension/` folder
3. Upload to https://chrome.google.com/webstore/devconsole

## Firefox (Manifest V2 Compat)
For Firefox, change `manifest.json`:
- Set `"manifest_version": 2`
- Change `"action"` to `"browser_action"`
- Remove `"content_security_policy"` or use Firefox format
