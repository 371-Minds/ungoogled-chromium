// 371 Sentry — Sovereign UI Background Worker

let agentStatus = { online: false, heartbeat: null };
const HEARTBEAT_ALARM_NAME = "paperclip-heartbeat";

// Secure UUID generator with fallback for non-crypto environments
function generateUUID() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Poll Paperclip Agent OS at port 3100 for global heartbeat and status
async function checkPaperclipHeartbeat() {
  try {
    const response = await fetch("http://localhost:3100/api/heartbeat", {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    if (response.ok) {
      const data = await response.json();
      agentStatus = { online: true, heartbeat: data };
    } else {
      agentStatus = { online: false, heartbeat: null };
    }
  } catch (err) {
    agentStatus = { online: false, heartbeat: null };
  }
  
  // Broadcast heartbeat update to active sidebar components
  chrome.runtime.sendMessage({ type: "HEARTBEAT_UPDATE", data: agentStatus }).catch(() => {
    // Ignore error if sidebar panel is currently closed
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === HEARTBEAT_ALARM_NAME) {
    checkPaperclipHeartbeat();
  }
});

// Poller scheduler
chrome.runtime.onInstalled.addListener(() => {
  // Set up side panel action click behavior (opens side panel automatically)
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

  // Poll immediately and schedule heartbeat alarm
  checkPaperclipHeartbeat();
  chrome.alarms.create(HEARTBEAT_ALARM_NAME, { periodInMinutes: 0.5 });

  // Create context menu for Vortex Sandboxing
  chrome.contextMenus.create({
    id: "send-to-vortex",
    title: "Send Tab to Vortex Sandbox",
    contexts: ["page", "tab"]
  });
});

// Watch tabs to inject and track Agent Provenance ID
chrome.tabs.onCreated.addListener((tab) => {
  // 'ASE-GEN-' stands for Agentic Security Ecosystem - Generated, representing a
  // dynamically assigned tracking identifier for scoped agent workspace sessions.
  const generatedProvenanceId = `ASE-GEN-${generateUUID()}`;
  
  chrome.storage.local.set({
    [`tab_${tab.id}`]: {
      provenanceId: generatedProvenanceId,
      trustLevel: "GREEN",
      scope: "READ_ONLY",
      created_at: Date.now()
    }
  });

  // Prompt user/Paperclip to define session boundaries.
  // Use pendingUrl first because tab.url is often empty when onCreated fires.
  const tabUrl = tab.pendingUrl || tab.url || "";
  if (tab.id && !tabUrl.startsWith("chrome://")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const scope = prompt("Define session boundaries for this tab (READ_ONLY, READ_WRITE, SANDBOXED):", "READ_ONLY");
        if (scope) {
          chrome.runtime.sendMessage({ type: "SET_TAB_SCOPE", scope });
        }
      }
    }).catch(err => console.log("Could not inject prompt script into new tab:", err));
  }
});

// Listen for scope updates from injected scripts
const VALID_SCOPES = new Set(["READ_ONLY", "READ_WRITE", "SANDBOXED"]);

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "SET_TAB_SCOPE" && sender.tab) {
    const tabId = sender.tab.id;
    // Validate and normalize the scope value before persisting.
    const normalized = typeof message.scope === "string"
      ? message.scope.trim().toUpperCase()
      : "";
    if (!VALID_SCOPES.has(normalized)) {
      console.warn(`SET_TAB_SCOPE: ignoring unrecognized scope "${message.scope}"`);
      return;
    }
    chrome.storage.local.get([`tab_${tabId}`], (result) => {
      const data = result[`tab_${tabId}`];
      if (data) {
        data.scope = normalized;
        if (normalized === "SANDBOXED") data.trustLevel = "YELLOW";
        chrome.storage.local.set({ [`tab_${tabId}`]: data });
      }
    });
  }
});

// Clean up tab storage when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  chrome.storage.local.remove(`tab_${tabId}`);
});

// Handle Context Menu click for Vortex Sandboxing
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "send-to-vortex" && tab) {
    // Redirect current page to the local Vortex Engine Mock/Synthetic Sandbox
    const vortexUrl = `http://localhost:3001/v1/vortex/sandbox?target=${encodeURIComponent(tab.url)}`;
    chrome.tabs.update(tab.id, { url: vortexUrl });
    
    // Update active tab security posture status
    chrome.storage.local.set({
      [`tab_${tab.id}`]: {
        provenanceId: `ASE-VORTEX-${generateUUID()}`,
        trustLevel: "YELLOW",
        scope: "SANDBOXED",
        created_at: Date.now()
      }
    });
  }
});
