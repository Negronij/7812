import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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
const ctx = labCanvas ? labCanvas.getContext('2d') : null;

// Sidebar & Gemini
const sidebar = document.getElementById('sidebar');
const btnToggleSidebarAll = document.getElementById('btn-toggle-sidebar-all');
const btnCollapseSidebar = document.getElementById('btn-collapse-sidebar');
const mainContainer = document.getElementById('main-container');
const btnGeminiToggle = document.getElementById('btn-gemini-toggle');
const geminiChat = document.getElementById('gemini-chat');
const btnCloseGemini = document.getElementById('btn-close-gemini');
const chatInput = document.getElementById('chat-input');
const btnChatSend = document.getElementById('btn-chat-send');
const chatMessages = document.getElementById('chat-messages');
const btnSidebarWar = document.getElementById('btn-sidebar-war');
const navItems = document.querySelectorAll('.nav-item');

// War Mode
const warMode = document.getElementById('war-mode');
const btnEnterWar = document.getElementById('btn-enter-war');
const btnExitWar = document.getElementById('btn-exit-war');
const warTimer = document.getElementById('war-timer');
const warObjectives = document.getElementById('war-objectives');
const btnStartWar = document.getElementById('btn-start-war');

// Mission Modal & Calendar Elements
const weeklyCalendar = document.getElementById('weekly-calendar');
const btnPrevWeek = document.getElementById('btn-prev-week');
const btnNextWeek = document.getElementById('btn-next-week');
const modalMission = document.getElementById('modal-mission');
const btnCloseModal = document.getElementById('btn-close-modal');
const formMission = document.getElementById('form-mission');
const weeklyEfficiency = document.getElementById('weekly-efficiency');
const efficiencyBar = document.getElementById('efficiency-bar');
const dailyCompleted = document.getElementById('daily-completed');
const dailyBar = document.getElementById('daily-bar');

const dailyBar = document.getElementById('daily-bar');

// Victory Modal Elements
const modalVictory = document.getElementById('modal-victory');
const btnCloseModalV = document.getElementById('btn-close-modal-v');
const formVictory = document.getElementById('form-victory');

// Mission State
let selectedDate = new Date();
selectedDate.setHours(0,0,0,0);
let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + (currentWeekStart.getDay() === 0 ? -6 : 1)); // Lunes
currentWeekStart.setHours(0,0,0,0);
const authScreen = document.getElementById('auth-screen');
const btnLoginGoogle = document.getElementById('btn-login-google');
const userProfile = document.getElementById('user-profile');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const btnLogout = document.getElementById('btn-logout');

// --- INIT ---
lucide.createIcons();

let currentUser = null;
let userRef = null;

// Auth State Observer
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    userRef = ref(db, `users/${user.uid}`);
    
    // UI Updates
    if (authScreen) authScreen.classList.add('hidden');
    if (userProfile) {
      userProfile.classList.remove('hidden');
      if (userPhoto) userPhoto.src = user.photoURL;
      if (userName) userName.innerText = user.displayName;
    }

    // Listen for data
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        renderDashboard(data);
        if (weeklyCalendar) {
          renderWeeklyCalendar();
          calculateStats(data);
        }
      } else {
        // Initialize new user with default data
        set(userRef, DEFAULT_DATA);
      }
    });
  } else {
    currentUser = null;
    userRef = null;
    if (authScreen) authScreen.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
    if (loadingScreen) loadingScreen.classList.add('hidden'); // Hide loader to show auth
  }
});

// Auth Actions
if (btnLoginGoogle) {
  btnLoginGoogle.addEventListener('click', async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Error al iniciar sesión. Intenta de nuevo.");
    }
  });
}

if (btnLogout) {
  btnLogout.addEventListener('click', () => signOut(auth));
}

// --- RENDER FUNCTIONS ---
function renderDashboard(data) {
  if (loadingScreen) loadingScreen.classList.add('hidden');
  if (dashboard) dashboard.classList.remove('hidden');

  if (rachaCounter) rachaCounter.innerText = data.racha || 0;
  if (labTextarea) labTextarea.value = data.labNotes || "";

  if (identityList) renderIdentity(data.identity || DEFAULT_DATA.identity);
  if (lifeAreasList) renderLifeAreas(data.lifeAreas || {});
  if (resurrectionTracker) renderResurrection(data.resurrection || DEFAULT_DATA.resurrection);
  if (missionsList) renderMissions(data.missions || {});
  if (miniVictoriesList) renderMiniVictories(data.miniVictories || {});
  if (warObjectives) renderWarObjectives(data.warObjectives || [
    { id: 'w1', text: "Bañarse", done: false },
    { id: 'w2', text: "Estudiar 25 minutos", done: false },
    { id: 'w3', text: "Salir de la cama mentalmente", done: false }
  ]);
  
  // Refresh icons
  lucide.createIcons();
}

