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

[
  "Uebung",
  "Uebungsbibliothek",
  "Plaene",
  "Saetze",
  "Hoechstes",
  "moeglichst",
  "Loeschung",
  "zuruecksetzen",
  "Bankdruecken",
  "Klimmzuege",
  "Schulterdruecken"
].forEach((text) => {
  assert(!html.includes(text), `Expected visible German text to use umlauts instead of ${text}`);
});

console.log("clickdummy static contract ok");
