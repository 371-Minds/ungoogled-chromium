# 371 Sentry — Patch Strategy

This document details the architectural strategy for patching and configuring ungoogled-chromium to create the agent-native, sovereign **371 Sentry** browser. It defines which modifications should be made using GN build flags, which require native C++ patches, and which are delegated to the Chrome Extension layer.

---

## 1. GN Build Flags (`flags.gn`)

GN build flags are the most robust, maintainable way to enable/disable entire Chromium subsystems. By using GN flags, we strip heavy dependency frameworks at compile time, reducing binary size and avoiding maintenance overhead.

### Sentry-Specific GN Configuration
The following arguments must be appended to the custom `flags.gn` file of the build target:

```gn
# Disable standard Chromium features that run counter to sovereign containment
enable_gcm = false                          # Disable Google Cloud Messaging
enable_safe_browsing = false                 # Disable Google's phone-home Safe Browsing
enable_hangout_services_extension = false   # Disable built-in Hangout dependencies
enable_speech_service = false               # Disable Google-based offline/online speech recognition
enable_service_discovery = false            # Disable network broadcast/multicast services by default
google_api_key = "no"                       # Avoid using default Google API keys
google_default_client_id = "no"
google_default_client_secret = "no"

# Harden compilation flags
is_official_build = true                    # Enable optimizations and strict code path validations
is_debug = false                            # Strip symbols and debug hooks for production Sentry builds
symbol_level = 0                            # Exclude bloated debugging symbols to speed up build
```

---

## 2. Build-Time Patches (`patches/`)

Low-level protocol overrides, native navigation hijacking, UI name branding, and early-stage request interception cannot be achieved through Extensions alone. These require target-specific C++ patches applied directly to the Chromium codebase.

### Critical Modification Targets

| Feature Group | Code File | Modification Goal |
| :--- | :--- | :--- |
| **Product Branding** | `chrome/app/generated_resources.grd` | Replace references to `"Chromium"` with `"371 Sentry"` in all locale bundles. |
| **New Tab Page (NTP)** | `chrome/browser/chrome_content_browser_client.cc` | Hardcode or parameterize default New Tab fallback URL to `http://localhost:8004`. |
| **Omnibox Protocols** | `chrome/browser/chrome_content_browser_client.cc` | Register `371:` as a first-class URL scheme and handle its routing natively before network dispatch. |
| **Sentinel Interception** | `chrome/browser/chrome_content_browser_client.cc` | Override `CreateURLLoaderThrottles` to register a custom `URLLoaderThrottle` checking all cross-origin requests. |
| **Local Preloads / HSTS** | `net/http/transport_security_state_static.json` | Pre-load `localhost` and `127.0.0.1` as always-secure (HTTPS-enforced) to protect local service bindings. |

---

## 3. Web Extension Layer (Chrome Extension API)

Sovereign UI elements, Paperclip Agent state visuals, localized sidebars, and modular orchestration tools are implemented as a **pre-installed background extension**.

### Extension Responsibility Matrix

Using an extension for the UI layer is a core architectural choice that separates critical security logic from interface churn:

1. **Paperclip Live Dashboard**: Leverages the MV3 `chrome.sidePanel` API to render active agent statuses, heartbeats, and current tasks.
2. **Tab Isolation & Tracking**: Listens to `chrome.tabs` lifecycle events to tag every single window/tab with a unique, non-spoofable **Provenance ID** stored in isolated extension storage.
3. **Counterfactual Sandbox Integration**: Integrates right-click context menu options (`chrome.contextMenus`) to manually trigger "Send to Vortex", redirecting execution to the local mock sandboxes.
4. **Local Port Management**: Integrates a custom extension page that queries health endpoints for all ports `3100`, `3717`, `4096`, `8003`, `8004`, `8005`, `8006`, `8088`, `8090`, and `9001`.