function renderIdentity(identityArr) {
  if (!identityList) return;
  identityList.innerHTML = identityArr.map(item => `
    <div class="flex items-center gap-2 p-2 rounded ${item.active ? 'bg-elevated' : ''}" style="background-color: ${item.active ? 'var(--bg-elevated)' : 'transparent'}">
      <div class="w-2 h-2 rounded-full" style="background-color: ${item.active ? 'var(--text-primary)' : 'var(--border-color)'}; width: 8px; height: 8px;"></div>
      <span class="${item.active ? 'text-white font-bold' : 'text-muted'}">${item.text}</span>
    </div>
  `).join('');
}

function renderLifeAreas(areasObj) {
  if (!lifeAreasList) return;
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
  if (!resurrectionTracker) return;
  resurrectionTracker.innerHTML = arr.map(val => `
    <div class="flex-col justify-end h-full flex-1 gap-1 flex" style="height: 100%">
      <div class="w-full rounded-t-sm" style="height: ${val}%; background-color: ${val > 70 ? 'var(--text-primary)' : 'var(--text-muted)'}"></div>
    </div>
  `).join('');
}

function renderMissions(missionsObj) {
  if (!missionsList) return;
  
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dailyMissions = missionsObj[dateStr] || {};
  const isPast = selectedDate < new Date().setHours(0,0,0,0);
  const isTooFar = selectedDate > new Date().setDate(new Date().getDate() + 1); // Solo hoy y mañana

  missionsList.innerHTML = Object.entries(dailyMissions).map(([id, mission]) => `
    <div class="mission-item group">
      <div class="flex items-start gap-3 flex-1" onclick="window.toggleMission('${id}', ${mission.done})">
        <div class="mission-checkbox ${mission.done ? 'checked' : ''}">
          ${mission.done ? '<i data-lucide="check" style="width:14px"></i>' : ''}
        </div>
        <div class="mission-content">
          <div class="mission-title ${mission.done ? 'text-muted line-through' : ''}">${mission.title}</div>
          <div class="mission-meta">
            <span class="meta-tag"><i data-lucide="zap" style="width:10px"></i> ${mission.difficulty}</span>
            <span class="meta-tag">⏱ ${mission.duration}</span>
            <span class="meta-tag">💥 Impacto ${mission.impact}</span>
          </div>
        </div>
      </div>
      ${!isPast ? `
        <button onclick="window.deleteMission('${id}')" class="btn-icon text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          <i data-lucide="trash-2" style="width:16px"></i>
        </button>
      ` : ''}
    </div>
  `).join('') || '<p class="text-center text-muted py-8">No hay misiones para este día.</p>';
}

function renderWeeklyCalendar() {
  if (!weeklyCalendar) return;
  
  const days = [];
  const start = new Date(currentWeekStart);
  const today = new Date();
  today.setHours(0,0,0,0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  weeklyCalendar.innerHTML = days.map(d => {
    const isSelected = d.getTime() === selectedDate.getTime();
    const isToday = d.getTime() === today.getTime();
    const names = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return `
      <div class="calendar-day ${isSelected ? 'active' : ''}" onclick="window.selectDate(${d.getTime()})">
        <span class="day-name">${names[d.getDay()]}</span>
        <span class="day-number">${d.getDate()}</span>
        ${isToday ? '<div class="w-1 h-1 bg-accent-red rounded-full mt-1"></div>' : ''}
      </div>
    `;
  }).join('');
}

function calculateStats(data) {
  if (!weeklyEfficiency) return;
  
  const missions = data.missions || {};
  const todayStr = selectedDate.toISOString().split('T')[0];
  const dayMissions = Object.values(missions[todayStr] || {});
  
  // Daily Stats
  const totalDay = dayMissions.length;
  const doneDay = dayMissions.filter(m => m.done).length;
  dailyCompleted.innerText = `${doneDay}/${totalDay}`;
  dailyBar.style.width = totalDay > 0 ? `${(doneDay / totalDay) * 100}%` : '0%';

  // Weekly Stats (Current displayed week)
  let totalWeek = 0;
  let doneWeek = 0;
  const start = new Date(currentWeekStart);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const ms = Object.values(missions[dStr] || {});
    totalWeek += ms.length;
    doneWeek += ms.filter(m => m.done).length;
  }

  const efficiency = totalWeek > 0 ? Math.round((doneWeek / totalWeek) * 100) : 0;
  weeklyEfficiency.innerText = `${efficiency}%`;
  efficiencyBar.style.width = `${efficiency}%`;
}

