const STORAGE_KEY = "healthguide.records.v1";

const GROUP_LABELS = {
  pain: "아프다",
  stomach: "속이 안 좋다",
  breath: "숨·기침",
  sleep: "잠",
  energy: "기운·어지럼",
  eyeear: "눈·귀",
  urine: "소변",
  mood: "기분",
  unknown: "잘 모르겠다",
};

const RECORD_ONLY_GROUPS = new Set(["energy", "mood", "unknown"]);

const DETAIL_ANY = "어디든";

/** 그룹별 세부 선택 (최대 4개 + 항상 마지막에 어디든) */
const DETAIL_OPTIONS = {
  pain: ["무릎", "허리", "어깨", "머리"],
  stomach: ["소화", "속쓰림", "변"],
  breath: ["기침", "가래", "숨참"],
  sleep: ["못 잔다", "새벽에 깬다"],
  energy: ["힘없다", "어지럽다", "깜빡한다"],
  eyeear: ["침침하다", "잘 안 들린다"],
  urine: ["자주 마렵다", "시원찮다"],
  mood: ["울적하다", "답답하다"],
  unknown: [],
};

const HOSPITAL_GUIDE = {
  pain: [
    "넘어지신 뒤에 아플 때",
    "다리에 힘이 빠지거나 저릴 때",
    "밤에 아파서 잠을 못 주무실 때",
  ],
  stomach: [
    "변이 검거나 피가 섞일 때",
    "음식을 삼키기 힘들 때",
    "이유 없이 살이 빠질 때",
    "토가 멈추지 않을 때",
  ],
  breath: [
    "3주가 넘도록 기침이 이어질 때",
    "가래에 피가 섞일 때",
    "가만히 있어도 숨이 찰 때",
  ],
  sleep: [
    "코를 심하게 골면서 자다가 숨이 멎는 것 같다는 말을 들으실 때",
  ],
  eyeear: [
    "갑자기 한쪽이 안 보일 때",
    "갑자기 잘 안 들릴 때",
    "눈이 아프고 빨갈 때",
  ],
  urine: [
    "소변에 피가 섞일 때",
    "소변이 나오지 않을 때",
    "열이 나면서 옆구리가 아플 때",
  ],
  energy: [
    "자꾸 어지러워 넘어질 뻔할 때",
    "이유 없이 기운이 없는 날이 이어질 때",
    "자꾸 깜빡하는 일이 늘 때",
  ],
  mood: ["마음이 무거운 날이 2주 넘게 이어질 때"],
};

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const state = {
  group: null,
  detail: null,
  text: "",
  recognition: null,
  listening: false,
  voiceStarting: false,
  voiceMode: "idle",
  voiceClickLock: false,
  voicePointerDownAt: 0,
  editing: false,
  savedId: null,
  orderedLifestyle: [],
  lifestyleExpanded: false,
  lifestyleShowAll: false,
  orderedTeas: [],
  teaExpanded: false,
  recordsTab: "group",
  expandedGroups: new Set(),
  pendingDeleteId: null,
  pendingDeleteCurrent: false,
  currentScreen: "home",
  navDepth: 0,
  ignoringPop: false,
};

const screenHome = document.getElementById("screen-home");
const screenDetail = document.getElementById("screen-detail");
const screenSpeak = document.getElementById("screen-speak");
const screenResult = document.getElementById("screen-result");
const screenRecords = document.getElementById("screen-records");
const screenClinic = document.getElementById("screen-clinic");
const btnTopBack = document.getElementById("btn-top-back");
const btnLogoHome = document.getElementById("btn-logo-home");
const detailTitle = document.getElementById("detail-title");
const detailGrid = document.getElementById("detail-grid");
const speakGroupLabel = document.getElementById("speak-group-label");
const btnVoice = document.getElementById("btn-voice");
const speakText = document.getElementById("speak-text");
const btnSpeakNext = document.getElementById("btn-speak-next");

