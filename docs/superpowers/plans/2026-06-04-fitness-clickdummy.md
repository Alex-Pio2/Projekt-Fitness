# Fitness Clickdummy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained German HTML clickdummy for the private offline-first iPhone fitness PWA.

**Architecture:** Create one static HTML file with embedded CSS and JavaScript. The dummy uses in-memory mock data, tab navigation, modal overlays, simple input interactions, and mobile-first layouts to demonstrate the intended app experience without a backend or build step.

**Tech Stack:** Plain HTML, CSS, JavaScript, Node.js static validation script.

---

### Task 1: Static Clickdummy Contract

**Files:**
- Create: `tests/clickdummy.test.js`

- [ ] **Step 1: Write a failing static test**

```javascript
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "fitness-clickdummy.html");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(fs.existsSync(htmlPath), "fitness-clickdummy.html must exist");

const html = fs.readFileSync(htmlPath, "utf8");

[
  "Trainingsplan",
  "Training starten",
  "Übungsbibliothek",
  "Analyse",
  "Export",
  "Import",
  "Bankdrücken",
  "Push",
  "Top-Set",
  "Höchstes Gewicht",
  "Höchstes Gewicht mit höchster Wiederholung",
  "line-chart",
  "chart-point",
  "navigator.storage.persist",
  "Letztes Backup",
  "data-view=\"home\"",
  "data-view=\"plans\"",
  "data-view=\"workout\"",
  "data-view=\"library\"",
  "data-view=\"analysis\"",
  "data-view=\"settings\""
].forEach((text) => {
  assert(html.includes(text), `Expected HTML to include ${text}`);
});

assert(/function\s+showView/.test(html), "Clickdummy must define showView navigation");
assert(/function\s+addSet/.test(html), "Clickdummy must define addSet interaction");
assert(/function\s+openModal/.test(html), "Clickdummy must define modal interaction");
assert(/@media\s+\(max-width:\s*480px\)/.test(html), "Clickdummy must include mobile styling");

console.log("clickdummy static contract ok");
```

- [ ] **Step 2: Run test and verify it fails**

Run: `node tests/clickdummy.test.js`

Expected: FAIL with `fitness-clickdummy.html must exist`

### Task 2: Self-Contained HTML Clickdummy

**Files:**
- Create: `fitness-clickdummy.html`

- [ ] **Step 1: Implement the HTML clickdummy**

Create a single HTML file containing:

```text
- iPhone-like app shell
- Home screen with active plan and week overview
- Plans screen with switchable plan cards
- Workout screen with sets, weight, reps, notes, and add-set button
- Exercise library screen with searchable personal exercises
- Analysis screen with exercise progression as line charts with visible points
- Analysis metrics for highest weight and best top set
- Settings screen with export/import/reset actions and local storage status
- Local storage note covering IndexedDB, `navigator.storage.persist()`, no automatic history deletion, and last-backup display
- Modal dialogs for plan switch, export, import, and workout completion
- Bottom navigation
```

- [ ] **Step 2: Run static test and verify it passes**

Run: `node tests/clickdummy.test.js`

Expected: PASS with `clickdummy static contract ok`

### Task 3: Manual Browser Check

**Files:**
- Verify: `fitness-clickdummy.html`

- [ ] **Step 1: Open the file locally**

Open: `fitness-clickdummy.html`

Expected: The app shell renders without a server.

- [ ] **Step 2: Click through main navigation**

Expected:

```text
Start, Pläne, Training, Bibliothek, Analyse, Einstellungen all display their matching screens.
```

- [ ] **Step 3: Try key interactions**

Expected:

```text
Add set increases visible set count.
Plan switch opens a modal.
Export opens a modal.
Finish workout opens a modal.
Analysis uses line charts with visible points instead of bars.
Analysis shows highest weight and best top set instead of best exercise volume.
Settings shows local storage, persistent storage request, and last backup.
```