function renderMiniVictories(victoriesObj) {
  if (!miniVictoriesList) return;
  
  const dateStr = selectedDate.toISOString().split('T')[0];
  const dailyVictories = victoriesObj[dateStr] || {};
  const isPast = selectedDate < new Date().setHours(0,0,0,0);

  miniVictoriesList.innerHTML = Object.entries(dailyVictories).map(([id, victory]) => `
    <div class="flex items-center gap-2 group">
      <div onclick="window.toggleVictory('${id}', ${victory.done})" 
           class="flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer text-small transition-all"
           style="border-color: ${victory.done ? 'var(--text-primary)' : 'var(--border-color)'}; 
                  color: ${victory.done ? 'var(--bg-base)' : 'var(--text-secondary)'}; 
                  background-color: ${victory.done ? 'var(--text-primary)' : 'transparent'}">
        ${victory.done ? '<i data-lucide="check" style="width:12px"></i>' : ''}
        <span>${victory.text}</span>
        <span class="opacity-40 text-[10px] ml-1">${victory.impact || 'Medio'}</span>
      </div>
      ${!isPast ? `
        <button onclick="window.deleteVictory('${id}')" class="btn-icon text-muted opacity-0 group-hover:opacity-100 transition-opacity p-1">
          <i data-lucide="trash-2" style="width:14px"></i>
        </button>
      ` : ''}
    </div>
  `).join('') || '<p class="text-small text-muted py-2">Sin victorias registradas para este día.</p>';
}

function renderWarObjectives(arr) {
  if (!warObjectives) return;
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
  if (!userRef) return;
  const isPast = selectedDate < new Date().setHours(0,0,0,0);
  if (isPast) {
    alert("No puedes modificar misiones de días pasados.");
    return;
  }
  const dateStr = selectedDate.toISOString().split('T')[0];
  update(ref(db, `users/${currentUser.uid}/missions/${dateStr}/${id}`), { done: !currentDone });
};

window.deleteMission = (id) => {
  if (!userRef) return;
  if (!confirm("¿Seguro que quieres eliminar esta misión?")) return;
  const dateStr = selectedDate.toISOString().split('T')[0];
  set(ref(db, `users/${currentUser.uid}/missions/${dateStr}/${id}`), null);
};

window.addMission = () => {
  if (!userRef) return;
  const today = new Date().setHours(0,0,0,0);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0);
  
  if (selectedDate < today || selectedDate > tomorrow) {
    alert("Solo puedes añadir misiones para hoy o mañana.");
    return;
  }

  if (modalMission) modalMission.classList.remove('hidden');
};

window.selectDate = (timestamp) => {
  selectedDate = new Date(timestamp);
  renderWeeklyCalendar();
  // We need to re-fetch or re-render based on current snapshot
  get(userRef).then(snapshot => {
    if (snapshot.exists()) renderDashboard(snapshot.val());
  });
};

window.toggleVictory = (id, currentDone) => {
  if (!userRef) return;
  const today = new Date().setHours(0,0,0,0);
  if (selectedDate.getTime() !== today) {
    alert("Las victorias solo pueden marcarse el mismo día.");
    return;
  }
  const dateStr = selectedDate.toISOString().split('T')[0];
  update(ref(db, `users/${currentUser.uid}/miniVictories/${dateStr}/${id}`), { done: !currentDone });
};

window.deleteVictory = (id) => {
  if (!userRef) return;
  const today = new Date().setHours(0,0,0,0);
  if (selectedDate.getTime() !== today) {
    alert("No puedes eliminar victorias de días pasados o futuros.");
    return;
  }
  if (!confirm("¿Seguro que quieres eliminar esta victoria?")) return;
  const dateStr = selectedDate.toISOString().split('T')[0];
  set(ref(db, `users/${currentUser.uid}/miniVictories/${dateStr}/${id}`), null);
};

