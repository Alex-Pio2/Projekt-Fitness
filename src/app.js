const DB_NAME = "fitplan-db";
const DB_VERSION = 1;
const STORE_NAME = "state";
const STATE_KEY = "fitplan-state";

const WEEKDAYS = [
  ["monday", "Mo", "Montag"],
  ["tuesday", "Di", "Dienstag"],
  ["wednesday", "Mi", "Mittwoch"],
  ["thursday", "Do", "Donnerstag"],
  ["friday", "Fr", "Freitag"],
  ["saturday", "Sa", "Samstag"],
  ["sunday", "So", "Sonntag"]
];

const viewTitles = {
  home: ["FitPlan", "Offline-first Trainingsplan für dein iPhone"],
  plans: ["Trainingspläne", "Wochenpläne erstellen und wechseln"],
  workout: ["Training", "Sätze, Gewicht, Wiederholungen und Notizen"],
  library: ["Übungsbibliothek", "Deine persönlichen Übungen"],
  analysis: ["Analyse", "Fortschritt pro Übung über Zeit"],
  settings: ["Backup", "Export, Import und lokale Daten"]
};

let state;
let currentWorkout = null;

const elements = {};

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}

function todayKey() {
  const index = (new Date().getDay() + 6) % 7;
  return WEEKDAYS[index][0];
}

function formatDate(value) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function formatNumber(value) {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 1
  }).format(value);
}

function formatWeight(value) {
  return `${formatNumber(value)} kg`;
}

function defaultState() {
  const exercises = [
    { id: "bench", name: "Bankdrücken", category: "Brust", note: "Langhantel, flache Bank" },
    { id: "shoulder-press", name: "Schulterdrücken", category: "Schulter", note: "Kurzhanteln sitzend" },
    { id: "triceps", name: "Trizepsdrücken", category: "Arme", note: "Kabelzug" },
    { id: "pullups", name: "Klimmzüge", category: "Rücken", note: "Körpergewicht" },
    { id: "row", name: "Rudern am Kabel", category: "Rücken", note: "Neutraler Griff" },
    { id: "curls", name: "Bizepscurls", category: "Arme", note: "Kurzhanteln" },
    { id: "squat", name: "Kniebeugen", category: "Beine", note: "Langhantel" },
    { id: "leg-press", name: "Beinpresse", category: "Beine", note: "45 Grad Maschine" },
    { id: "leg-curl", name: "Beinbeuger", category: "Beine", note: "Maschine" }
  ];

  const plans = [
    {
      id: "plan-summer",
      name: "Hypertrophie Sommer",
      active: true,
      days: {
        monday: { title: "Push", exerciseIds: ["bench", "shoulder-press", "triceps"] },
        tuesday: { title: "frei", exerciseIds: [] },
        wednesday: { title: "Pull", exerciseIds: ["pullups", "row", "curls"] },
        thursday: { title: "frei", exerciseIds: [] },
        friday: { title: "Beine", exerciseIds: ["squat", "leg-press", "leg-curl"] },
        saturday: { title: "Core", exerciseIds: [] },
        sunday: { title: "frei", exerciseIds: [] }
      }
    },
    {
      id: "plan-strength",
      name: "Kraftblock",
      active: false,
      days: {
        monday: { title: "Oberkörper", exerciseIds: ["bench", "row", "shoulder-press"] },
        wednesday: { title: "Unterkörper", exerciseIds: ["squat", "leg-press"] },
        friday: { title: "Ganzkörper", exerciseIds: ["bench", "pullups", "squat"] }
      }
    }
  ];

  const sessions = [
    session("plan-summer", "monday", "Push", -28, {
      bench: [[65, 8], [65, 7], [62.5, 8]],
      "shoulder-press": [[22.5, 10], [22.5, 8]]
    }),
    session("plan-summer", "monday", "Push", -21, {
      bench: [[67.5, 7], [67.5, 7], [65, 8]],
      "shoulder-press": [[24, 8], [22.5, 9]]
    }),
    session("plan-summer", "monday", "Push", -14, {
      bench: [[70, 8], [70, 7], [65, 8]],
      "shoulder-press": [[24, 9], [24, 8]]
    }),
    session("plan-summer", "wednesday", "Pull", -7, {
      pullups: [[0, 8], [0, 7]],
      row: [[62.5, 10], [62.5, 9], [60, 10]],
      curls: [[12.5, 10], [12.5, 9]]
    }),
    session("plan-summer", "monday", "Push", -3, {
      bench: [[72.5, 5], [70, 7], [67.5, 8]],
      "shoulder-press": [[24, 10], [24, 8]]
    })
  ];

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    settings: {
      activePlanId: "plan-summer",
      lastBackupAt: null,
      storagePersisted: false
    },
    exercises,
    plans,
    sessions
  };
}

