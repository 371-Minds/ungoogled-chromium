// 371 Sentry — Sovereign UI Background Worker

let agentStatus = { online: false, heartbeat: null };

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

// Poller scheduler
chrome.runtime.onInstalled.addListener(() => {
  // Set up side panel action click behavior (opens side panel automatically)
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

  // Poll immediately and start interval
  checkPaperclipHeartbeat();
  setInterval(checkPaperclipHeartbeat, 5000);

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
  const generatedProvenanceId = `ASE-GEN-${crypto.randomUUID().toUpperCase()}`;
  chrome.storage.local.set({
    [`tab_${tab.id}`]: {
      provenanceId: generatedProvenanceId,
      trustLevel: "GREEN",
      scope: "READ_ONLY",
      created_at: Date.now()
    }
  });
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
        provenanceId: `ASE-VORTEX-${crypto.randomUUID().toUpperCase()}`,
        trustLevel: "YELLOW",
        scope: "SANDBOXED",
        created_at: Date.now()
      }
    });
  }
});