window.addVictory = () => {
  if (!userRef) return;
  const today = new Date().setHours(0,0,0,0);
  if (selectedDate.getTime() !== today) {
    alert("Las victorias solo pueden registrarse el mismo día.");
    return;
  }
  if (modalVictory) modalVictory.classList.remove('hidden');
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
if (btnModeText) btnModeText.addEventListener('click', () => {
  btnModeText.classList.add('active');
  btnModeDraw.classList.remove('active');
  labTextContainer.classList.remove('hidden');
  labDrawContainer.classList.add('hidden');
});

if (btnModeDraw) btnModeDraw.addEventListener('click', () => {
  btnModeDraw.classList.add('active');
  btnModeText.classList.remove('active');
  labDrawContainer.classList.remove('hidden');
  labTextContainer.classList.add('hidden');
  resizeCanvas();
});

// Drawing Logic
let drawing = false;
let currentTool = 'pen';
let currentColor = '#ffffff';

function resizeCanvas() {
  if (!labCanvas) return;
  const container = labCanvas.parentElement;
  labCanvas.width = container.clientWidth;
  labCanvas.height = container.clientHeight;
  applyDrawingSettings();
}

function applyDrawingSettings() {
  if (!ctx) return;
  
  // Explicit background color for eraser matching var(--bg-elevated)
  const bgColor = '#111111'; 
  const strokeWidth = document.getElementById('stroke-width-slider').value;
  
  ctx.strokeStyle = currentTool === 'eraser' ? bgColor : currentColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Update UI
  const valDisplay = document.getElementById('stroke-value');
  if (valDisplay) valDisplay.innerText = strokeWidth + 'px';
  
  // Update Eraser Preview size
  const eraserPreview = document.getElementById('eraser-preview');
  if (eraserPreview) {
    eraserPreview.style.width = strokeWidth + 'px';
    eraserPreview.style.height = strokeWidth + 'px';
    // If tool is eraser, make preview slightly more visible
    eraserPreview.style.borderColor = currentTool === 'eraser' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)';
  }
}

function startDrawing(e) {
  if (currentTool === 'bucket') {
    fillArea(e);
    return;
  }
  drawing = true;
  draw(e);
}