function session(planId, weekday, title, daysAgo, exerciseSets) {
  const date = new Date();
  date.setDate(date.getDate() + daysAgo);

  return {
    id: uid("session"),
    planId,
    weekday,
    title,
    date: date.toISOString(),
    completedAt: date.toISOString(),
    exerciseLogs: Object.entries(exerciseSets).map(([exerciseId, sets]) => ({
      exerciseId,
      note: "",
      sets: sets.map(([weight, reps]) => ({ id: uid("set"), weight, reps, createdAt: date.toISOString() }))
    }))
  };
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadState() {
  const db = await openDatabase();
  const stored = await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  if (stored) {
    return stored;
  }

  const seed = defaultState();
  await saveState(seed);
  return seed;
}

async function saveState(nextState = state) {
  const db = await openDatabase();
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const request = transaction.objectStore(STORE_NAME).put(nextState, STATE_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function requestPersistentStorage() {
  let persisted = false;
  let estimate = null;

  if (navigator.storage?.persist) {
    persisted = await navigator.storage.persist();
  }

  if (navigator.storage?.persisted) {
    persisted = persisted || await navigator.storage.persisted();
  }

  if (navigator.storage?.estimate) {
    estimate = await navigator.storage.estimate();
  }

  state.settings.storagePersisted = Boolean(persisted);
  await saveState();
  return { persisted, estimate };
}

function activePlan() {
  return state.plans.find((plan) => plan.id === state.settings.activePlanId) || state.plans[0];
}

function exerciseById(id) {
  return state.exercises.find((exercise) => exercise.id === id);
}

function ensurePlanDay(plan, weekday) {
  if (!plan.days[weekday]) {
    plan.days[weekday] = { title: "frei", exerciseIds: [] };
  }

  if (!Array.isArray(plan.days[weekday].exerciseIds)) {
    plan.days[weekday].exerciseIds = [];
  }

  return plan.days[weekday];
}

function initElements() {
  [
    "clock", "screenTitle", "screenSubtitle", "offlineStatus", "activePlanName", "weekLabel",
    "weekGrid", "todayPanel", "todayTitle", "todayDescription", "startTodayButton",
    "sessionCount", "lastBackupMetric", "recentList", "plansList", "workoutTitle",
    "planEditorSelect", "planNameInput", "planDaySelect", "planDayTitleInput",
    "savePlanNameButton", "savePlanDayButton", "planExerciseSelect", "addPlanExerciseButton",
    "planDayExerciseList", "workoutSubtitle", "workoutExercises", "completeWorkoutButton", "exerciseName",
    "exerciseCategory", "exerciseNote", "saveExerciseButton", "exerciseSearch", "exerciseList",
    "analysisExercise", "bestWeight", "bestTopSet", "analysisCount", "weightChart",
    "topSetChart", "storagePersisted", "storageUsage", "exportButton", "importFile",
    "resetButton", "modal", "modalTitle", "modalText", "modalClose"
  ].forEach((id) => {
    elements[id] = document.getElementById(id);
  });
}

function wireEvents() {
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.go));
  });

  elements.startTodayButton.addEventListener("click", () => startWorkout(todayKey()));
  elements.completeWorkoutButton.addEventListener("click", completeWorkout);
  elements.planEditorSelect.addEventListener("change", renderPlanEditor);
  elements.planDaySelect.addEventListener("change", renderPlanEditor);
  elements.savePlanNameButton.addEventListener("click", savePlanName);
  elements.savePlanDayButton.addEventListener("click", savePlanDayTitle);
  elements.addPlanExerciseButton.addEventListener("click", addExerciseToPlanDay);
  elements.saveExerciseButton.addEventListener("click", addExercise);
  elements.exerciseSearch.addEventListener("input", renderLibrary);
  elements.analysisExercise.addEventListener("change", renderAnalysis);
  elements.exportButton.addEventListener("click", exportBackup);
  elements.importFile.addEventListener("change", importBackup);
  elements.resetButton.addEventListener("click", resetDemoData);
  elements.modalClose.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

