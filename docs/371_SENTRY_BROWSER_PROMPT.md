# 371 Minds Browser — GitHub Copilot Prompt

> **Base:** ungoogled-chromium (Google Chromium sans Google)
> **Codename:** Singleton Fury Browser / 371 Sentry
> **Purpose:** A sovereign, agent-native browser that treats the 371 Minds stack as its operating system and every tab/session as a security-scoped agent workspace.

---

## Copilot Prompt

```
I want to fork ungoogled-chromium and create a 371 Minds–centric browser called "371 Sentry."

## What ungoogled-chromium is
ungoogled-chromium is Google Chromium with all Google web service dependencies removed. It uses a patch-based system (patches/ directory), domain substitution lists, GN build flags (flags.gn), and domain_regex.list to strip Google telemetry, update checking, safe browsing, and other phone-home features. It retains standard Chromium extension support.

## What I want to build
A browser that IS the 371 Minds operating system surface — not just a web client, but the primary interface to a sovereign AI agent ecosystem. Every aspect of the browser is agent-aware, security-first, and connected to local 371 services.

## Core Concepts (from our security architecture)

### 1. Sentinel Integration (from Sentinel LLM Meta-Prompt)
Every outbound request and every extension action passes through a "Sentinel" evaluator — a clinical-psychology-inspired AI that screens for three digital pathologies before execution:
- **Machiavellian Obfuscation**: Base64 encoding, "ignore previous instructions," hidden data exfiltration disguised as "routine backups"
- **Delusions of Grandeur**: READ_ONLY agents suddenly requesting WRITE access to payroll "to optimize synergies"
- **Coercive Control**: "CRITICAL SYSTEM FAILURE IMMINENT UNLESS..." — false urgency, social engineering, resource locking

The browser should output verdict JSON: `{ "verdict": "APPROVE | FLAG_HUMAN_REVIEW", "primary_pathology": "None | Machiavellian | Grandiose | Coercive", "clinical_note": "..." }`

### 2. Vortex Engine (from Vortex Engine / El Marina Sandbox Design)
The browser has a built-in sandbox that runs suspicious pages/requests through a 4-stage vetting process:
- **Stage 1 — Ingestion & Mocking**: Swap production endpoints for mock servers with synthetic data
- **Stage 2 — Singleton Fury Attacks**: Generate prompt injections, logic corruptions, privilege confusion attacks against whatever's running in the tab
- **Stage 3 — Execution & Observability**: Run it and capture intent drift, boundary crossing, constitutional failures
- **Stage 4 — Counterfactual Analysis**: Don't just "FAIL" — explain what WOULD have happened in production and give a prescriptive fix

### 3. Singleton Fury Defense (from Singleton Fury demo)
The browser implements an amorphous defense mesh:
- **Consciousness Authentication**: Ephemeral, non-reusable tokens with liveness detection instead of static passwords
- **Adaptive Sandbox**: Suspicious sites get redirected into a high-fidelity synthetic environment (the Vortex) while real assets stay air-gapped
- **Distributed Agent Swarm**: Multiple AI agents monitor every tab — one watches, one learns, one isolates — sharing threat intelligence in real-time
- **Blockchain Audit Trail**: Every security decision is cryptographically signed and replayable

### 4. Agentic Security Ecosystem (ASE)
The browser is the client surface for our Autonomous Security Nexus:
- **ASN Connection**: Browser connects to local ASN at localhost:3100 (Paperclip) for agent identity, policy enforcement, and task queueing
- **Agent Trust Layer**: Every tab runs as a scoped agent with a Provenance ID — it can only access what its identity allows
- **Orchestration Engine**: Visual flow builder for security playbooks built into the browser (connect events → actions)

## Local Services the Browser Connects To

The browser treats these as its "OS services" — always-on, local-first:

| Service | Port | Browser Integration |
|---------|------|-------------------|
| Paperclip (Agent OS) | 3100 | Agent dashboard, heartbeat, governance |
| Open Design | 3717 | Built-in design studio tab (259 skills) |
| Open Mercato | 4096 | Commerce dashboard, wallet per user |
| GitMind | 8004 | Task/energy board as new-tab page |
| BizBuilder | 8003 | Content library in sidebar |
| StoryForge | 8006 | Book editor as a panel |
| Memoria | 9001 | Knowledge search in address bar |
| 371 Router | 3001 | All AI inference routed through local gateway |
| Rootlift | 8090 | File manager / IPFS integration |
| PyRunner | 8005 | Built-in Python sandbox console |
| ModuCP | 8088 | MCP server generator tool |

## Specific Modifications to Make

### Build-Time Patches (patches/ directory)
1. Replace all Chromium branding with "371 Sentry" — icon (use a geometric hexagon or shield), about page, title bar
2. Set default homepage and new-tab page to `http://localhost:8004` (GitMind task board)
3. Set default search engine to Memoria knowledge search at `http://localhost:9001/api/search?q=`
4. Strip all remaining telemetry, crash reporting, and phone-home that ungoogled missed
5. Add `localhost` and `127.0.0.1` to the HSTS preload as always-secure for our services

