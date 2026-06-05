const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`${relativePath} must exist`);
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const index = read("index.html");
const manifest = JSON.parse(read("manifest.webmanifest"));
const sw = read("sw.js");
const app = read("src/app.js");
const styles = read("src/styles.css");
const icon = read("icons/icon.svg");
read(".nojekyll");

[
  '<link rel="manifest" href="manifest.webmanifest">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<script type="module" src="src/app.js"></script>',
  'data-view="home"',
  'data-view="plans"',
  'data-view="workout"',
  'data-view="library"',
  'data-view="analysis"',
  'data-view="settings"',
  "Übungsbibliothek",
  "Plan bearbeiten",
  "Planname",
  "Trainingstag",
  "Zum Tag hinzufügen",
  "Höchstes Gewicht",
  "Höchstes Gewicht mit höchster Wiederholung",
  "Letztes Backup"
].forEach((text) => {
  assert(index.includes(text), `index.html must include ${text}`);
});

assert(manifest.name === "FitPlan", "manifest name must be FitPlan");
assert(manifest.display === "standalone", "manifest display must be standalone");
assert(manifest.start_url === "./", "manifest start_url must be ./");
assert(manifest.scope === "./", "manifest scope must be ./");
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 1, "manifest must include icons");

[
  "install",
  "activate",
  "fetch",
  "index.html",
  "src/app.js",
  "src/styles.css",
  "manifest.webmanifest"
].forEach((text) => {
  assert(sw.includes(text), `sw.js must include ${text}`);
});

[
  "indexedDB.open",
  "navigator.storage.persist",
  "navigator.serviceWorker.register",
  "exportBackup",
  "importBackup",
  "completeWorkout",
  "renderPlanEditor",
  "savePlanName",
  "savePlanDayTitle",
  "addExerciseToPlanDay",
  "removeExerciseFromPlanDay",
  "removeExercise",
  "Übung entfernen",
  "calculateExerciseStats",
  "renderAnalysis",
  "FitPlan"
].forEach((text) => {
  assert(app.includes(text), `src/app.js must include ${text}`);
});

[
  "@media (max-width: 480px)",
  ".line-chart",
  ".chart-point",
  ".bottom-nav",
  "env(safe-area-inset-bottom"
].forEach((text) => {
  assert(styles.includes(text), `src/styles.css must include ${text}`);
});

[
  "Uebung",
  "Uebungsbibliothek",
  "Plaene",
  "Saetze",
  "Hoechstes",
  "Bankdruecken",
  "Klimmzuege"
].forEach((text) => {
  assert(!index.includes(text), `index.html must use umlauts instead of ${text}`);
  assert(!app.includes(text), `src/app.js must use umlauts instead of ${text}`);
});

assert(icon.includes("<svg"), "icon must be SVG");
assert(!fs.existsSync(path.join(root, "server.mjs")), "server.mjs must not exist");

console.log("pwa contract ok");
