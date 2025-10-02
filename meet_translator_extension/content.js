// content.js — heavy-debugging version
console.log("✅ Google Meet Translator Extension (debug) loaded");

const DEBUG_OVERLAY = true;
const FLUSH_MS = 1500; // wait this long after last update, then send
const POLL_MS = 600;   // also poll periodically

// blocked system phrases
const blockedPhrases = [
  "Your camera", "Your microphone", "Meeting", "You have joined",
  "You’re the first one here", "has left the meeting", "hand is lowered",
  "hand is raised", "turned off", "turned on", "recording", "joining"
];

const sentenceEnd = /[.!?]$/;

let buffer = "";
let lastSent = "";
let flushTimer = null;

// Debug overlay
let overlay;
if (DEBUG_OVERLAY) {
  overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.bottom = "6%";
  overlay.style.right = "6%";
  overlay.style.zIndex = 2147483647;
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.color = "#b7ffb7";
  overlay.style.padding = "6px 10px";
  overlay.style.fontSize = "13px";
  overlay.style.fontFamily = "system-ui, Arial";
  overlay.style.borderRadius = "8px";
  overlay.style.maxWidth = "360px";
  overlay.style.lineHeight = "1.2";
  overlay.innerText = "Translator: ready";
  document.body.appendChild(overlay);
}

function setOverlay(text) {
  if (!overlay) return;
  overlay.innerText = text;
}

// Try a bunch of selectors that Meet might use for captions
function findLatestCaptionText() {
  const selectors = [
    'div[aria-live="polite"]',
    'div[role="status"]',
    'div[jsname="tgaKEf"]',
    'div[class*="caption"]',
    'div[class*="live-caption"]'
  ];

  for (let sel of selectors) {
    const nodes = document.querySelectorAll(sel);
    if (nodes && nodes.length) {
      // find last node that has visible text
      for (let i = nodes.length - 1; i >= 0; --i) {
        const txt = nodes[i].innerText && nodes[i].innerText.trim();
        if (txt) return txt;
      }
    }
  }

  // fallback: search for any element that looks like caption text
  const all = Array.from(document.body.querySelectorAll("div,span"));
  for (let i = all.length - 1; i >= 0; --i) {
    const el = all[i];
    if (!el || !el.innerText) continue;
    const t = el.innerText.trim();
    if (t.length > 3 && t.length < 300 && /[A-Za-z0-9\u0900-\u097F]/.test(t)) {
      // heuristics: not huge, contains reasonable chars
      // but prefer aria-live first (we already checked)
      if (t.length < 200) return t;
    }
  }
  return null;
}

function shouldIgnore(text) {
  if (!text) return true;
  const low = text.toLowerCase();
  for (let p of blockedPhrases) {
    if (low.includes(p.toLowerCase())) return true;
  }
  return false;
}

function sendToBackend(sentence) {
  if (!sentence) return;
  const normalized = sentence.trim();
  if (!normalized) return;
  if (normalized === lastSent) {
    console.log("🔁 duplicate, not sending:", normalized);
    setOverlay("Duplicate - not sent\n" + truncated(normalized));
    return;
  }

  lastSent = normalized;
  console.log("⏫ Sending to backend:", normalized);
  setOverlay("Sending...\n" + truncated(normalized));

  fetch("http://127.0.0.1:8000/speak", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: normalized })
  })
    .then(async res => {
      const txt = await res.text().catch(() => "");
      try { return { ok: res.ok, status: res.status, json: JSON.parse(txt || "{}"), text: txt }; }
      catch(e){ return { ok: res.ok, status: res.status, json: null, text: txt }; }
    })
    .then(r => {
      console.log("⬇ Backend response:", r);
      if (r.ok) {
        setOverlay("Spoken ✅\n" + truncated(normalized));
      } else {
        setOverlay(`Backend error ${r.status}\n${truncated(r.text)}`);
      }
    })
    .catch(err => {
      console.error("❌ Fetch error:", err);
      setOverlay("Fetch error:\n" + (err && err.message ? err.message : String(err)));
    });
}

function truncated(s, n=140) {
  if (!s) return "";
  return s.length > n ? s.slice(0,n) + "…": s;
}

function scheduleFlush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
  }
  flushTimer = setTimeout(() => {
    if (buffer && !shouldIgnore(buffer)) {
      // send buffer when user stopped speaking
      console.log("⏳ flushTimer fired, sending buffer:", buffer);
      sendToBackend(buffer);
    } else {
      console.log("⏳ flushTimer fired but buffer empty/ignored");
      setOverlay("Waiting...");
    }
    buffer = "";
    flushTimer = null;
  }, FLUSH_MS);
}

// Called by mutation observer and poller
function processCaptionUpdate() {
  try {
    const latest = findLatestCaptionText();
    if (!latest) {
      // no text found
      return;
    }

    if (shouldIgnore(latest)) {
      // if system line -> show it but don't use as speech
      console.log("🔒 Ignoring system caption:", latest);
      setOverlay("Ignored: " + truncated(latest));
      return;
    }

    // if the new captured text is identical to buffer, do nothing
    if (latest === buffer) {
      // still the same partial caption — reset flush timer
      scheduleFlush();
      setOverlay("Buffering: " + truncated(buffer));
      return;
    }

    // update buffer
    buffer = latest;
    console.log("🧾 Buffer updated:", buffer);
    setOverlay("Buffer: " + truncated(buffer));

    // if the line looks like a finished sentence, send immediately
    if (sentenceEnd.test(buffer)) {
      console.log("✅ Sentence end detected, sending:", buffer);
      sendToBackend(buffer);
      buffer = "";
      if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
      return;
    }

    // else schedule flush if user stops for FLUSH_MS
    scheduleFlush();

  } catch (e) {
    console.error("Observer processing error:", e);
    setOverlay("Observer error: " + (e && e.message));
  }
}

// MutationObserver (fast)
const observer = new MutationObserver(() => {
  processCaptionUpdate();
});

// Start observing after page load
window.addEventListener("load", () => {
  try {
    observer.observe(document.body, { childList: true, subtree: true });
    setOverlay("Observer started, polling...");
    console.log("🛰 MutationObserver started");
  } catch (e) {
    console.error("Failed to start observer:", e);
    setOverlay("Observer start failed: " + e.message);
  }
});

// Polling fallback in case mutations are missed
setInterval(() => {
  processCaptionUpdate();
}, POLL_MS);

// Helper to self-test sending from console
window._meetTranslator_testSend = function(txt) {
  console.log("✅ testSend:", txt);
  sendToBackend(txt);
};
