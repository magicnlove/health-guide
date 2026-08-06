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
  text: "",
  recognition: null,
  listening: false,
  editing: false,
  savedId: null,
  shuffledTeas: [],
  teaExpanded: false,
  recordsTab: "group",
  expandedGroups: new Set(),
  pendingDeleteId: null,
};

const screenHome = document.getElementById("screen-home");
const screenSpeak = document.getElementById("screen-speak");
const screenResult = document.getElementById("screen-result");
const screenRecords = document.getElementById("screen-records");
const screenClinic = document.getElementById("screen-clinic");
const speakGroupLabel = document.getElementById("speak-group-label");
const btnVoice = document.getElementById("btn-voice");
const speakText = document.getElementById("speak-text");
const btnSpeakNext = document.getElementById("btn-speak-next");
const btnSpeakBack = document.getElementById("btn-speak-back");

const energyAlert = document.getElementById("energy-alert");
const resultTextView = document.getElementById("result-text-view");
const resultTextEdit = document.getElementById("result-text-edit");
const btnEdit = document.getElementById("btn-edit");
const btnSave = document.getElementById("btn-save");
const recordOnlyMsg = document.getElementById("record-only-msg");
const moodExtra = document.getElementById("mood-extra");
const lifestyleSection = document.getElementById("lifestyle-section");
const lifestyleList = document.getElementById("lifestyle-list");
const guideDivider = document.getElementById("guide-divider");
const teaSection = document.getElementById("tea-section");
const teaList = document.getElementById("tea-list");
const btnMoreTea = document.getElementById("btn-more-tea");
const teaDisclaimer = document.getElementById("tea-disclaimer");
const teaMedicineWarning = document.getElementById("tea-medicine-warning");
const teaCaffeine = document.getElementById("tea-caffeine");
const hospitalSection = document.getElementById("hospital-section");
const hospitalList = document.getElementById("hospital-list");
const btnResultHome = document.getElementById("btn-result-home");

const btnClinic = document.getElementById("btn-clinic");
const tabByGroup = document.getElementById("tab-by-group");
const tabByDate = document.getElementById("tab-by-date");
const recordsEmpty = document.getElementById("records-empty");
const recordsByGroup = document.getElementById("records-by-group");
const recordsByDate = document.getElementById("records-by-date");
const btnRecordsBack = document.getElementById("btn-records-back");

const clinicEmpty = document.getElementById("clinic-empty");
const clinicContent = document.getElementById("clinic-content");
const btnClinicBack = document.getElementById("btn-clinic-back");

function showScreen(name) {
  screenHome.hidden = name !== "home";
  screenSpeak.hidden = name !== "speak";
  screenResult.hidden = name !== "result";
  screenRecords.hidden = name !== "records";
  screenClinic.hidden = name !== "clinic";
  document.body.classList.toggle("clinic-active", name === "clinic");
  window.scrollTo(0, 0);
}

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

function createRecordItem(record, showDateInTitle) {
  const item = document.createElement("article");
  item.className = "record-item";

  if (showDateInTitle) {
    const title = document.createElement("p");
    title.className = "record-item-date";
    title.textContent = `${formatDateShort(record.date)} — ${record.text}`;
    item.appendChild(title);
  } else {
    const meta = document.createElement("p");
    meta.className = "record-item-meta";
    meta.textContent = formatDateShort(record.date);
    item.appendChild(meta);

    const text = document.createElement("p");
    text.className = "record-item-text";
    text.textContent = record.text;
    item.appendChild(text);
  }

  item.appendChild(createDeleteButton(record.id));
  return item;
}

function renderRecordsByGroup(records) {
  recordsByGroup.innerHTML = "";
  const cutoff = threeMonthsCutoffStr();
  const recent = records.filter((r) => r.date >= cutoff);

  const groups = {};
  recent.forEach((r) => {
    if (!groups[r.group]) groups[r.group] = [];
    groups[r.group].push(r);
  });

  const sortedGroups = Object.keys(groups).sort((a, b) => {
    const latestA = groups[a].reduce((max, r) => (r.date > max ? r.date : max), "");
    const latestB = groups[b].reduce((max, r) => (r.date > max ? r.date : max), "");
    return latestB.localeCompare(latestA);
  });

  sortedGroups.forEach((group) => {
    const groupRecords = sortRecordsByDateDesc(groups[group]);
    const count = groupRecords.length;
    const label = GROUP_LABELS[group] || group;
    const isOpen = state.expandedGroups.has(group);

    const block = document.createElement("div");
    block.className = "group-block";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "group-toggle" + (isOpen ? " is-open" : "");
    toggle.textContent = `${label} — 최근 3개월 ${count}번`;
    toggle.addEventListener("click", () => {
      if (state.expandedGroups.has(group)) {
        state.expandedGroups.delete(group);
      } else {
        state.expandedGroups.add(group);
      }
      renderRecordsByGroup(records);
    });
    block.appendChild(toggle);

    const items = document.createElement("div");
    items.className = "group-items" + (isOpen ? " is-open" : "");
    groupRecords.forEach((record) => {
      items.appendChild(createRecordItem(record, false));
    });
    block.appendChild(items);

    recordsByGroup.appendChild(block);
  });
}