const energyAlert = document.getElementById("energy-alert");
const resultTextView = document.getElementById("result-text-view");
const resultTextEdit = document.getElementById("result-text-edit");
const btnEdit = document.getElementById("btn-edit");
const btnDeleteCurrent = document.getElementById("btn-delete-current");
const recordOnlyMsg = document.getElementById("record-only-msg");
const moodExtra = document.getElementById("mood-extra");
const lifestyleSection = document.getElementById("lifestyle-section");
const lifestyleList = document.getElementById("lifestyle-list");
const btnMoreLifestyle = document.getElementById("btn-more-lifestyle");
const guideDivider = document.getElementById("guide-divider");
const teaSection = document.getElementById("tea-section");
const teaList = document.getElementById("tea-list");
const btnMoreTea = document.getElementById("btn-more-tea");
const teaDisclaimer = document.getElementById("tea-disclaimer");
const teaMedicineWarning = document.getElementById("tea-medicine-warning");
const teaCaffeine = document.getElementById("tea-caffeine");
const hospitalSection = document.getElementById("hospital-section");
const hospitalList = document.getElementById("hospital-list");

const btnClinic = document.getElementById("btn-clinic");
const tabByGroup = document.getElementById("tab-by-group");
const tabByDate = document.getElementById("tab-by-date");
const recordsEmpty = document.getElementById("records-empty");
const recordsByGroup = document.getElementById("records-by-group");
const recordsByDate = document.getElementById("records-by-date");

const clinicEmpty = document.getElementById("clinic-empty");
const clinicContent = document.getElementById("clinic-content");

function showScreenOnly(name) {
  screenHome.hidden = name !== "home";
  screenDetail.hidden = name !== "detail";
  screenSpeak.hidden = name !== "speak";
  screenResult.hidden = name !== "result";
  screenRecords.hidden = name !== "records";
  screenClinic.hidden = name !== "clinic";
  document.body.classList.toggle("clinic-active", name === "clinic");
  btnTopBack.hidden = name === "home";
  state.currentScreen = name;
  window.scrollTo(0, 0);
}

function navigateTo(name) {
  showScreenOnly(name);
  history.pushState({ screen: name }, "", "");
  state.navDepth += 1;
}

function resetJourneyState() {
  state.group = null;
  state.detail = null;
  state.text = "";
  state.savedId = null;
  state.editing = false;
  state.pendingDeleteCurrent = false;
  state.orderedLifestyle = [];
  state.lifestyleExpanded = false;
  state.lifestyleShowAll = false;
  state.orderedTeas = [];
  state.teaExpanded = false;
  speakText.value = "";
}

function goHome() {
  stopListening();
  const depth = state.navDepth;
  resetJourneyState();
  showScreenOnly("home");
  if (depth > 0) {
    state.ignoringPop = true;
    history.go(-depth);
  } else {
    history.replaceState({ screen: "home" }, "", "");
  }
}

function restoreScreen(screen) {
  stopListening();

  if (screen === "detail") {
    if (!state.group) {
      goHome();
      return;
    }
    renderDetailGrid();
  } else if (screen === "speak") {
    if (!state.group) {
      goHome();
      return;
    }
    if (state.editing) {
      state.text = resultTextEdit.value.trim();
      state.editing = false;
    }
    prepareSpeakChrome();
    speakText.value = state.text || speakText.value;
  } else if (screen === "result") {
    if (!state.group) {
      goHome();
      return;
    }
    if (!state.savedId && state.text.trim()) {
      autoSaveNewRecord();
    }
    renderResultFromState({ preserveOrder: true });
  } else if (screen === "records") {
    renderRecordsScreen();
  } else if (screen === "clinic") {
    renderClinicScreen();
  } else {
    screen = "home";
  }

  showScreenOnly(screen);
}

window.addEventListener("popstate", (event) => {
  if (state.ignoringPop) {
    state.ignoringPop = false;
    state.navDepth = 0;
    history.replaceState({ screen: "home" }, "", "");
    showScreenOnly("home");
    return;
  }

  state.navDepth = Math.max(0, state.navDepth - 1);
  const screen = event.state && event.state.screen ? event.state.screen : "home";
  if (screen === "home") {
    stopListening();
    resetJourneyState();
    showScreenOnly("home");
    return;
  }
  restoreScreen(screen);
});

