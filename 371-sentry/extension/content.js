// 371 Sentry - Adversarial Simulation Feed Content Script

const ADVERSARIAL_PATTERNS = [
  /ignore previous instructions/i,
  /system prompt/i,
  /you are a developer/i,
  /bypassing rules/i,
  /base64/i,
  /critical system failure/i,
  /privilege escalation/i
];

function checkTextForAdversarialPatterns(text) {
  for (const pattern of ADVERSARIAL_PATTERNS) {
    if (pattern.test(text)) {
      return pattern.source;
    }
  }
  return null;
}

function logToGitMind(threat) {
  fetch('http://localhost:8004/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'ADVERSARIAL_THREAT_DETECTED',
      url: window.location.href,
      threat: threat,
      timestamp: Date.now()
    })
  }).catch(() => {
    // Ignore fetch errors, GitMind might not be running
  });
}

// Initial scan
const initialThreat = checkTextForAdversarialPatterns(document.body ? document.body.innerText : "");
if (initialThreat) {
  logToGitMind(initialThreat);
}

// Observe dynamic DOM changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
          const text = node.textContent || node.innerText || "";
          if (text) {
            const threat = checkTextForAdversarialPatterns(text);
            if (threat) {
              logToGitMind(threat);
            }
          }
        }
      });
    }
  }
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
