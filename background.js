// background.js — Deep Focus Service Worker

const ALARM_NAME = "deepfocus_tick";

// Called when extension installs/updates
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    active: false,
    strictMode: false,
    endTime: null,
    blockSocial: true,
    blockVideo: true,
    totalSeconds: 25 * 60
  });
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "startSession") {
    startSession(msg.data);
    sendResponse({ ok: true });
  } else if (msg.action === "abortSession") {
    abortSession();
    sendResponse({ ok: true });
  } else if (msg.action === "getState") {
    chrome.storage.local.get(null, (state) => sendResponse(state));
    return true; // async
  }
});

function startSession(data) {
  const endTime = Date.now() + data.totalSeconds * 1000;
  chrome.storage.local.set({
    active: true,
    strictMode: data.strictMode,
    blockSocial: data.blockSocial,
    blockVideo: data.blockVideo,
    totalSeconds: data.totalSeconds,
    endTime: endTime
  }, () => {
    applyRules(data.blockSocial, data.blockVideo);
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 / 60 }); // every second
  });
}

function abortSession() {
  chrome.storage.local.get(["strictMode"], (state) => {
    if (state.strictMode) return; // cannot abort in strict mode
    endSession();
  });
}

function endSession() {
  chrome.alarms.clear(ALARM_NAME);
  chrome.storage.local.set({ active: false, endTime: null });
  // Disable all rules
  chrome.declarativeNetRequest.updateEnabledRulesets({
    disableRulesetIds: ["social_rules", "video_rules"]
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  chrome.storage.local.get(["active", "endTime"], (state) => {
    if (!state.active) return;
    if (Date.now() >= state.endTime) {
      endSession();
    }
  });
});

function applyRules(blockSocial, blockVideo) {
  const enable = [];
  const disable = [];
  blockSocial ? enable.push("social_rules") : disable.push("social_rules");
  blockVideo  ? enable.push("video_rules")  : disable.push("video_rules");
  chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: enable,
    disableRulesetIds: disable
  });
}