function speechSupported() {
  return Boolean(SpeechRecognition);
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function parseDateStr(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(dateStr) {
  const d = parseDateStr(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function threeMonthsCutoffStr() {
  const now = new Date();
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth() - 3,
    now.getDate()
  );
  const y = cutoff.getFullYear();
  const m = String(cutoff.getMonth() + 1).padStart(2, "0");
  const day = String(cutoff.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function recordsInLast3Months(records, group) {
  const cutoff = threeMonthsCutoffStr();
  return records.filter(
    (r) => r.group === group && r.date >= cutoff
  );
}

function sortRecordsByDateDesc(records) {
  return records.slice().sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return Number(b.id) - Number(a.id);
  });
}

function sortRecordsByDateAsc(records) {
  return records.slice().sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return Number(a.id) - Number(b.id);
  });
}

function recordDetailLabel(record) {
  if (record.detail) return record.detail;
  return GROUP_LABELS[record.group] || record.group;
}

function recordDetailKey(record) {
  return `${record.group}::${record.detail || ""}`;
}

function createDeleteButton(recordId) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-delete";
  btn.textContent = "지우기";
  btn.addEventListener("click", () => {
    if (state.pendingDeleteId === recordId) {
      deleteRecord(recordId);
      return;
    }
    state.pendingDeleteId = recordId;
    renderRecordsScreen();
  });
  if (state.pendingDeleteId === recordId) {
    btn.classList.add("is-confirm");
    btn.textContent = "정말 지울까요?";
  }
  return btn;
}

function createRecordItem(record) {
  const item = document.createElement("article");
  item.className = "record-item";

  const main = document.createElement("div");
  main.className = "record-item-main";

  const text = document.createElement("p");
  text.className = "record-item-text";
  text.textContent = record.text;
  main.appendChild(text);

  const meta = document.createElement("p");
  meta.className = "record-item-meta";
  meta.textContent = formatDateShort(record.date);
  main.appendChild(meta);

  item.appendChild(main);
  item.appendChild(createDeleteButton(record.id));
  return item;
}

