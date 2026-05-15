import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyACitjGNZKiolYr4pJgO6OBjLrYDi7ZVak",
  authDomain: "project-3474244849912746648.firebaseapp.com",
  databaseURL: "https://project-3474244849912746648-default-rtdb.firebaseio.com",
  projectId: "project-3474244849912746648",
  storageBucket: "project-3474244849912746648.firebasestorage.app",
  messagingSenderId: "474883506244",
  appId: "1:474883506244:web:fd5172c9d716704a177c11",
  measurementId: "G-J24STPM2MN"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- DEFAULT DATA ---
const DEFAULT_DATA = {
  racha: 4,
  labNotes: "",
  missions: {
    m1: { title: "Dominar Cónicas", difficulty: "Alta", duration: "2h", impact: "Alto", done: false },
    m2: { title: "40 Ejercicios Prácticos", difficulty: "Media", duration: "1.5h", impact: "Medio", done: false },
    m3: { title: "Simulacro Final", difficulty: "Extrema", duration: "3h", impact: "Crítico", done: false }
  },
  miniVictories: {
    v1: { text: "Levantarme temprano", done: false },
    v2: { text: "Entrenar", done: false },
    v3: { text: "Leer 10 págs", done: false },
    v4: { text: "Comer bien", done: false },
    v5: { text: "No perder tiempo", done: false }
  },
  lifeAreas: {
    a1: { name: "Facultad", value: 60 },
    a2: { name: "Cuerpo", value: 85 },
    a3: { name: "Mente", value: 40 },
    a4: { name: "Disciplina", value: 70 },
    a5: { name: "Proyectos", value: 90 }
  },
  identity: [
    { text: "Disciplinado", active: false },
    { text: "Estratégico", active: false },
    { text: "Fuerte Mentalmente", active: false },
    { text: "Peligroso para la mediocridad", active: true }
  ],
  resurrection: [30, 45, 40, 60, 55, 80, 95]
};

// --- DOM ELEMENTS ---
const loadingScreen = document.getElementById('loading');
const dashboard = document.getElementById('dashboard');
const rachaCounter = document.getElementById('racha-counter');
const missionsList = document.getElementById('missions-list');
const miniVictoriesList = document.getElementById('mini-victories-list');
const lifeAreasList = document.getElementById('life-areas-list');
const identityList = document.getElementById('identity-list');
const resurrectionTracker = document.getElementById('resurrection-tracker');
const labSection = document.getElementById('lab-section');
const btnToggleLab = document.getElementById('btn-toggle-lab');
const labTextarea = document.getElementById('lab-textarea');
const btnSaveLab = document.getElementById('btn-save-lab');
const btnModeText = document.getElementById('btn-mode-text');
const btnModeDraw = document.getElementById('btn-mode-draw');
const labTextContainer = document.getElementById('lab-text-container');
const labDrawContainer = document.getElementById('lab-draw-container');
const labCanvas = document.getElementById('lab-canvas');
const btnClearCanvas = document.getElementById('btn-clear-canvas');
const btnSaveDraw = document.getElementById('btn-save-draw');
const ctx = labCanvas.getContext('2d');

// War Mode
const warMode = document.getElementById('war-mode');
const btnEnterWar = document.getElementById('btn-enter-war');
const btnExitWar = document.getElementById('btn-exit-war');
const warTimer = document.getElementById('war-timer');
const warObjectives = document.getElementById('war-objectives');
const btnStartWar = document.getElementById('btn-start-war');

// --- INIT ---
lucide.createIcons();
const userRef = ref(db, 'users/juan');

// Realtime Listener
onValue(userRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    renderDashboard(data);
  } else {
    // Inicializar si está vacío
    set(userRef, DEFAULT_DATA);
  }
});

