# 371 Sentry — Development Roadmap

This document outlines the phased development roadmap to evolve **371 Sentry** from a structured plan to a fully hardened, agent-native sovereign operating system client.

---

## Phase 1: Sovereign Core Foundation (v0.1)
*Goal: Implement the primary branding, native redirects, and base connections.*

- [x] **Product Re-Branding**: Applied build-time patches to completely replace "Chromium" with "371 Sentry".
- [x] **Direct NTP / Homepage Integration**: Set default New Tab Page fallback directly to `http://localhost:8004` (GitMind task board) so the browser opens directly into the 371 operating center.
- [x] **371: Protocol Handler Scaffolding**: Registered the native C++ redirection handling for `371:gitmind` -> `:8004`, `371:design` -> `:3717`, etc.
- [x] **Sovereign Extension Scaffolding**: Structured the background worker, sidebar, and tab tracking extension for UI integrations.
- [x] **Hardened local SSL preloads**: Add `localhost`, `127.0.0.1` and Tailscale to the HSTS preload list (`net/http/transport_security_state_static.json`) so internal port bindings are forced through strict secure tunnels.

---

## Phase 2: Autonomous Security Nexus (v0.2 - v0.4)
*Goal: Integrate active outbound request evaluation and tab provenance monitoring.*

- [x] **Tab Provenance ID Mapping**: Implement strict Provenance ID session assignments. When an agent tab is opened, prompt user/Paperclip to define session boundaries (`READ_ONLY`, `READ_WRITE`, `SANDBOXED`).
- [ ] **Sentinel Outbound Traffic Interception** *(scaffolded)*: `URLLoaderThrottle` class added; deferral and verdict-based resume are wired but the 371 Router integration is not yet complete end-to-end.
- [ ] **Live Verdict Rendering** *(scaffolded)*: Sidebar polls the Router endpoint and logs verdicts; deduplication and bounded DOM growth are in place but full clinical pathology display is pending.

---

## Phase 3: Vortex Engine & Sandbox (v0.5 - v0.8)
*Goal: Seamless tab isolation and counters against adversarial prompt execution.*

- [x] **Interactive Sandbox Redirection**: Complete the "Send to Vortex" flow, redirecting tab DOM states, frame elements, and mock APIs directly to the El Marina synthetic environment.
- [x] **Automated Extension Auditing**: Intercept all incoming extension installation requests, feed their package models into the local Vortex Engine sandbox, and display Counterfactual explanations before execution.
- [x] **Adversarial Simulation Feed**: Monitor tabs for prompt injections and priv-confusion attempts, logging them back to GitMind.

---

## Phase 4: Singleton Fury Integration (v1.0)
*Goal: Full Sovereign Mesh operation.*

- [ ] **Consciousness Authentication**: Replace standard input credentials with ephemeral, non-reusable tokens verified via microservice liveness detection.
- [ ] **Cryptographic Security Logs**: Generate cryptographically signed audit logs of every security decision, writing them straight to a local blockchain ledger.
- [ ] **Distributed Sentry Swarm**: Enable multi-agent monitoring on every browser tab (one monitoring, one isolating, one tracing).