function renderRecordsByGroup(records) {
  recordsByGroup.innerHTML = "";
  const cutoff = threeMonthsCutoffStr();
  const recent = records.filter((r) => r.date >= cutoff);

  const groups = {};
  recent.forEach((r) => {
    const key = recordDetailKey(r);
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const sortedGroups = Object.keys(groups).sort((a, b) => {
    const countDiff = groups[b].length - groups[a].length;
    if (countDiff !== 0) return countDiff;
    const latestA = groups[a].reduce((max, r) => (r.date > max ? r.date : max), "");
    const latestB = groups[b].reduce((max, r) => (r.date > max ? r.date : max), "");
    return latestB.localeCompare(latestA);
  });

  sortedGroups.forEach((key) => {
    const groupRecords = sortRecordsByDateDesc(groups[key]);
    const count = groupRecords.length;
    const label = recordDetailLabel(groupRecords[0]);
    const isOpen = state.expandedGroups.has(key);

    const block = document.createElement("div");
    block.className = "group-block";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "group-toggle" + (isOpen ? " is-open" : "");
    toggle.textContent = `${label} — 최근 3개월 ${count}번`;
    toggle.addEventListener("click", () => {
      if (state.expandedGroups.has(key)) {
        state.expandedGroups.delete(key);
      } else {
        state.expandedGroups.add(key);
      }
      renderRecordsByGroup(records);
    });
    block.appendChild(toggle);

    const items = document.createElement("div");
    items.className = "group-items" + (isOpen ? " is-open" : "");
    groupRecords.forEach((record) => {
      items.appendChild(createRecordItem(record));
    });
    block.appendChild(items);

    recordsByGroup.appendChild(block);
  });
}

function renderRecordsByDate(records) {
  recordsByDate.innerHTML = "";
  const sorted = sortRecordsByDateDesc(records);
  let currentDate = null;
  let dayBlock = null;

  sorted.forEach((record) => {
    if (record.date !== currentDate) {
      currentDate = record.date;
      dayBlock = document.createElement("section");
      dayBlock.className = "date-day-block";

      const heading = document.createElement("h3");
      heading.className = "date-day-heading";
      heading.textContent = formatDateShort(record.date);
      dayBlock.appendChild(heading);
      recordsByDate.appendChild(dayBlock);
    }

    const item = document.createElement("article");
    item.className = "date-record-item";

    const line = document.createElement("p");
    line.className = "date-record-line";

    const groupTag = document.createElement("span");
    groupTag.className = "date-record-group";
    groupTag.textContent = `[${GROUP_LABELS[record.group] || record.group}]`;
    line.appendChild(groupTag);
    line.appendChild(document.createTextNode(` ${record.text}`));
    item.appendChild(line);
    item.appendChild(createDeleteButton(record.id));
    dayBlock.appendChild(item);
  });
}

function setRecordsTab(tab) {
  state.recordsTab = tab;
  state.pendingDeleteId = null;

  const isGroup = tab === "group";
  tabByGroup.classList.toggle("is-active", isGroup);
  tabByDate.classList.toggle("is-active", !isGroup);
  tabByGroup.setAttribute("aria-selected", String(isGroup));
  tabByDate.setAttribute("aria-selected", String(!isGroup));
  renderRecordsScreen();
}

function renderRecordsScreen() {
  const records = loadRecords();
  const hasRecords = records.length > 0;

  recordsEmpty.hidden = hasRecords;
  tabByGroup.hidden = !hasRecords;
  tabByDate.hidden = !hasRecords;
  recordsByGroup.hidden = !hasRecords || state.recordsTab !== "group";
  recordsByDate.hidden = !hasRecords || state.recordsTab !== "date";

  if (!hasRecords) {
    recordsByGroup.innerHTML = "";
    recordsByDate.innerHTML = "";
    return;
  }

  renderRecordsByGroup(records);
  renderRecordsByDate(records);
}

function deleteRecord(id) {
  const records = loadRecords().filter((r) => r.id !== id);
  saveRecords(records);
  state.pendingDeleteId = null;
  renderRecordsScreen();
}

function openRecords() {
  stopListening();
  state.pendingDeleteId = null;
  setRecordsTab(state.recordsTab);
  navigateTo("records");
}

function openClinic() {
  renderClinicScreen();
  navigateTo("clinic");
}

function renderClinicScreen() {
  const cutoff = threeMonthsCutoffStr();
  const recent = loadRecords().filter((r) => r.date >= cutoff);

  clinicContent.innerHTML = "";
  clinicEmpty.hidden = recent.length > 0;

  if (recent.length === 0) return;

  const groups = {};
  recent.forEach((r) => {
    const key = recordDetailKey(r);
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });

  const sortedGroups = Object.keys(groups).sort((a, b) => {
    const firstA = sortRecordsByDateAsc(groups[a])[0].date;
    const firstB = sortRecordsByDateAsc(groups[b])[0].date;
    return firstA.localeCompare(firstB);
  });

  sortedGroups.forEach((key) => {
    const groupRecords = sortRecordsByDateAsc(groups[key]);
    const firstDate = formatDateShort(groupRecords[0].date);
    const count = groupRecords.length;
    const label = recordDetailLabel(groupRecords[0]);

    const section = document.createElement("section");
    section.className = "clinic-group";

    const heading = document.createElement("h2");
    heading.className = "clinic-group-title";
    heading.textContent = `${label} — 최근 3개월 ${count}번`;
    section.appendChild(heading);

    const summary = document.createElement("p");
    summary.className = "clinic-group-summary";
    summary.textContent = `처음 말씀하신 날: ${firstDate}`;
    section.appendChild(summary);

    const list = document.createElement("ul");
    list.className = "clinic-record-list";
    groupRecords.forEach((record) => {
      const li = document.createElement("li");
      li.textContent = `${formatDateShort(record.date)} — ${record.text}`;
      list.appendChild(li);
    });
    section.appendChild(list);

    clinicContent.appendChild(section);
  });
}

function shuffle(list) {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/** tags 일치 항목을 앞으로, tags 빈 항목은 맨 뒤로. 어디든이면 정렬 없음. */
function orderItemsByDetail(items, detail) {
  const list = items.slice();
  if (!detail || detail === DETAIL_ANY) {
    return { ordered: list, showAll: true };
  }

  const matched = [];
  const unmatched = [];
  const emptyTags = [];

  list.forEach((item) => {
    const tags = Array.isArray(item.tags) ? item.tags : [];
    if (tags.length === 0) {
      emptyTags.push(item);
    } else if (tags.includes(detail)) {
      matched.push(item);
    } else {
      unmatched.push(item);
    }
  });

  return {
    ordered: matched.concat(unmatched, emptyTags),
    showAll: false,
  };
}

function renderDetailGrid() {
  detailTitle.textContent = GROUP_LABELS[state.group] || state.group;
  detailGrid.innerHTML = "";

  const options = (DETAIL_OPTIONS[state.group] || []).slice(0, 4);
  options.concat([DETAIL_ANY]).forEach((label) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "detail-btn";
    btn.textContent = label;
    btn.addEventListener("click", () => {
      state.detail = label;
      state.text = "";
      state.savedId = null;
      state.editing = false;
      speakText.value = "";
      prepareSpeakChrome();
      navigateTo("speak");
    });
    detailGrid.appendChild(btn);
  });
}

function startGroupFlow(group) {
  stopListening();
  state.group = group;
  state.detail = null;
  state.text = "";
  state.savedId = null;
  state.editing = false;
  speakText.value = "";
  renderDetailGrid();
  navigateTo("detail");
}

const VOICE_LABELS = {
  idle: "한번만 눌러서<br />말씀하세요",
  listening: "말씀하세요.<br />듣고 있습니다",
  done: "수정하시려면<br />다시 눌러주세요",
};

function updateVoiceButton(mode) {
  state.voiceMode = mode;
  btnVoice.dataset.voiceState = mode;
  btnVoice.classList.toggle("is-listening", mode === "listening");
  btnVoice.setAttribute("aria-pressed", mode === "listening" ? "true" : "false");

  const label = btnVoice.querySelector(".voice-btn-label");
  if (label) {
    label.innerHTML = VOICE_LABELS[mode] || VOICE_LABELS.idle;
  }
}

function stopListening() {
  if (!state.recognition || (!state.listening && !state.voiceStarting)) return;
  try {
    state.recognition.stop();
  } catch (_) {
    /* already stopped */
  }
}

function startListening() {
  if (!state.recognition || state.listening || state.voiceStarting) return;

  state.voiceStarting = true;
  try {
    state.recognition.start();
  } catch (_) {
    state.voiceStarting = false;
    updateVoiceButton(state.voiceMode === "done" ? "done" : "idle");
    speakText.focus();
  }
}

function setupRecognition() {
  if (!speechSupported()) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    state.listening = true;
    state.voiceStarting = false;
    updateVoiceButton("listening");
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    speakText.value = transcript.trim();
  };

  recognition.onerror = () => {
    state.listening = false;
    state.voiceStarting = false;
    updateVoiceButton("done");
    speakText.focus();
  };

  recognition.onend = () => {
    state.listening = false;
    state.voiceStarting = false;
    updateVoiceButton("done");
  };

  return recognition;
}

function prepareSpeakChrome() {
  speakGroupLabel.textContent = GROUP_LABELS[state.group] || state.group;

  const supported = speechSupported();
  btnVoice.hidden = !supported;
  btnSpeakNext.className = supported ? "secondary-btn" : "full-btn";

  if (supported) {
    if (!state.recognition) {
      state.recognition = setupRecognition();
    }
    if (!state.listening) {
      updateVoiceButton(state.voiceMode === "done" && speakText.value ? "done" : "idle");
    }
  }
}

function getResultText() {
  if (state.editing) {
    return resultTextEdit.value.trim();
  }
  return state.text.trim();
}

function showQuotedText(text) {
  resultTextView.textContent = `"${text}"`;
}

function updateDeleteCurrentButton() {
  if (state.pendingDeleteCurrent) {
    btnDeleteCurrent.classList.add("is-confirm");
    btnDeleteCurrent.textContent = "정말 지울까요?";
  } else {
    btnDeleteCurrent.classList.remove("is-confirm");
    btnDeleteCurrent.textContent = "지우기";
  }
}

function setEditing(on) {
  state.editing = on;
  state.pendingDeleteCurrent = false;
  updateDeleteCurrentButton();

  if (on) {
    resultTextEdit.value = state.text;
    resultTextView.hidden = true;
    resultTextEdit.hidden = false;
    btnEdit.textContent = "다 고쳤어요";
    btnDeleteCurrent.hidden = true;
    resultTextEdit.focus();
    return;
  }

  const text = resultTextEdit.value.trim();
  if (!text) {
    resultTextEdit.focus();
    state.editing = true;
    return;
  }

  state.text = text;
  showQuotedText(state.text);
  resultTextView.hidden = false;
  resultTextEdit.hidden = true;
  btnEdit.textContent = "고치기";
  btnDeleteCurrent.hidden = false;
  speakText.value = state.text;
  updateSavedRecordText();
}

function autoSaveNewRecord() {
  const text = state.text.trim();
  if (!text || !state.group) return;

  const records = loadRecords();
  const record = {
    id: String(Date.now()),
    group: state.group,
    detail: state.detail || DETAIL_ANY,
    text,
    date: todayStr(),
  };
  records.push(record);
  saveRecords(records);
  state.savedId = record.id;
  updateMoodExtra();
}

function updateSavedRecordText() {
  const text = state.text.trim();
  if (!text || !state.savedId) return;

  const records = loadRecords();
  const idx = records.findIndex((r) => r.id === state.savedId);
  if (idx < 0) {
    autoSaveNewRecord();
    return;
  }

  records[idx].text = text;
  records[idx].date = todayStr();
  if (state.detail) {
    records[idx].detail = state.detail;
  }
  saveRecords(records);
  updateMoodExtra();
}

function deleteCurrentSavedRecord() {
  if (!state.savedId) return;

  if (!state.pendingDeleteCurrent) {
    state.pendingDeleteCurrent = true;
    updateDeleteCurrentButton();
    return;
  }

  const id = state.savedId;
  const records = loadRecords().filter((r) => r.id !== id);
  saveRecords(records);
  state.savedId = null;
  state.pendingDeleteCurrent = false;
  updateDeleteCurrentButton();
  updateMoodExtra();
  history.back();
}

function renderLifestyleCards() {
  lifestyleList.innerHTML = "";
  const items = state.orderedLifestyle;
  const showAll = state.lifestyleShowAll || state.lifestyleExpanded;
  const visible = showAll ? items : items.slice(0, 2);

  visible.forEach((item) => {
    const card = document.createElement("article");
    card.className = "life-card";
    card.innerHTML =
      `<h3 class="card-title"></h3>` +
      `<p class="card-body"></p>` +
      `<p class="card-source"></p>`;
    card.querySelector(".card-title").textContent = item.title || "";
    card.querySelector(".card-body").textContent = item.body || "";
    card.querySelector(".card-source").textContent = item.source
      ? `출처: ${item.source}`
      : "";
    lifestyleList.appendChild(card);
  });

  btnMoreLifestyle.hidden = showAll || items.length <= 2;
}

function renderLifestyle(group, options = {}) {
  const resort = options.resort !== false;
  const items = (LIFESTYLE_DATA[group] || []).slice();
  lifestyleList.innerHTML = "";

  if (items.length === 0) {
    lifestyleSection.hidden = true;
    btnMoreLifestyle.hidden = true;
    state.orderedLifestyle = [];
    return false;
  }

  if (resort || state.orderedLifestyle.length === 0) {
    const ordered = orderItemsByDetail(items, state.detail);
    state.orderedLifestyle = ordered.ordered;
    state.lifestyleShowAll = ordered.showAll;
    state.lifestyleExpanded = false;
  }
  renderLifestyleCards();

  lifestyleSection.hidden = false;
  return true;
}

function renderTeaCards() {
  teaList.innerHTML = "";
  const teas = state.orderedTeas;
  const visible = state.teaExpanded ? teas : teas.slice(0, 3);

  visible.forEach((tea) => {
    const card = document.createElement("article");
    card.className = "tea-card";

    const title = document.createElement("h3");
    title.className = "card-title";
    title.textContent = tea.name;
    card.appendChild(title);

    const note = document.createElement("p");
    note.className = "card-body";
    note.textContent = tea.note;
    card.appendChild(note);

    if (tea.caution) {
      const caution = document.createElement("p");
      caution.className = "tea-caution";
      caution.textContent = tea.caution;
      card.appendChild(caution);
    }

    teaList.appendChild(card);
  });

  btnMoreTea.hidden = state.teaExpanded || teas.length <= 3;
}

function renderTea(group, options = {}) {
  const reshuffle = options.reshuffle !== false;
  const teas = TEA_DATA[group] || [];
  teaList.innerHTML = "";

  if (teas.length === 0) {
    teaSection.hidden = true;
    state.orderedTeas = [];
    return false;
  }

  if (reshuffle || state.orderedTeas.length === 0) {
    const ordered = orderItemsByDetail(teas, state.detail);
    state.orderedTeas = ordered.showAll ? shuffle(ordered.ordered) : ordered.ordered;
    state.teaExpanded = false;
  }
  renderTeaCards();

  teaDisclaimer.textContent = TEA_DISCLAIMER;
  teaMedicineWarning.textContent = TEA_MEDICINE_WARNING;

  const showCaffeine = group === "sleep" || group === "urine";
  teaCaffeine.hidden = !showCaffeine;
  if (showCaffeine) {
    teaCaffeine.textContent = TEA_CAFFEINE_NOTE;
  }

  teaSection.hidden = false;
  return true;
}

function renderHospital(group) {
  const items = HOSPITAL_GUIDE[group];
  hospitalList.innerHTML = "";

  if (!items || items.length === 0) {
    hospitalSection.hidden = true;
    return;
  }

  items.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    hospitalList.appendChild(li);
  });

  hospitalSection.hidden = false;
}