function showView(viewName) {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === viewName);
  });

  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.go === viewName);
  });

  elements.screenTitle.textContent = viewTitles[viewName][0];
  elements.screenSubtitle.textContent = viewTitles[viewName][1];
  document.getElementById("mainContent").scrollTo({ top: 0, behavior: "smooth" });
  history.replaceState(null, "", `#${viewName}`);
}

function render() {
  renderClock();
  renderHome();
  renderPlans();
  renderWorkout();
  renderLibrary();
  renderAnalysisOptions();
  renderAnalysis();
  renderSettings();
}

function renderClock() {
  elements.clock.textContent = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date());
}

function renderHome() {
  const plan = activePlan();
  const currentDay = todayKey();
  const plannedDay = plan.days[currentDay] || { title: "frei", exerciseIds: [] };

  elements.activePlanName.textContent = plan.name;
  elements.weekLabel.textContent = `KW ${getWeekNumber(new Date())}`;
  elements.sessionCount.textContent = String(state.sessions.length);
  elements.lastBackupMetric.textContent = state.settings.lastBackupAt ? formatDate(state.settings.lastBackupAt) : "Nie";

  elements.weekGrid.innerHTML = WEEKDAYS.map(([key, shortLabel]) => {
    const day = plan.days[key] || { title: "frei", exerciseIds: [] };
    const isToday = key === currentDay;
    return `
      <button class="day-tile ${isToday ? "today" : ""}" type="button" data-weekday="${key}">
        <strong>${shortLabel}</strong>
        <span>${day.title || "frei"}</span>
      </button>
    `;
  }).join("");

  elements.weekGrid.querySelectorAll("[data-weekday]").forEach((button) => {
    button.addEventListener("click", () => startWorkout(button.dataset.weekday));
  });

  elements.todayTitle.textContent = `${weekdayLabel(currentDay)}: ${plannedDay.title || "frei"}`;
  elements.todayDescription.textContent = plannedDay.exerciseIds.length
    ? plannedDay.exerciseIds.map((id) => exerciseById(id)?.name).filter(Boolean).join(", ")
    : "Kein Workout geplant. Du kannst den Wochentag im Plan bearbeiten.";
  elements.startTodayButton.disabled = !plannedDay.exerciseIds.length;

  const recent = [...state.sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  elements.recentList.innerHTML = recent.length ? recent.map((item) => `
    <div class="list-item">
      <div>
        <h3>${item.title}</h3>
        <span class="muted">${formatDate(item.date)} · ${countSets(item)} Sätze</span>
      </div>
      <span class="tag">${weekdayLabel(item.weekday)}</span>
    </div>
  `).join("") : `<div class="empty-state">Noch keine Trainings gespeichert.</div>`;
}

function renderPlans() {
  elements.plansList.innerHTML = state.plans.map((plan) => {
    const days = WEEKDAYS
      .map(([key]) => {
        const day = ensurePlanDay(plan, key);
        return `<div class="list-item"><span>${weekdayLabel(key)}: ${day.title || "frei"}</span><span class="tag">${day.exerciseIds.length} Übungen</span></div>`;
      })
      .join("");

    return `
      <section class="card">
        <div class="section-head">
          <div>
            <h2>${plan.name}</h2>
            <p class="muted">${plan.active ? "Aktiver Trainingsplan" : "Inaktiv"}</p>
          </div>
          <button class="btn ${plan.active ? "secondary" : "green"}" type="button" data-active-plan="${plan.id}">
            ${plan.active ? "Aktiv" : "Aktiv setzen"}
          </button>
        </div>
        <div class="list">${days}</div>
      </section>
    `;
  }).join("");

  elements.plansList.querySelectorAll("[data-active-plan]").forEach((button) => {
    button.addEventListener("click", async () => {
      state.settings.activePlanId = button.dataset.activePlan;
      state.plans.forEach((plan) => {
        plan.active = plan.id === state.settings.activePlanId;
      });
      await saveState();
      render();
    });
  });

  document.getElementById("addPlanButton").onclick = async () => {
    const id = uid("plan");
    state.plans.push({
      id,
      name: `Neuer Plan ${state.plans.length + 1}`,
      active: false,
      days: Object.fromEntries(WEEKDAYS.map(([key]) => [key, { title: "frei", exerciseIds: [] }]))
    });
    await saveState();
    render();
    openModal("Plan angelegt", "Der neue Wochenplan wurde lokal gespeichert.");
  };

  renderPlanEditor();
}

function selectedPlanForEditing() {
  const selectedPlanId = elements.planEditorSelect.value || state.settings.activePlanId;
  return state.plans.find((plan) => plan.id === selectedPlanId) || activePlan();
}

function renderPlanEditor() {
  const previousPlanId = elements.planEditorSelect.value || state.settings.activePlanId;
  const previousDay = elements.planDaySelect.value || todayKey();
  const plan = state.plans.find((item) => item.id === previousPlanId) || activePlan();

  elements.planEditorSelect.innerHTML = state.plans.map((item) =>
    `<option value="${item.id}">${item.name}</option>`
  ).join("");
  elements.planEditorSelect.value = plan.id;

  elements.planNameInput.value = plan.name;
  elements.planDaySelect.innerHTML = WEEKDAYS.map(([key, shortLabel, longLabel]) =>
    `<option value="${key}">${shortLabel} - ${longLabel}</option>`
  ).join("");
  elements.planDaySelect.value = WEEKDAYS.some(([key]) => key === previousDay) ? previousDay : todayKey();

  const day = ensurePlanDay(plan, elements.planDaySelect.value);
  elements.planDayTitleInput.value = day.title || "frei";

  const usedExerciseIds = new Set(day.exerciseIds);
  const availableExercises = state.exercises.filter((exercise) => !usedExerciseIds.has(exercise.id));
  elements.planExerciseSelect.innerHTML = availableExercises.length
    ? availableExercises.map((exercise) => `<option value="${exercise.id}">${exercise.name}</option>`).join("")
    : `<option value="">Keine weitere Übung verfügbar</option>`;
  elements.planExerciseSelect.disabled = !availableExercises.length;
  elements.addPlanExerciseButton.disabled = !availableExercises.length;

  elements.planDayExerciseList.innerHTML = day.exerciseIds.length ? day.exerciseIds.map((exerciseId) => {
    const exercise = exerciseById(exerciseId);
    return `
      <div class="list-item">
        <div>
          <h3>${exercise?.name || "Gelöschte Übung"}</h3>
          <span class="muted">${exercise?.note || exercise?.category || "Keine Notiz"}</span>
        </div>
        <button class="btn coral small-action" type="button" data-remove-plan-exercise="${exerciseId}">
          Übung entfernen
        </button>
      </div>
    `;
  }).join("") : `<div class="empty-state">Dieser Trainingstag hat noch keine Übungen.</div>`;

  elements.planDayExerciseList.querySelectorAll("[data-remove-plan-exercise]").forEach((button) => {
    button.addEventListener("click", () => removeExerciseFromPlanDay(plan.id, elements.planDaySelect.value, button.dataset.removePlanExercise));
  });
}

async function savePlanName() {
  const plan = selectedPlanForEditing();
  const name = elements.planNameInput.value.trim();

  if (!name) {
    openModal("Planname fehlt", "Bitte gib einen Namen für den Trainingsplan ein.");
    return;
  }

  plan.name = name;
  await saveState();
  render();
  elements.planEditorSelect.value = plan.id;
  openModal("Plan gespeichert", "Der Planname wurde lokal gespeichert.");
}

async function savePlanDayTitle() {
  const plan = selectedPlanForEditing();
  const weekday = elements.planDaySelect.value;
  const day = ensurePlanDay(plan, weekday);
  day.title = elements.planDayTitleInput.value.trim() || "frei";

  await saveState();
  render();
  elements.planEditorSelect.value = plan.id;
  elements.planDaySelect.value = weekday;
  renderPlanEditor();
  openModal("Trainingstag gespeichert", "Der Trainingstag wurde lokal im Plan aktualisiert.");
}

async function addExerciseToPlanDay() {
  const plan = selectedPlanForEditing();
  const weekday = elements.planDaySelect.value;
  const day = ensurePlanDay(plan, weekday);
  const exerciseId = elements.planExerciseSelect.value;

  if (!exerciseId) {
    return;
  }

  if (!day.exerciseIds.includes(exerciseId)) {
    day.exerciseIds.push(exerciseId);
  }

  await saveState();
  render();
  elements.planEditorSelect.value = plan.id;
  elements.planDaySelect.value = weekday;
  renderPlanEditor();
  openModal("Übung hinzugefügt", "Die Übung wurde dem Trainingstag hinzugefügt.");
}

async function removeExerciseFromPlanDay(planId, weekday, exerciseId) {
  const plan = state.plans.find((item) => item.id === planId);
  if (!plan) {
    return;
  }

  const day = ensurePlanDay(plan, weekday);
  day.exerciseIds = day.exerciseIds.filter((id) => id !== exerciseId);

  await saveState();
  render();
  elements.planEditorSelect.value = plan.id;
  elements.planDaySelect.value = weekday;
  renderPlanEditor();
  openModal("Übung entfernt", "Die Übung wurde aus diesem Trainingstag entfernt.");
}

function startWorkout(weekday) {
  const plan = activePlan();
  const day = plan.days[weekday];

  if (!day?.exerciseIds?.length) {
    openModal("Kein Training geplant", "Für diesen Tag sind noch keine Übungen im aktiven Plan hinterlegt.");
    return;
  }

  currentWorkout = {
    id: uid("workout"),
    planId: plan.id,
    weekday,
    title: day.title,
    date: new Date().toISOString(),
    exerciseLogs: day.exerciseIds.map((exerciseId) => ({ exerciseId, note: "", sets: [] }))
  };

  renderWorkout();
  showView("workout");
}

function renderWorkout() {
  if (!currentWorkout) {
    elements.workoutTitle.textContent = "Kein Training aktiv";
    elements.workoutSubtitle.textContent = "Starte ein Training aus deinem Wochenplan.";
    elements.workoutExercises.innerHTML = `<div class="empty-state">Noch kein Live-Training gestartet.</div>`;
    elements.completeWorkoutButton.disabled = true;
    return;
  }

  elements.workoutTitle.textContent = `${weekdayLabel(currentWorkout.weekday)}: ${currentWorkout.title}`;
  elements.workoutSubtitle.textContent = "Trage Gewicht und Wiederholungen ein. Alles wird lokal gespeichert.";
  elements.completeWorkoutButton.disabled = false;

  elements.workoutExercises.innerHTML = currentWorkout.exerciseLogs.map((log) => {
    const exercise = exerciseById(log.exerciseId);
    const rows = log.sets.map((set, index) => `<tr><td>${index + 1}</td><td>${set.weight} kg</td><td>${set.reps}</td></tr>`).join("");

    return `
      <section class="panel" data-workout-exercise="${log.exerciseId}">
        <div class="section-head">
          <div>
            <h2>${exercise?.name || "Gelöschte Übung"}</h2>
            <p class="muted">${exercise?.note || exercise?.category || "Nicht mehr in der Bibliothek"}</p>
          </div>
          <span class="tag green">${log.sets.length} ${log.sets.length === 1 ? "Satz" : "Sätze"}</span>
        </div>
        <table class="set-table">
          <thead><tr><th>Satz</th><th>Gewicht</th><th>Wdh.</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="set-inputs">
          <input inputmode="decimal" placeholder="kg" data-weight="${log.exerciseId}">
          <input inputmode="numeric" placeholder="Wdh." data-reps="${log.exerciseId}">
          <button class="btn green" type="button" data-add-set="${log.exerciseId}">+</button>
        </div>
        <label>Notiz<textarea data-note="${log.exerciseId}" placeholder="Kurze Notiz">${log.note}</textarea></label>
      </section>
    `;
  }).join("");

  elements.workoutExercises.querySelectorAll("[data-add-set]").forEach((button) => {
    button.addEventListener("click", () => addSet(button.dataset.addSet));
  });

  elements.workoutExercises.querySelectorAll("[data-note]").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      currentWorkout.exerciseLogs.find((log) => log.exerciseId === textarea.dataset.note).note = textarea.value;
    });
  });
}