function renderRecordsByDate(records) {
  recordsByDate.innerHTML = "";
  sortRecordsByDateDesc(records).forEach((record) => {
    recordsByDate.appendChild(createRecordItem(record, true));
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
  showScreen("records");
}

function renderClinicScreen() {
  const cutoff = threeMonthsCutoffStr();
  const recent = loadRecords().filter((r) => r.date >= cutoff);

  clinicContent.innerHTML = "";
  clinicEmpty.hidden = recent.length > 0;

  if (recent.length === 0) return;

  const groups = {};
  recent.forEach((r) => {
    if (!groups[r.group]) groups[r.group] = [];
    groups[r.group].push(r);
  });

  const sortedGroups = Object.keys(groups).sort((a, b) => {
    const firstA = sortRecordsByDateAsc(groups[a])[0].date;
    const firstB = sortRecordsByDateAsc(groups[b])[0].date;
    return firstA.localeCompare(firstB);
  });

  sortedGroups.forEach((group) => {
    const groupRecords = sortRecordsByDateAsc(groups[group]);
    const firstDate = formatDateShort(groupRecords[0].date);
    const count = groupRecords.length;
    const label = GROUP_LABELS[group] || group;

    const section = document.createElement("section");
    section.className = "clinic-group";

    const heading = document.createElement("h2");
    heading.className = "clinic-group-title";
    heading.textContent = label;
    section.appendChild(heading);

    const summary = document.createElement("p");
    summary.className = "clinic-group-summary";
    summary.textContent = `처음 말씀하신 날: ${firstDate} / ${count}번`;
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

function openClinic() {
  renderClinicScreen();
  showScreen("clinic");
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

function stopListening() {
  if (!state.recognition || !state.listening) return;
  try {
    state.recognition.stop();
  } catch (_) {
    /* already stopped */
  }
  state.listening = false;
  btnVoice.classList.remove("is-listening");
  btnVoice.setAttribute("aria-pressed", "false");
  btnVoice.innerHTML = "누르고<br />말씀하세요";
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
    btnVoice.classList.add("is-listening");
    btnVoice.setAttribute("aria-pressed", "true");
    btnVoice.innerHTML = "듣고 있어요<br />끝나면 누르세요";
  };

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = 0; i < event.results.length; i += 1) {
      transcript += event.results[i][0].transcript;
    }
    speakText.value = transcript.trim();
  };

  recognition.onerror = () => {
    stopListening();
    speakText.focus();
  };

  recognition.onend = () => {
    state.listening = false;
    btnVoice.classList.remove("is-listening");
    btnVoice.setAttribute("aria-pressed", "false");
    btnVoice.innerHTML = "누르고<br />말씀하세요";
  };

  return recognition;
}

function openSpeak(group) {
  state.group = group;
  state.text = "";
  state.savedId = null;
  state.editing = false;
  speakGroupLabel.textContent = GROUP_LABELS[group] || group;
  speakText.value = "";

  const supported = speechSupported();
  btnVoice.hidden = !supported;
  btnSpeakNext.className = supported ? "secondary-btn" : "full-btn";

  if (supported) {
    if (!state.recognition) {
      state.recognition = setupRecognition();
    }
  } else {
    speakText.focus();
  }

  showScreen("speak");
}

function goHome() {
  stopListening();
  state.group = null;
  state.text = "";
  state.savedId = null;
  state.editing = false;
  state.shuffledTeas = [];
  state.teaExpanded = false;
  speakText.value = "";
  showScreen("home");
}

function getResultText() {
  if (state.editing) {
    return resultTextEdit.value.trim();
  }
  return state.text.trim();
}

function setSaveButtonSaved(saved) {
  if (saved) {
    btnSave.textContent = "적어두었습니다";
    btnSave.disabled = true;
  } else {
    btnSave.textContent = "이대로 적어두기";
    btnSave.disabled = false;
  }
}

function setEditing(on) {
  state.editing = on;
  if (on) {
    resultTextEdit.value = state.text;
    resultTextView.hidden = true;
    resultTextEdit.hidden = false;
    btnEdit.textContent = "다 고쳤어요";
    resultTextEdit.focus();
  } else {
    state.text = resultTextEdit.value.trim();
    resultTextView.textContent = state.text;
    resultTextView.hidden = false;
    resultTextEdit.hidden = true;
    btnEdit.textContent = "고치기";
    if (state.savedId) {
      setSaveButtonSaved(false);
    }
  }
}

function renderLifestyle(group) {
  const items = (LIFESTYLE_DATA[group] || []).slice();
  lifestyleList.innerHTML = "";

  if (items.length === 0) {
    lifestyleSection.hidden = true;
    return false;
  }

  items.forEach((item) => {
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

  lifestyleSection.hidden = false;
  return true;
}

function renderTeaCards() {
  teaList.innerHTML = "";
  const teas = state.shuffledTeas;
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

function renderTea(group) {
  const teas = TEA_DATA[group] || [];
  teaList.innerHTML = "";

  if (teas.length === 0) {
    teaSection.hidden = true;
    return false;
  }

  state.shuffledTeas = shuffle(teas);
  state.teaExpanded = false;
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

function openResult() {
  const text = speakText.value.trim();
  if (!text) {
    speakText.focus();
    return;
  }

  stopListening();
  state.text = text;
  state.savedId = null;
  state.editing = false;

  resultTextView.textContent = text;
  resultTextView.hidden = false;
  resultTextEdit.hidden = true;
  resultTextEdit.value = text;
  btnEdit.textContent = "고치기";
  setSaveButtonSaved(false);

  energyAlert.hidden = state.group !== "energy";

  const recordOnly = RECORD_ONLY_GROUPS.has(state.group);
  recordOnlyMsg.hidden = !recordOnly;

  if (recordOnly) {
    lifestyleSection.hidden = true;
    guideDivider.hidden = true;
    teaSection.hidden = true;
  } else {
    const hasLife = renderLifestyle(state.group);
    const hasTea = renderTea(state.group);
    guideDivider.hidden = !(hasLife && hasTea);
  }

  updateMoodExtra();
  renderHospital(state.group);
  showScreen("result");
}

function saveCurrentRecord() {
  const text = getResultText();
  if (!text || !state.group) return;

  if (state.editing) {
    setEditing(false);
  }

  const records = loadRecords();

  if (state.savedId) {
    const idx = records.findIndex((r) => r.id === state.savedId);
    if (idx >= 0) {
      records[idx].text = text;
      records[idx].date = todayStr();
      saveRecords(records);
      setSaveButtonSaved(true);
      updateMoodExtra();
      return;
    }
  }

  const record = {
    id: String(Date.now()),
    group: state.group,
    text,
    date: todayStr(),
  };
  records.push(record);
  saveRecords(records);
  state.savedId = record.id;
  setSaveButtonSaved(true);
  updateMoodExtra();
}

document.querySelectorAll("[data-group]").forEach((btn) => {
  btn.addEventListener("click", () => {
    openSpeak(btn.dataset.group);
  });
});

btnVoice.addEventListener("click", () => {
  if (!state.recognition) return;

  if (state.listening) {
    stopListening();
    return;
  }

  try {
    state.recognition.start();
  } catch (_) {
    stopListening();
    speakText.focus();
  }
});

btnSpeakNext.addEventListener("click", openResult);
btnSpeakBack.addEventListener("click", goHome);

btnEdit.addEventListener("click", () => {
  if (state.editing) {
    setEditing(false);
  } else {
    setEditing(true);
  }
});

btnSave.addEventListener("click", saveCurrentRecord);

btnMoreTea.addEventListener("click", () => {
  state.teaExpanded = true;
  renderTeaCards();
});

btnResultHome.addEventListener("click", goHome);

document.getElementById("btn-records").addEventListener("click", openRecords);
btnRecordsBack.addEventListener("click", goHome);

tabByGroup.addEventListener("click", () => setRecordsTab("group"));
tabByDate.addEventListener("click", () => setRecordsTab("date"));

btnClinic.addEventListener("click", openClinic);
btnClinicBack.addEventListener("click", () => showScreen("records"));

showScreen("home");