function countMoodInLast14Days() {
  const records = loadRecords();
  const now = new Date();
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 13
  );
  const cutoffStr = [
    cutoff.getFullYear(),
    String(cutoff.getMonth() + 1).padStart(2, "0"),
    String(cutoff.getDate()).padStart(2, "0"),
  ].join("-");

  return records.filter(
    (r) => r.group === "mood" && r.date >= cutoffStr
  ).length;
}

function updateMoodExtra() {
  if (state.group !== "mood") {
    moodExtra.hidden = true;
    return;
  }
  moodExtra.hidden = countMoodInLast14Days() < 3;
}

function renderResultFromState(options = {}) {
  const preserveOrder = Boolean(options.preserveOrder);
  const text = state.text || "";

  showQuotedText(text);
  resultTextView.hidden = false;
  resultTextEdit.hidden = true;
  resultTextEdit.value = text;
  btnEdit.textContent = "고치기";
  btnDeleteCurrent.hidden = false;
  state.editing = false;
  state.pendingDeleteCurrent = false;
  updateDeleteCurrentButton();

  energyAlert.hidden = state.group !== "energy";

  const recordOnly = RECORD_ONLY_GROUPS.has(state.group);
  recordOnlyMsg.hidden = !recordOnly;

  if (recordOnly) {
    lifestyleSection.hidden = true;
    guideDivider.hidden = true;
    teaSection.hidden = true;
  } else {
    const hasLife = renderLifestyle(state.group, { resort: !preserveOrder });
    const hasTea = renderTea(state.group, { reshuffle: !preserveOrder });
    guideDivider.hidden = !(hasLife && hasTea);
  }

  updateMoodExtra();
  renderHospital(state.group);
}