// --- RENDER FUNCTIONS ---
function renderDashboard(data) {
  loadingScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');

  rachaCounter.innerText = data.racha || 0;
  labTextarea.value = data.labNotes || "";

  renderIdentity(data.identity || DEFAULT_DATA.identity);
  renderLifeAreas(data.lifeAreas || {});
  renderResurrection(data.resurrection || DEFAULT_DATA.resurrection);
  renderMissions(data.missions || {});
  renderMiniVictories(data.miniVictories || {});
  renderWarObjectives(data.warObjectives || [
    { id: 'w1', text: "Bañarse", done: false },
    { id: 'w2', text: "Estudiar 25 minutos", done: false },
    { id: 'w3', text: "Salir de la cama mentalmente", done: false }
  ]);
  
  // Refresh icons
  lucide.createIcons();
}

function renderIdentity(identityArr) {
  identityList.innerHTML = identityArr.map(item => `
    <div class="flex items-center gap-2 p-2 rounded ${item.active ? 'bg-elevated' : ''}" style="background-color: ${item.active ? 'var(--bg-elevated)' : 'transparent'}">
      <div class="w-2 h-2 rounded-full" style="background-color: ${item.active ? 'var(--text-primary)' : 'var(--border-color)'}; width: 8px; height: 8px;"></div>
      <span class="${item.active ? 'text-white font-bold' : 'text-muted'}">${item.text}</span>
    </div>
  `).join('');
}

function renderLifeAreas(areasObj) {
  lifeAreasList.innerHTML = Object.entries(areasObj).map(([id, area]) => `
    <div>
      <div class="flex justify-between text-small mb-1">
        <span>${area.name}</span>
        <span class="text-muted">${area.value}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: ${area.value}%; background-color: ${area.value < 50 ? 'var(--text-muted)' : 'var(--text-primary)'}"></div>
      </div>
    </div>
  `).join('');
}

function renderResurrection(arr) {
  resurrectionTracker.innerHTML = arr.map(val => `
    <div class="flex-col justify-end h-full flex-1 gap-1 flex" style="height: 100%">
      <div class="w-full rounded-t-sm" style="height: ${val}%; background-color: ${val > 70 ? 'var(--text-primary)' : 'var(--text-muted)'}"></div>
    </div>
  `).join('');
}