function addSet(exerciseId) {
  const weightInput = elements.workoutExercises.querySelector(`[data-weight="${exerciseId}"]`);
  const repsInput = elements.workoutExercises.querySelector(`[data-reps="${exerciseId}"]`);
  const weight = Number(String(weightInput.value).replace(",", "."));
  const reps = Number(repsInput.value);

  if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0) {
    openModal("Satz unvollständig", "Bitte Gewicht und Wiederholungen eintragen.");
    return;
  }

  currentWorkout.exerciseLogs.find((log) => log.exerciseId === exerciseId).sets.push({
    id: uid("set"),
    weight,
    reps,
    createdAt: new Date().toISOString()
  });

  weightInput.value = "";
  repsInput.value = "";
  renderWorkout();
}

async function completeWorkout() {
  if (!currentWorkout) {
    return;
  }

  const hasSets = currentWorkout.exerciseLogs.some((log) => log.sets.length);
  if (!hasSets) {
    openModal("Keine Sätze", "Trage mindestens einen Satz ein, bevor du das Training abschließt.");
    return;
  }

  currentWorkout.completedAt = new Date().toISOString();
  state.sessions.push(currentWorkout);
  currentWorkout = null;
  await saveState();
  render();
  showView("analysis");
  openModal("Training gespeichert", "Deine Einheit wurde lokal gespeichert und ist in der Analyse sichtbar.");
}