function openResult() {
  const text = speakText.value.trim();
  if (!text) {
    speakText.focus();
    return;
  }

  stopListening();
  state.text = text;
  state.savedId = null;
  state.pendingDeleteCurrent = false;
  autoSaveNewRecord();
  renderResultFromState();
  navigateTo("result");
}

document.querySelectorAll("[data-group]").forEach((btn) => {
  btn.addEventListener("click", () => {
    startGroupFlow(btn.dataset.group);
  });
});

btnTopBack.addEventListener("click", () => {
  if (state.currentScreen === "home") return;
  history.back();
});

btnLogoHome.addEventListener("click", goHome);

btnVoice.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

btnVoice.addEventListener("pointerdown", () => {
  state.voicePointerDownAt = Date.now();
});

btnVoice.addEventListener("click", () => {
  if (!state.recognition) return;
  if (state.voiceClickLock || state.voiceStarting) return;

  const heldMs = Date.now() - (state.voicePointerDownAt || 0);
  // 녹음 중 길게 누르다 떼도 취소되지 않게 한다 (짧게 탭할 때만 중지)
  if (state.listening && heldMs > 500) {
    return;
  }

  state.voiceClickLock = true;
  window.setTimeout(() => {
    state.voiceClickLock = false;
  }, 500);

  if (state.listening) {
    stopListening();
    return;
  }

  startListening();
});

btnSpeakNext.addEventListener("click", openResult);

btnEdit.addEventListener("click", () => {
  if (state.editing) {
    setEditing(false);
  } else {
    setEditing(true);
  }
});

btnDeleteCurrent.addEventListener("click", deleteCurrentSavedRecord);

btnMoreLifestyle.addEventListener("click", () => {
  state.lifestyleExpanded = true;
  renderLifestyleCards();
});

btnMoreTea.addEventListener("click", () => {
  state.teaExpanded = true;
  renderTeaCards();
});

document.getElementById("btn-records").addEventListener("click", openRecords);

tabByGroup.addEventListener("click", () => setRecordsTab("group"));
tabByDate.addEventListener("click", () => setRecordsTab("date"));

btnClinic.addEventListener("click", openClinic);

history.replaceState({ screen: "home" }, "", "");
state.navDepth = 0;
showScreenOnly("home");