function renderMissions(missionsObj) {
  missionsList.innerHTML = Object.entries(missionsObj).map(([id, mission]) => `
    <div class="mission-item cursor-pointer" onclick="window.toggleMission('${id}', ${mission.done})">
      <div class="mission-checkbox ${mission.done ? 'checked' : ''}">
        ${mission.done ? '<i data-lucide="check" style="width:14px"></i>' : ''}
      </div>
      <div class="mission-content">
        <div class="mission-title ${mission.done ? 'text-muted line-through' : ''}">Misión: ${mission.title}</div>
        <div class="mission-meta">
          <span class="meta-tag"><i data-lucide="zap" style="width:10px"></i> ${mission.difficulty}</span>
          <span class="meta-tag">⏱ ${mission.duration}</span>
          <span class="meta-tag">💥 Impacto ${mission.impact}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderMiniVictories(victoriesObj) {
  miniVictoriesList.innerHTML = Object.entries(victoriesObj).map(([id, victory]) => `
    <div onclick="window.toggleVictory('${id}', ${victory.done})" 
         class="flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer text-small"
         style="border-color: ${victory.done ? 'var(--text-primary)' : 'var(--border-color)'}; 
                color: ${victory.done ? 'var(--bg-base)' : 'var(--text-secondary)'}; 
                background-color: ${victory.done ? 'var(--text-primary)' : 'transparent'}">
      ${victory.done ? '<i data-lucide="check" style="width:12px"></i>' : ''}
      ${victory.text}
    </div>
  `).join('');
}

function renderWarObjectives(arr) {
  warObjectives.innerHTML = arr.map((obj, index) => `
    <div class="flex items-center gap-3 p-3 rounded border cursor-pointer"
         onclick="window.toggleWarObj(${index})"
         style="background-color: ${obj.done ? 'rgba(255,255,255,0.1)' : 'transparent'}; 
                border-color: ${obj.done ? 'var(--text-primary)' : 'var(--border-color)'}">
      <div class="mission-checkbox ${obj.done ? 'checked' : ''}">
        ${obj.done ? '<i data-lucide="check" style="width:14px"></i>' : ''}
      </div>
      <span class="${obj.done ? 'text-muted line-through' : 'text-white'}">${obj.text}</span>
    </div>
  `).join('');
}

// --- ACTIONS EXPOSED TO WINDOW ---
window.toggleMission = (id, currentDone) => {
  update(ref(db, `users/juan/missions/${id}`), { done: !currentDone });
};

window.toggleVictory = (id, currentDone) => {
  update(ref(db, `users/juan/miniVictories/${id}`), { done: !currentDone });
};

// War Mode Local State for objectives
let localWarObjs = [
  { text: "Bañarse", done: false },
  { text: "Estudiar 25 minutos", done: false },
  { text: "Salir de la cama mentalmente", done: false }
];
window.toggleWarObj = (index) => {
  localWarObjs[index].done = !localWarObjs[index].done;
  renderWarObjectives(localWarObjs);
  lucide.createIcons();
};

// --- EVENT LISTENERS ---
btnModeText.addEventListener('click', () => {
  btnModeText.classList.add('active');
  btnModeDraw.classList.remove('active');
  labTextContainer.classList.remove('hidden');
  labDrawContainer.classList.add('hidden');
});

btnModeDraw.addEventListener('click', () => {
  btnModeDraw.classList.add('active');
  btnModeText.classList.remove('active');
  labDrawContainer.classList.remove('hidden');
  labTextContainer.classList.add('hidden');
  resizeCanvas();
});

// Drawing Logic
let drawing = false;

function resizeCanvas() {
  const container = labCanvas.parentElement;
  labCanvas.width = container.clientWidth;
  labCanvas.height = container.clientHeight;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
}

function startDrawing(e) {
  drawing = true;
  draw(e);
}

function stopDrawing() {
  drawing = false;
  ctx.beginPath();
}

function draw(e) {
  if (!drawing) return;
  
  const rect = labCanvas.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

labCanvas.addEventListener('mousedown', startDrawing);
labCanvas.addEventListener('mousemove', draw);
window.addEventListener('mouseup', stopDrawing);

labCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
labCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
labCanvas.addEventListener('touchend', stopDrawing);

btnClearCanvas.addEventListener('click', () => {
  ctx.clearRect(0, 0, labCanvas.width, labCanvas.height);
});

btnSaveDraw.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = `idea-${Date.now()}.png`;
  link.href = labCanvas.toDataURL();
  link.click();
});

btnToggleLab.addEventListener('click', () => {
  labSection.classList.toggle('hidden');
});

btnSaveLab.addEventListener('click', () => {
  set(ref(db, `users/juan/labNotes`), labTextarea.value);
  labSection.classList.add('hidden');
});

document.getElementById('btn-save-day').addEventListener('click', () => {
  alert('¡Día salvado! ✅ Nunca permitas un día en cero.');
});

// WAR MODE LOGIC
let warInterval;
let timeLeft = 25 * 60;

function updateWarTimer() {
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  warTimer.innerText = `${mins}:${secs}`;
}

btnEnterWar.addEventListener('click', () => {
  warMode.classList.add('active');
});

btnExitWar.addEventListener('click', () => {
  warMode.classList.remove('active');
});

btnStartWar.addEventListener('click', () => {
  if(warInterval) clearInterval(warInterval);
  btnStartWar.innerHTML = `<i data-lucide="activity" style="width:20px"></i> Luchando...`;
  lucide.createIcons();
  
  warInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateWarTimer();
    } else {
      clearInterval(warInterval);
      alert("¡Tiempo cumplido!");
    }
  }, 1000);
});