function fillArea(e) {
  if (!ctx || !labCanvas) return;
  const rect = labCanvas.getBoundingClientRect();
  const startX = Math.round((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left);
  const startY = Math.round((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top);
  
  const imageData = ctx.getImageData(0, 0, labCanvas.width, labCanvas.height);
  const pixelData = imageData.data;
  
  const startPos = (startY * labCanvas.width + startX) * 4;
  const startR = pixelData[startPos];
  const startG = pixelData[startPos + 1];
  const startB = pixelData[startPos + 2];
  const startA = pixelData[startPos + 3];

  const fillColor = hexToRgb(currentColor);
  if (!fillColor) return;
  
  // Don't fill if same color
  if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b && startA === 255) return;

  const stack = [[startX, startY]];
  
  while (stack.length) {
    const [x, y] = stack.pop();
    const pos = (y * labCanvas.width + x) * 4;

    if (x < 0 || x >= labCanvas.width || y < 0 || y >= labCanvas.height) continue;
    if (pixelData[pos] !== startR || pixelData[pos+1] !== startG || pixelData[pos+2] !== startB || pixelData[pos+3] !== startA) continue;

    pixelData[pos] = fillColor.r;
    pixelData[pos + 1] = fillColor.g;
    pixelData[pos + 2] = fillColor.b;
    pixelData[pos + 3] = 255;

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function stopDrawing() {
  drawing = false;
  if (ctx) ctx.beginPath();
}

function draw(e) {
  if (!ctx) return;
  
  const rect = labCanvas.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

  // Show/Hide/Move eraser preview
  const eraserPreview = document.getElementById('eraser-preview');
  if (eraserPreview) {
    if (currentTool === 'eraser') {
      eraserPreview.classList.remove('hidden');
      eraserPreview.style.left = x + 'px';
      eraserPreview.style.top = y + 'px';
    } else {
      eraserPreview.classList.add('hidden');
    }
  }

  if (!drawing) return;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

if (labCanvas) {
  labCanvas.addEventListener('mousedown', startDrawing);
  labCanvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  labCanvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
  labCanvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
  labCanvas.addEventListener('touchend', stopDrawing);

  // Tools & Colors
  const btnPen = document.getElementById('btn-tool-pen');
  const btnEraser = document.getElementById('btn-tool-eraser');
  const colorBtns = document.querySelectorAll('.color-btn');

  if (btnPen) btnPen.addEventListener('click', () => {
    currentTool = 'pen';
    btnPen.classList.add('active');
    btnEraser.classList.remove('active');
    applyDrawingSettings();
  });

  if (btnEraser) btnEraser.addEventListener('click', () => {
    currentTool = 'eraser';
    btnEraser.classList.add('active');
    btnPen.classList.remove('active');
    if (btnBucket) btnBucket.classList.remove('active');
    applyDrawingSettings();
  });

  const btnBucket = document.getElementById('btn-tool-bucket');
  if (btnBucket) btnBucket.addEventListener('click', () => {
    currentTool = 'bucket';
    btnBucket.classList.add('active');
    btnPen.classList.remove('active');
    if (btnEraser) btnEraser.classList.remove('active');
    applyDrawingSettings();
  });

  const btnAddSpace = document.getElementById('btn-add-space');
  if (btnAddSpace) btnAddSpace.addEventListener('click', () => {
    if (!labCanvas || !ctx) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = labCanvas.width;
    tempCanvas.height = labCanvas.height;
    tempCanvas.getContext('2d').drawImage(labCanvas, 0, 0);
    
    const newHeight = labCanvas.height + 1000;
    const container = labCanvas.parentElement;
    container.style.height = newHeight + 'px';
    labCanvas.height = newHeight;
    
    ctx.drawImage(tempCanvas, 0, 0);
    applyDrawingSettings();
  });

  const strokeSlider = document.getElementById('stroke-width-slider');
  if (strokeSlider) strokeSlider.addEventListener('input', applyDrawingSettings);

  const customColorPicker = document.getElementById('custom-color-picker');
  if (customColorPicker) customColorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
    currentTool = 'pen';
    if (btnPen) btnPen.classList.add('active');
    if (btnEraser) btnEraser.classList.remove('active');
    colorBtns.forEach(b => b.classList.remove('active'));
    customColorPicker.classList.add('active');
    applyDrawingSettings();
  });

  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentColor = btn.getAttribute('data-color');
      colorBtns.forEach(b => b.classList.remove('active'));
      if (customColorPicker) customColorPicker.classList.remove('active');
      btn.classList.add('active');
      currentTool = 'pen'; // Auto switch to pen when color picked
      if (btnPen) btnPen.classList.add('active');
      if (btnEraser) btnEraser.classList.remove('active');
      applyDrawingSettings();
    });
  });
}

if (btnClearCanvas) btnClearCanvas.addEventListener('click', () => {
  if (ctx && labCanvas) ctx.clearRect(0, 0, labCanvas.width, labCanvas.height);
});

if (btnSaveDraw) btnSaveDraw.addEventListener('click', () => {
  if (!labCanvas) return;
  const link = document.createElement('a');
  link.download = `idea-${Date.now()}.png`;
  link.href = labCanvas.toDataURL();
  link.click();
});

// --- SIDEBAR & NAVIGATION ---
function toggleSidebar(forceCollapse) {
  if (!sidebar) return;
  
  const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
  const shouldCollapse = forceCollapse !== undefined ? forceCollapse : !isCurrentlyCollapsed;
  
  if (shouldCollapse) {
    sidebar.classList.add('collapsed');
    sidebar.classList.remove('open');
    if (mainContainer) {
      mainContainer.classList.remove('sidebar-open-padding');
      mainContainer.classList.add('sidebar-collapsed-padding');
    }
  } else {
    sidebar.classList.remove('collapsed');
    sidebar.classList.add('open');
    if (mainContainer) {
      mainContainer.classList.add('sidebar-open-padding');
      mainContainer.classList.remove('sidebar-collapsed-padding');
    }
  }
  localStorage.setItem('sidebar-collapsed', shouldCollapse);
}

if (btnToggleSidebarAll) btnToggleSidebarAll.addEventListener('click', () => toggleSidebar());
if (btnCollapseSidebar) btnCollapseSidebar.addEventListener('click', () => toggleSidebar(true));

// Mission Modal & Calendar Navigation
if (btnPrevWeek) btnPrevWeek.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderWeeklyCalendar();
  get(userRef).then(snapshot => { if (snapshot.exists()) calculateStats(snapshot.val()); });
});

