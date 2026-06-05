# Fitness PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing FitPlan clickdummy into a real offline-first PWA for private iPhone use.

**Architecture:** Build a static no-build PWA using `index.html`, `src/styles.css`, `src/app.js`, `manifest.webmanifest`, and `sw.js`. App data is stored locally in IndexedDB as one versioned state document, with JSON export/import as backup.

**Tech Stack:** Plain HTML, CSS, JavaScript, IndexedDB, Service Worker, Web App Manifest, Node.js test scripts, local Node static server.

---

### Task 1: PWA Contract

**Files:**
- Create: `tests/pwa.test.js`

- [ ] Write a Node test that verifies all PWA files exist and contain the expected PWA features.
- [ ] Run `node tests/pwa.test.js` and confirm it fails before implementation.

### Task 2: App Shell

**Files:**
- Create: `index.html`
- Create: `src/styles.css`
- Create: `icons/icon.svg`

- [ ] Create a mobile-first German app shell with correct umlauts.
- [ ] Include manifest, theme color, Apple mobile metadata, stylesheet, and app script.

### Task 3: Offline PWA Runtime

**Files:**
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Create: `src/app.js`

- [ ] Register the service worker from `src/app.js`.
- [ ] Cache app shell files in `sw.js`.
- [ ] Request persistent storage with `navigator.storage.persist()`.
- [ ] Store and load app state through IndexedDB.

### Task 4: Fitness Workflows

**Files:**
- Modify: `src/app.js`
- Modify: `index.html`

- [ ] Render active weekly plan.
- [ ] Render exercise library.
- [ ] Start a workout from the active plan.
- [ ] Add sets with weight and repetitions.
- [ ] Save notes per exercise.
- [ ] Complete a workout and persist it.
- [ ] Calculate highest weight and best top set per exercise.
- [ ] Export and import JSON backups.

### Task 5: Verification

**Files:**
- Verify: all PWA files

- [ ] Run `node tests/pwa.test.js`.
- [ ] Run `node --check src/app.js`.
- [ ] Start local server.
- [ ] Open app in a browser at `http://127.0.0.1:<port>/`.
- [ ] Capture mobile screenshots for home and analysis views.
- [ ] Confirm service worker registration is present in page runtime.

