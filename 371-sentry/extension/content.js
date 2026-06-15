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
let pendingTextChars = 0;
const MAX_PENDING_TEXT_CHARS = 50000;

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
  pendingTextChars = 0;
  const threat = checkTextForAdversarialPatterns(combinedText);
  if (threat) {
    logToGitMind(threat);
  }
}

function queueTextForScan(text) {
  if (!text) return;
  if (pendingTextChars >= MAX_PENDING_TEXT_CHARS) return;
  const remaining = MAX_PENDING_TEXT_CHARS - pendingTextChars;
  const boundedText = text.slice(0, remaining);
  if (boundedText.length === 0) return;
  pendingTexts.push(boundedText);
  pendingTextChars += boundedText.length;
}

function scheduleScan() {
  if (pendingTexts.length > 0) {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processPendingTexts, 1000);
  }
}

// Observe dynamic DOM changes
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
          queueTextForScan(node.textContent || "");
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          enforceConsciousnessAuth(node);
        }
      });
    }
  }

  scheduleScan();
});

// Consciousness Authentication Form Interceptor
function enforceConsciousnessAuth(rootNode) {
  if (!rootNode.querySelectorAll) return;
  const forms = rootNode.querySelectorAll("form");
  forms.forEach(form => {
    if (form.dataset.consciousnessEnforced) return;
    
    const passwordInputs = form.querySelectorAll("input[type='password']");
    if (passwordInputs.length > 0) {
      form.dataset.consciousnessEnforced = "true";
      
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Retrieve ephemeral consciousness token (mock liveness detection)
        const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
          .map(b => b.toString(16).padStart(2, '0')).join('');
        const token = `371-AUTH-${randomHex}-${Date.now()}`;
        
        // Strip out existing passwords
        passwordInputs.forEach(input => {
          input.value = ""; 
          input.disabled = true;
          input.placeholder = "[Consciousness Token Secured]";
        });
        
        // Inject token into the form
        let tokenInput = form.querySelector("input[name='consciousness_token']");
        if (!tokenInput) {
          tokenInput = document.createElement("input");
          tokenInput.type = "hidden";
          tokenInput.name = "consciousness_token";
          form.appendChild(tokenInput);
        }
        tokenInput.value = token;
        
        // Log action
        console.log("Sovereign Sentry: Consciousness Authentication enforced. Standard credentials replaced with ephemeral token.");
        
        // Resubmit bypassing listeners
        form.submit();
      });
    }
  });
}

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
  queueTextForScan(document.body.textContent || "");
  enforceConsciousnessAuth(document.body);
  scheduleScan();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true });
    queueTextForScan(document.body.textContent || "");
    enforceConsciousnessAuth(document.body);
    scheduleScan();
  });
}