if (btnNextWeek) btnNextWeek.addEventListener('click', () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderWeeklyCalendar();
  get(userRef).then(snapshot => { if (snapshot.exists()) calculateStats(snapshot.val()); });
});

if (btnCloseModal) btnCloseModal.addEventListener('click', () => {
  modalMission.classList.add('hidden');
});

if (formMission) formMission.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!userRef) return;

  const dateStr = selectedDate.toISOString().split('T')[0];
  const id = 'm' + Date.now();
  const newData = {
    title: document.getElementById('mission-name').value,
    difficulty: document.getElementById('mission-difficulty').value,
    duration: document.getElementById('mission-duration').value,
    impact: document.getElementById('mission-impact').value,
    done: false
  };

  set(ref(db, `users/${currentUser.uid}/missions/${dateStr}/${id}`), newData)
    .then(() => {
      modalMission.classList.add('hidden');
      formMission.reset();
    });
});

if (btnCloseModalV) btnCloseModalV.addEventListener('click', () => {
  modalVictory.classList.add('hidden');
});

if (formVictory) formVictory.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!userRef) return;

  const dateStr = selectedDate.toISOString().split('T')[0];
  const id = 'v' + Date.now();
  const newData = {
    text: document.getElementById('victory-text').value,
    impact: document.getElementById('victory-impact').value,
    done: true
  };

  set(ref(db, `users/${currentUser.uid}/miniVictories/${dateStr}/${id}`), newData)
    .then(() => {
      modalVictory.classList.add('hidden');
      formVictory.reset();
    });
});

// Restore sidebar state
const savedSidebarState = localStorage.getItem('sidebar-collapsed');
// On desktop, default to OPEN (false). On mobile, default to CLOSED (true).
const isMobile = window.innerWidth < 1024;
const initialState = savedSidebarState === null ? isMobile : savedSidebarState === 'true';
toggleSidebar(initialState);

if (btnSidebarWar) btnSidebarWar.addEventListener('click', () => {
  if (warMode) warMode.classList.add('active');
  toggleSidebar(true);
});

navItems.forEach(item => {
  item.addEventListener('click', () => {
    // On mobile, close sidebar after clicking a nav item
    if (window.innerWidth < 1024) {
      toggleSidebar(true);
    }
  });
});

// --- GEMINI LOGIC ---
if (btnGeminiToggle) btnGeminiToggle.addEventListener('click', () => {
  geminiChat.classList.toggle('hidden');
});

if (btnCloseGemini) btnCloseGemini.addEventListener('click', () => {
  geminiChat.classList.add('hidden');
});

function addChatMessage(role, text) {
  if (!chatMessages) return;
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;
  msg.innerText = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (btnChatSend) btnChatSend.addEventListener('click', () => {
  const text = chatInput.value.trim();
  if (!text) return;
  
  addChatMessage('user', text);
  chatInput.value = '';
  
  // Simulate Gemini Response
  setTimeout(() => {
    const responses = [
      "Entendido. He analizado tus misiones. Recomiendo priorizar 'Simulacro Final' para maximizar tu impacto hoy.",
      "Tu racha de 4 días es excelente. Sigue así para fortalecer tu identidad estratégica.",
      "He registrado tu idea en el laboratorio. ¿Quieres que profundice en el plan de acción?",
      "Recuerda la regla No Cero: incluso 10 minutos de estudio hoy cuentan para tu progreso anual."
    ];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addChatMessage('bot', randomResponse);
  }, 1000);
});

if (chatInput) chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') btnChatSend.click();
});

if (btnToggleLab) btnToggleLab.addEventListener('click', () => {
  labSection.classList.toggle('hidden');
});

if (btnSaveLab) btnSaveLab.addEventListener('click', () => {
  if (!userRef) return;
  set(ref(db, `users/${currentUser.uid}/labNotes`), labTextarea.value);
  if (labSection) labSection.classList.add('hidden');
});

const btnSaveDay = document.getElementById('btn-save-day');
if (btnSaveDay) btnSaveDay.addEventListener('click', () => {
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

if (btnEnterWar) btnEnterWar.addEventListener('click', () => {
  if (warMode) warMode.classList.add('active');
});

if (btnExitWar) btnExitWar.addEventListener('click', () => {
  if (warMode) warMode.classList.remove('active');
});

if (btnStartWar) btnStartWar.addEventListener('click', () => {
  if (!warTimer) return;
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