function renderLibrary() {
  const query = elements.exerciseSearch.value.trim().toLowerCase();
  const exercises = state.exercises.filter((exercise) => {
    const haystack = `${exercise.name} ${exercise.category} ${exercise.note}`.toLowerCase();
    return haystack.includes(query);
  });

  elements.exerciseList.innerHTML = exercises.length ? exercises.map((exercise) => `
    <div class="list-item">
      <div>
        <h3>${exercise.name}</h3>
        <span class="muted">${exercise.note || "Keine Notiz"}</span>
      </div>
      <div class="list-actions">
        <span class="tag">${exercise.category || "Allgemein"}</span>
        <button class="btn coral small-action" type="button" data-remove-exercise="${exercise.id}">Übung entfernen</button>
      </div>
    </div>
  `).join("") : `<div class="empty-state">Keine Übung gefunden.</div>`;

  elements.exerciseList.querySelectorAll("[data-remove-exercise]").forEach((button) => {
    button.addEventListener("click", () => removeExercise(button.dataset.removeExercise));
  });
}

async function addExercise() {
  const name = elements.exerciseName.value.trim();
  if (!name) {
    openModal("Name fehlt", "Bitte gib einen Übungsnamen ein.");
    return;
  }

  state.exercises.push({
    id: uid("exercise"),
    name,
    category: elements.exerciseCategory.value.trim() || "Allgemein",
    note: elements.exerciseNote.value.trim()
  });

  elements.exerciseName.value = "";
  elements.exerciseCategory.value = "";
  elements.exerciseNote.value = "";
  await saveState();
  renderLibrary();
  renderPlans();
  renderAnalysisOptions();
  openModal("Übung gespeichert", "Die Übung wurde lokal in deiner Bibliothek gespeichert.");
}

