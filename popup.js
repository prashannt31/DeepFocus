// popup.js — Deep Focus popup controller

const timerDisplay  = document.getElementById("timerDisplay");
const timerLabel    = document.getElementById("timerLabel");
const ringProgress  = document.getElementById("ringProgress");
const statusDot     = document.getElementById("statusDot");
const durationSlider= document.getElementById("durationSlider");
const sliderVal     = document.getElementById("sliderVal");
const blockSocial   = document.getElementById("blockSocial");
const blockVideo    = document.getElementById("blockVideo");
const strictMode    = document.getElementById("strictMode");
const btnStart      = document.getElementById("btnStart");
const btnAbort      = document.getElementById("btnAbort");
const msgBar        = document.getElementById("msgBar");

const CIRCUMFERENCE = 2 * Math.PI * 65; // ~408.4

let ticker = null;

// ── Helpers ─────────────────────────────────────────────────────────
function fmtTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function showMsg(text, type = "info") {
  msgBar.textContent = text;
  msgBar.className = `msg-bar show ${type}`;
  setTimeout(() => { msgBar.className = "msg-bar"; }, 3500);
}

function setRing(fraction) {
  // fraction 1 = full, 0 = empty
  const offset = CIRCUMFERENCE * (1 - fraction);
  ringProgress.style.strokeDasharray = CIRCUMFERENCE;
  ringProgress.style.strokeDashoffset = offset;

  ringProgress.classList.remove("warning", "critical");
  if (fraction <= 0.1) ringProgress.classList.add("critical");
  else if (fraction <= 0.25) ringProgress.classList.add("warning");
}

function setUIActive(active, strict) {
  statusDot.classList.toggle("active", active);
  durationSlider.disabled = active;
  blockSocial.disabled = active;
  blockVideo.disabled = active;
  strictMode.disabled = active;
  btnStart.disabled = active;
  btnAbort.disabled = !active || strict;
  timerLabel.textContent = active ? "FOCUSING" : "READY";
}

// ── Tick ─────────────────────────────────────────────────────────────
function startTick(endTime, totalSeconds) {
  clearInterval(ticker);
  ticker = setInterval(() => {
    const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    timerDisplay.textContent = fmtTime(remaining);
    setRing(remaining / totalSeconds);
    if (remaining === 0) {
      clearInterval(ticker);
      handleSessionEnd();
    }
  }, 500);
}

function handleSessionEnd() {
  setUIActive(false, false);
  timerDisplay.textContent = fmtTime(parseInt(durationSlider.value) * 60);
  setRing(1);
  timerLabel.textContent = "COMPLETE";
  showMsg("✅ Session complete. Great work!", "ok");
  // Revert label after 3s
  setTimeout(() => { timerLabel.textContent = "READY"; }, 3000);
}

// ── Init popup ───────────────────────────────────────────────────────
function initPopup() {
  setRing(1); // full ring on load
  chrome.runtime.sendMessage({ action: "getState" }, (state) => {
    if (!state) return;

    durationSlider.value = Math.round(state.totalSeconds / 60);
    sliderVal.textContent = `${durationSlider.value} min`;
    timerDisplay.textContent = fmtTime(state.totalSeconds);
    blockSocial.checked = state.blockSocial !== false;
    blockVideo.checked  = state.blockVideo  !== false;
    strictMode.checked  = state.strictMode  === true;

    if (state.active && state.endTime) {
      const remaining = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
      if (remaining > 0) {
        setUIActive(true, state.strictMode);
        timerDisplay.textContent = fmtTime(remaining);
        setRing(remaining / state.totalSeconds);
        startTick(state.endTime, state.totalSeconds);
      } else {
        // session already expired
        handleSessionEnd();
      }
    }
  });
}

// ── Events ───────────────────────────────────────────────────────────
durationSlider.addEventListener("input", () => {
  const mins = parseInt(durationSlider.value);
  sliderVal.textContent = `${mins} min`;
  timerDisplay.textContent = fmtTime(mins * 60);
  setRing(1);
});

btnStart.addEventListener("click", () => {
  const mins = parseInt(durationSlider.value);
  const data = {
    totalSeconds: mins * 60,
    blockSocial: blockSocial.checked,
    blockVideo:  blockVideo.checked,
    strictMode:  strictMode.checked
  };

  if (!data.blockSocial && !data.blockVideo) {
    showMsg("Enable at least one blocking category.", "warn");
    return;
  }

  chrome.runtime.sendMessage({ action: "startSession", data }, (res) => {
    if (res && res.ok) {
      const endTime = Date.now() + data.totalSeconds * 1000;
      setUIActive(true, data.strictMode);
      setRing(1);
      timerDisplay.textContent = fmtTime(data.totalSeconds);
      startTick(endTime, data.totalSeconds);
      showMsg(data.strictMode
        ? "🔒 Strict mode on — no escape!"
        : "⚡ Focus session started!", "info");
    }
  });
});

btnAbort.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "abortSession" }, () => {
    clearInterval(ticker);
    const mins = parseInt(durationSlider.value);
    setUIActive(false, false);
    timerDisplay.textContent = fmtTime(mins * 60);
    setRing(1);
    timerLabel.textContent = "READY";
    showMsg("Session aborted.", "warn");
  });
});

// Init
initPopup();
