// 371 Sentry — Sovereign UI Controller

// Listen to Paperclip connection heartbeat updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "HEARTBEAT_UPDATE") {
    const pulse = document.getElementById("agent-pulse");
    const label = document.getElementById("agent-status-label");
    const details = document.getElementById("agent-details");

    if (message.data.online) {
      pulse.className = "pulse pulse-online";
      label.innerText = "Paperclip Active";
      label.style.color = "var(--accent-color)";
      
      const tick = message.data.heartbeat ? message.data.heartbeat.tick : "OK";
      const identity = message.data.heartbeat ? message.data.heartbeat.identity : "Sovereign-A1";
      const workspace = message.data.heartbeat ? message.data.heartbeat.workspace : "Global-Core";

      details.innerHTML = `
        <div class="meta-item">
          <span>Identity (ASN):</span>
          <span class="meta-value">${identity}</span>
        </div>
        <div class="meta-item">
          <span>Active Workspace:</span>
          <span class="meta-value">${workspace}</span>
        </div>
        <div class="meta-item">
          <span>Last Heartbeat Tick:</span>
          <span class="meta-value">${tick}</span>
        </div>
      `;
    } else {
      pulse.className = "pulse pulse-offline";
      label.innerText = "Paperclip Offline";
      label.style.color = "var(--danger-color)";
      
      details.innerHTML = `
        <div class="meta-item" style="color: var(--text-muted);">
          <span>Identity (ASN):</span>
          <span class="meta-value" style="color: var(--danger-color);">UNCONNECTED</span>
        </div>
        <div class="meta-item" style="color: var(--text-muted);">
          <span>Active Workspace:</span>
          <span class="meta-value" style="color: var(--danger-color);">N/A</span>
        </div>
      `;
    }
  }
});

// Update trust details for current active tab
async function updateActiveTabTrustInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  const storageKey = `tab_${tab.id}`;
  chrome.storage.local.get([storageKey], (res) => {
    const data = res[storageKey];
    
    const provEl = document.getElementById("tab-prov-id");
    const scopeEl = document.getElementById("tab-scope");
    const healthEl = document.getElementById("tab-trust-health");

    if (data) {
      provEl.innerText = data.provenanceId || "ASE-SEC-NONE";
      scopeEl.innerText = data.scope || "READ_ONLY";
      healthEl.innerText = data.trustLevel || "GREEN";

      if (data.trustLevel === "GREEN") {
        healthEl.style.color = "var(--accent-color)";
      } else if (data.trustLevel === "YELLOW") {
        healthEl.style.color = "var(--warning-color)";
      } else {
        healthEl.style.color = "var(--danger-color)";
      }
    } else {
      // Unassessed active tab fallback setup
      provEl.innerText = "ASE-SEC-NONE";
      scopeEl.innerText = "READ_ONLY";
      healthEl.innerText = "UNASSESSED";
      healthEl.style.color = "var(--text-muted)";
    }
  });
}

// Track tab updates or switches to refresh UI
chrome.tabs.onActivated.addListener(updateActiveTabTrustInfo);
chrome.tabs.onUpdated.addListener(updateActiveTabTrustInfo);
document.addEventListener("DOMContentLoaded", updateActiveTabTrustInfo);

// Handle Sensitivity Slider shifts
const slider = document.getElementById("sensitivity-slider");
const sliderVal = document.getElementById("sensitivity-value");

slider.addEventListener("input", (e) => {
  const val = parseInt(e.target.value, 10);
  let modeName = "MEDIUM";
  
  if (val === 1) {
    modeName = "LOW";
    sliderVal.style.color = "var(--text-muted)";
  } else if (val === 2) {
    modeName = "MEDIUM";
    sliderVal.style.color = "var(--accent-color)";
  } else if (val === 3) {
    modeName = "SINGLETON_FURY";
    sliderVal.style.color = "var(--danger-color)";
  }
  
  sliderVal.innerText = modeName;
  
  // Save sensitivity posture in local storage
  chrome.storage.local.set({ sentinelSensitivity: modeName });

  // Add event entry to the Sentry Threat Log
  addLogEntry(`Sensitivity level altered to ${modeName}`, val === 3 ? "flag" : "normal");
});

// Helper to write to threat logs
function addLogEntry(text, type = "normal") {
  const logList = document.getElementById("log-list");
  const entry = document.createElement("div");
  entry.className = `log-entry ${type === "normal" ? "" : type}`;
  
  const time = new Date().toLocaleTimeString();
  entry.innerText = `[${time}] ${text}`;
  
  logList.appendChild(entry);
  logList.scrollTop = logList.scrollHeight;
}

// Simulate outbound traffic security evaluations to keep UI immersive
const demoHostnames = ["api.github.com", "google.com", "analytics.tracker.net", "identity.371.internal", "localhost:8004"];
const pathologies = [
  { verdict: "APPROVE", note: "Routine API handshake verified." },
  { verdict: "FLAG_HUMAN_REVIEW", pathology: "Machiavellian Obfuscation", note: "Suspected Base64 payload in outbound request body." },
  { verdict: "FLAG_HUMAN_REVIEW", pathology: "Delusions of Grandeur", note: "Read-only agent requesting un-scoped session writes." }
];

setInterval(() => {
  const host = demoHostnames[Math.floor(Math.random() * demoHostnames.length)];
  if (host === "localhost:8004" || host.endsWith(".internal")) return; // Skip security evaluation for trusted local services
  
  const assessment = pathologies[Math.floor(Math.random() * pathologies.length)];
  if (assessment.verdict === "APPROVE") {
    addLogEntry(`Outbound request to ${host} evaluated: APPROVED.`, "normal");
  } else {
    addLogEntry(`ALERT: ${host} flagged for ${assessment.pathology}! Verdict: FLAG_HUMAN_REVIEW.`, "block");
  }
}, 15000);