async function removeExercise(exerciseId) {
  const exercise = exerciseById(exerciseId);
  if (!exercise) {
    return;
  }

  state.exercises = state.exercises.filter((item) => item.id !== exerciseId);
  state.plans.forEach((plan) => {
    Object.keys(plan.days).forEach((weekday) => {
      plan.days[weekday].exerciseIds = plan.days[weekday].exerciseIds.filter((id) => id !== exerciseId);
    });
  });

  if (currentWorkout) {
    currentWorkout.exerciseLogs = currentWorkout.exerciseLogs.filter((log) => log.exerciseId !== exerciseId);
  }

  await saveState();
  render();
  openModal("Übung entfernt", `${exercise.name} wurde aus der Bibliothek und aus deinen Plänen entfernt. Alte Trainingslogs bleiben gespeichert.`);
}

function renderAnalysisOptions() {
  const current = elements.analysisExercise.value;
  elements.analysisExercise.innerHTML = state.exercises.map((exercise) =>
    `<option value="${exercise.id}">${exercise.name}</option>`
  ).join("");

  if (current && state.exercises.some((exercise) => exercise.id === current)) {
    elements.analysisExercise.value = current;
  } else {
    elements.analysisExercise.value = state.exercises[0]?.id || "";
  }
}

function calculateExerciseStats(exerciseId) {
  const points = [];

  state.sessions
    .filter((item) => item.exerciseLogs.some((log) => log.exerciseId === exerciseId && log.sets.length))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((item) => {
      const log = item.exerciseLogs.find((entry) => entry.exerciseId === exerciseId);
      const bestSet = [...log.sets].sort((a, b) => b.weight - a.weight || b.reps - a.reps)[0];
      const highestWeight = Math.max(...log.sets.map((set) => set.weight));
    const repsAtHighestWeight = Math.max(...log.sets.filter((set) => set.weight === highestWeight).map((set) => set.reps));
      points.push({
        date: item.date,
        label: formatDate(item.date),
        highestWeight,
        topSetValue: highestWeight * repsAtHighestWeight,
        topSetLabel: `${formatWeight(highestWeight)} x ${repsAtHighestWeight}`,
        bestSet
      });
    });

  const highestWeight = points.length ? Math.max(...points.map((point) => point.highestWeight)) : 0;
  const topSetPoint = points
    .filter((point) => point.highestWeight === highestWeight)
    .sort((a, b) => Number(b.topSetLabel.split(" x ")[1]) - Number(a.topSetLabel.split(" x ")[1]))[0];

  return {
    points,
    highestWeight,
    bestTopSet: topSetPoint?.topSetLabel || "0 kg x 0"
  };
}

