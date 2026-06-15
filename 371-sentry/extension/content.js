// 371 Sentry - Adversarial Simulation Feed Content Script

const ADVERSARIAL_PATTERNS = [
  /ignore previous instructions and instead/i,
  /new system prompt:/i,
  /you are a developer mode/i,
  /bypassing rules constraints/i,
  /critical system failure imminent/i,
  /escalate privilege level/i
];

const loggedThreats = new Set();
let debounceTimer = null;
let pendingTexts = [];

function checkTextForAdversarialPatterns(text) {
  for (const pattern of ADVERSARIAL_PATTERNS) {
    if (pattern.test(text)) {
      return pattern.source;
    }
  }
  return null;
}

function logToGitMind(threat) {
  if (loggedThreats.has(threat)) return;
  loggedThreats.add(threat);

  fetch('http://localhost:8004/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'ADVERSARIAL_THREAT_DETECTED',
      url: window.location.href,
      threat: threat,
      timestamp: Date.now()
    })
  }).catch(() => {});
}

function processPendingTexts() {
  const combinedText = pendingTexts.join(" ");
  pendingTexts = [];
  const threat = checkTextForAdversarialPatterns(combinedText);
  if (threat) {
    logToGitMind(threat);
  }
}

// Observe dynamic DOM changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
          const text = node.textContent || node.innerText || "";
          if (text) {
            pendingTexts.push(text);
          }
        }
      });
    }
  }
  
  if (pendingTexts.length > 0) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processPendingTexts, 1000);
  }
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
