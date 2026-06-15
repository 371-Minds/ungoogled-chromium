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

      details.replaceChildren();

      const makeItem = (labelText, valueText) => {
        const item = document.createElement("div");
        item.className = "meta-item";

        const labelEl = document.createElement("span");
        labelEl.textContent = labelText;

        const valueEl = document.createElement("span");
        valueEl.className = "meta-value";
        valueEl.textContent = valueText;

        item.append(labelEl, valueEl);
        return item;
      };

      details.append(
        makeItem("Identity (ASN):", identity),
        makeItem("Active Workspace:", workspace),
        makeItem("Last Heartbeat Tick:", tick)
      );
    } else {
      pulse.className = "pulse pulse-offline";
      label.innerText = "Paperclip Offline";
      label.style.color = "var(--danger-color)";
      
      details.replaceChildren();

      const makeItem = (labelText, valueText, valueColor) => {
        const item = document.createElement("div");
        item.className = "meta-item";
        item.style.color = "var(--text-muted)";

        const labelEl = document.createElement("span");
        labelEl.textContent = labelText;

        const valueEl = document.createElement("span");
        valueEl.className = "meta-value";
        valueEl.textContent = valueText;
        valueEl.style.color = valueColor;

        item.append(labelEl, valueEl);
        return item;
      };

      details.append(
        makeItem("Identity (ASN):", "UNCONNECTED", "var(--danger-color)"),
        makeItem("Active Workspace:", "N/A", "var(--danger-color)")
      );
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

const TRUSTED_DOMAINS = ["localhost:8004", "371.internal"];

// Connect the extension sidebar to display live Sentinel threat verdicts
// from the 371 Router at localhost:3001

async function fetchLiveVerdicts() {
  try {
    const response = await fetch("http://localhost:3001/api/verdicts");
    if (response.ok) {
      const verdicts = await response.json();
      verdicts.forEach(assessment => {
        const host = assessment.host || "unknown-host";
        if (assessment.verdict === "APPROVE") {
          addLogEntry(`Outbound request to ${host} evaluated: APPROVED. Note: ${assessment.note}`, "normal");
        } else if (assessment.verdict === "FLAG_HUMAN_REVIEW") {
          addLogEntry(`ALERT: ${host} flagged for ${assessment.pathology || "Suspicious Activity"}! Verdict: FLAG_HUMAN_REVIEW. Note: ${assessment.note}`, "block");
        }
      });
    }
  } catch (err) {
    // Silent fail if router is not reachable
  }
}

// Poll for live verdicts every 5 seconds
setInterval(fetchLiveVerdicts, 5000);
