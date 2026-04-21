# ⚡ Deep Focus — Chrome Extension

A browser productivity extension that blocks distracting websites during timed focus sessions.

---

## 📦 Installation (Load Unpacked)

1. Download / unzip this folder somewhere on your computer.
2. Open **Chrome** (or any Chromium browser) and go to:
   ```
   chrome://extensions
   ```
3. Enable **Developer Mode** (toggle in the top-right corner).
4. Click **"Load unpacked"**.
5. Select this `deep-focus-extension` folder.
6. The **Deep Focus** icon (⚡) will appear in your toolbar.

---

## 🚀 How to Use

1. Click the **Deep Focus** icon in the toolbar.
2. Drag the slider to set your **focus duration** (5–120 min).
3. Toggle which categories to block:
   - 📱 **Social Distractions** — Instagram, Twitter, Reddit, TikTok, etc.
   - 🎬 **Video Platforms** — YouTube, Netflix, Twitch, etc.
4. Optionally enable 🔒 **Strict Mode** — once started, the session **cannot be aborted**.
5. Click **INITIALIZE** to begin.
6. If you try to visit a blocked site, you'll see the **Blocked** page with your remaining time.
7. When the timer reaches zero, blocking ends automatically.

---

## 🌐 Blocked Sites

### Social Distractions
Facebook, Instagram, Twitter/X, Snapchat, TikTok, Reddit, Pinterest, Discord, WhatsApp Web, Telegram, LinkedIn

### Video Platforms
YouTube, Netflix, Prime Video, Hotstar, Twitch, Hulu, Disney+, Vimeo, Dailymotion, Crunchyroll

---

## 🗂 File Structure

```
deep-focus-extension/
├── manifest.json        # Extension config (Manifest V3)
├── background.js        # Service worker: timer + blocking logic
├── popup.html           # Extension popup UI
├── popup.js             # Popup controller
├── blocked.html         # Page shown when a site is blocked
├── icons/               # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── rules/
    ├── social_rules.json  # Social media blocking rules
    └── video_rules.json   # Video platform blocking rules
```

---

## 🔮 Tech Stack
- HTML + CSS + JavaScript
- Chrome Extension APIs (Manifest V3)
- `declarativeNetRequest` for reliable URL blocking
- `chrome.alarms` for background timer
- `chrome.storage.local` for persistent state

---

*Built as part of the Deep Focus HCI Project — VIT Chennai*