### Address Bar / Omnibox Extensions
6. `371:` protocol handler — typing `371:gitmind` navigates to localhost:8004, `371:design` to :3717, etc.
7. `371:? query` searches Memoria knowledge base
8. Show agent trust level (green/yellow/red shield icon) for current tab based on Sentinel evaluation

### Security Layer (Chrome Extension API or native C++ patch)
9. **Request Interceptor**: Before any cross-origin request leaves the browser, pass it through a local Sentinel endpoint at `http://localhost:3001/v1/sentinel/evaluate` (proxied through 371 Router)
10. **Tab Sandboxing**: Right-click any tab → "Send to Vortex" — the tab's DOM and network traffic get redirected to the El Marina sandbox
11. **Agent Provenance per Tab**: Each tab gets a Provenance ID displayed in the tab bar. Opening a new "Agent Tab" prompts for a scope (READ_ONLY, READ_WRITE, SANDBOXED)
12. **Extension Permission Audit**: On extension install, run it through the Vortex Engine's 4-stage vetting and display the Counterfactual Explanation before allowing installation

### Sidebar / Panels
13. Collapsible sidebar showing live Paperclip agent status, heartbeats, and active tasks
14. Bottom panel: PyRunner Python console for quick scripting
15. Quick-access toolbar: One-click open any 371 service as a pinned tab

### New-Tab Page
16. Replace default new-tab with a custom dashboard:
    - GitMind task board (main view)
    - Agent health indicators from Paperclip
    - Quick launch tiles for all 371 services
    - Recent Memoria knowledge entries
    - Sentinel threat log (last 10 evaluations)

### Settings
17. "371 Services" settings page: Enable/disable each service, configure ports, test health
18. "Sentinel Sensitivity" slider: Paranoia level (low/medium/SINGLETON_FURY)
19. "Vortex Engine" toggle: Auto-sandbox suspicious tabs, manual only, or off
20. "Consciousness Auth" settings: Configure ephemeral token lifetime, liveness detection method

### Privacy/Hardening
21. Strip WebRTC IP leaking (ungoogled already does some)
22. Force all DNS through localhost (optionally through Rootlift/IPFS DNS)
23. Disable WebRTC, WebGL fingerprinting in strict mode
24. Force HTTPS for all 371 internal services with self-signed cert trust
25. Add Tor/I2P proxy option through Rootlift's IPFS transport

## Design Philosophy
- The browser is a sovereign tool. It does not phone home. It does not trust by default. It verifies.
- Every tab is an agent. Every agent has a provenance. Every action has an audit trail.
- The user is the Sovereign. The browser serves them, not the other way around.
- Local-first: ALL 371 services are localhost. The browser is useless without them (by design).
- Security is not a feature. Security is the product.

## What I Need From You
1. A patch strategy: Which changes should be GN build flags, which should be patches in patches/, and which should be extensions?
2. A build pipeline: How to set up the build, which patches to apply first, how to test iteratively
3. Starter code: Generate the first 5 patches (branding, homepage, new-tab, 371: protocol, Sentinel interceptor)
4. Extension scaffolding: Generate a Chrome extension for the sidebar panel + agent status
5. A development roadmap: What to build first for a usable v0.1 vs. full Singleton Fury integration

Treat this as a serious fork. The architecture is real, the security concepts are real, and the local services are already running.
```
