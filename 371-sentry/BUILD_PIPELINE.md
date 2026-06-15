# 371 Sentry — Build Pipeline & Development Guide

This document describes the compilation pipeline, patching order, and local development practices required to build and verify **371 Sentry** iteratively.

---

## 1. Prerequisites & Environment Setup

Building Chromium requires a robust developer environment with ample storage and RAM.

### Hardware Minimums
* **Storage**: At least 150 GB of free SSD space.
* **Memory**: 32 GB RAM minimum (64 GB highly recommended) or 16 GB with substantial swap configured.
* **Processor**: 8-core CPU or higher.

### Software Dependencies (Ubuntu/Debian)
Ensure standard build utilities and packaging configurations are installed:
```bash
sudo apt update
sudo apt install -y python3 python3-pip git ninja-build clang lld lldb quilt xz-utils
```

---

## 2. Build Pipeline Orchestration

The ungoogled-chromium build pipeline handles downloading, source file pruning, patching, and compilation. We intercept this pipeline at **Step 3 (Patching)** and **Step 5 (GN Generation)** to apply Sentry-specific components.

### Step-by-Step Pipeline

#### Step 1: Clone the Platform Repo & Unpack Source
Clone the ungoogled-chromium platform wrapper corresponding to your OS (e.g., `ungoogled-chromium-debian` or `ungoogled-chromium-macos`). Run the unpack script to retrieve the raw Chromium code matching the version in `chromium_version.txt`.
```bash
# Downloads and unpacks the target Chromium source archive to chromium_src/
python3 utils/downloads.py retrieve -i downloads.ini -c chromium_download_cache
python3 utils/downloads.py unpack -i downloads.ini -c chromium_download_cache chromium_src
```

#### Step 2: Binary Pruning
Strip all pre-built executables, telemetry binaries, and closed-source elements from the raw codebase.
```bash
python3 utils/prune_binaries.py chromium_src pruning.list
```

#### Step 3: Apply Patches (Sentry-Enhanced)
The standard ungoogled-chromium pipeline applies patches from the repo-root `patches/` directory (driven by `patches/series`). The Sentry patchset under `371-sentry/patches/` is not picked up automatically (and it currently has no `series` file), so you must explicitly integrate it.

- Option A (reuse upstream tooling): copy `371-sentry/patches/*.patch` into `patches/extra/371-sentry/` and append those paths to `patches/series`.
- Option B (separate series): add `371-sentry/patches/series` and run `python3 utils/patches.py apply chromium_src 371-sentry/patches`.

Run the standard patch step:
python3 utils/patches.py apply chromium_src patches

#### Step 4: Domain Substitution
Replace any remaining phone-home web domains with the non-existent `qjz9zk` top-level domain.
```bash
python3 utils/domain_substitution.py apply -r domain_regex.list -f domain_substitution.list -s chromium_src
```

#### Step 5: GN Flag Setup & Generation
Ensure `flags.gn` contains Sentry's hardened, microservice-friendly parameters, then generate the Ninja build targets.
```bash
# Generate Ninja files inside out/Default
gn gen out/Default --args="$(cat flags.gn)"
```

#### Step 6: Compilation
Trigger the C++ build. This can take several hours depending on machine specs.
```bash
ninja -C out/Default chrome
```

---

## 3. Iterative Testing & Verification

Because a full Chromium build takes hours, you should optimize your development cycles:

### Fast UI/Extension Iteration (Instant)
Do not rebuild Chromium to test changes to the Paperclip sidebar or local dashboard!
1. Use an existing Sentry or pre-built ungoogled-chromium binary.
2. Navigate to `chrome://extensions`.
3. Enable **Developer Mode** (toggle in the top-right).
4. Click **Load Unpacked** and select the `/371-sentry/extension/` directory.
5. Sentry's dashboard sidebar will render instantly, let you inspect connections to your local services (localhost), and debug logic in Chrome DevTools.

### Verifying C++ Patches Independently
* Before committing patch changes, run the repository config validation scripts to ensure they are grammatically sound:
  ```bash
  python3 ./devutils/validate_config.py
  ```
* Test specific sub-components by compiling isolated targets instead of the entire browser. For example, to verify the Omnibox changes:
  ```bash
  ninja -C out/Default components_unittests
  ```