function renderAnalysis() {
  const exerciseId = elements.analysisExercise.value || state.exercises[0]?.id;
  if (!exerciseId) {
    elements.bestWeight.textContent = "0 kg";
    elements.bestTopSet.textContent = "0 kg x 0";
    elements.analysisCount.textContent = "0 Einheiten";
    elements.weightChart.innerHTML = `<div class="empty-state">Noch keine Übung für die Analyse vorhanden.</div>`;
    elements.topSetChart.innerHTML = `<div class="empty-state">Noch keine Übung für die Analyse vorhanden.</div>`;
    return;
  }

  const stats = calculateExerciseStats(exerciseId);

  elements.bestWeight.textContent = formatWeight(stats.highestWeight || 0);
  elements.bestTopSet.textContent = stats.bestTopSet;
  elements.analysisCount.textContent = `${stats.points.length} ${stats.points.length === 1 ? "Einheit" : "Einheiten"}`;
  elements.weightChart.innerHTML = lineChart(stats.points.map((point) => point.highestWeight), stats.points.map((point) => formatWeight(point.highestWeight)), "green");
  elements.topSetChart.innerHTML = lineChart(stats.points.map((point) => point.topSetValue), stats.points.map((point) => point.topSetLabel), "blue");
}

function lineChart(values, labels, color) {
  if (!values.length) {
    return `<div class="empty-state">Noch keine Daten für diese Übung.</div>`;
  }

  const lastValues = values.slice(-5);
  const lastLabels = labels.slice(-5);
  const min = Math.min(...lastValues);
  const max = Math.max(...lastValues);
  const range = max - min || 1;
  const width = 340;
  const height = 122;
  const points = lastValues.map((value, index) => {
    const x = lastValues.length === 1 ? width / 2 : 18 + index * ((width - 36) / (lastValues.length - 1));
    const y = height - 18 - ((value - min) / range) * 80;
    return [x, y];
  });

  const pointString = points.map(([x, y]) => `${x},${y}`).join(" ");
  const circles = points.map(([x, y]) => `<circle class="chart-point ${color === "blue" ? "blue" : ""}" cx="${x}" cy="${y}" r="7"></circle>`).join("");
  const labelCells = lastLabels.map((label) => `<span>${label}</span>`).join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Linienchart">
      <polyline class="chart-line ${color === "blue" ? "blue" : ""}" points="${pointString}"></polyline>
      ${circles}
    </svg>
    <div class="chart-labels" style="grid-template-columns: repeat(${lastLabels.length}, 1fr)">${labelCells}</div>
    <div class="chart-caption"><span>Letzte ${lastLabels.length} Einheiten</span><strong>${lastLabels[lastLabels.length - 1]}</strong></div>
  `;
}

function renderSettings(storage = null) {
  elements.storagePersisted.textContent = state.settings.storagePersisted ? "Aktiv" : "Angefragt";

  if (storage?.estimate?.usage) {
    elements.storageUsage.textContent = `${Math.round(storage.estimate.usage / 1024)} KB`;
  } else {
    elements.storageUsage.textContent = "--";
  }
}

async function exportBackup() {
  state.settings.lastBackupAt = new Date().toISOString();
  await saveState();

  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fitplan-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  render();
  openModal("Backup erstellt", "Die JSON-Datei enthält deine lokalen Pläne, Übungen und Trainingslogs.");
}

async function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported.exercises) || !Array.isArray(imported.plans) || !Array.isArray(imported.sessions)) {
      throw new Error("Ungültige Backup-Struktur");
    }

    state = imported;
    await saveState();
    render();
    openModal("Import abgeschlossen", "Der lokale Datenbestand wurde durch das Backup ersetzt.");
  } catch (error) {
    openModal("Import fehlgeschlagen", error.message);
  } finally {
    event.target.value = "";
  }
}

async function resetDemoData() {
  state = defaultState();
  await saveState();
  currentWorkout = null;
  render();
  openModal("Demo zurückgesetzt", "Die lokalen Demo-Daten wurden wiederhergestellt.");
}

function openModal(title, text) {
  elements.modalTitle.textContent = title;
  elements.modalText.textContent = text;
  elements.modal.classList.add("open");
  elements.modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  elements.modal.classList.remove("open");
  elements.modal.setAttribute("aria-hidden", "true");
}

function countSets(item) {
  return item.exerciseLogs.reduce((sum, log) => sum + log.sets.length, 0);
}

function weekdayLabel(key) {
  return WEEKDAYS.find(([value]) => value === key)?.[2] || key;
}

function getWeekNumber(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("sw.js");
  }
}

async function init() {
  initElements();
  wireEvents();
  state = defaultState();
  render();
  const requestedView = window.location.hash.replace("#", "");
  if (viewTitles[requestedView]) {
    showView(requestedView);
  }

  try {
    state = await loadState();
    render();
    if (viewTitles[requestedView]) {
      showView(requestedView);
    }
  } catch (error) {
    openModal("Lokaler Speicher blockiert", `Die App zeigt Demo-Daten. IndexedDB meldet: ${error.message}`);
  }

  try {
    const storage = await requestPersistentStorage();
    renderSettings(storage);
  } catch {
    elements.storagePersisted.textContent = "Nicht verfügbar";
  }

  try {
    await registerServiceWorker();
  } catch {
    elements.offlineStatus.textContent = "Offline-Cache offen";
  }

}

init();
