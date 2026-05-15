import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crosshair, Target, Flag, Activity, Check, 
  Terminal, Brain, Zap, Battery, ArrowRight, 
  Shield, Sword, X, Plus, Play, RefreshCw, 
  BarChart, BookOpen, Flame, Loader
} from 'lucide-react';
import { ref, onValue, set, update } from "firebase/database";
import { db } from "./firebase";

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
  }
};

export default function App() {
  const [warMode, setWarMode] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRef = ref(db, 'users/juan');
    const unsubscribe = onValue(userRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        // Ensure all objects exist even if empty in Firebase
        setData({
          ...DEFAULT_DATA, // fallback structure
          ...val,
          missions: val.missions || {},
          miniVictories: val.miniVictories || {},
          lifeAreas: val.lifeAreas || {}
        });
      } else {
        // First time initialization
        set(userRef, DEFAULT_DATA);
        setData(DEFAULT_DATA);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleMission = (id, done) => {
    update(ref(db, `users/juan/missions/${id}`), { done: !done });
  };

  const toggleVictory = (id, done) => {
    update(ref(db, `users/juan/miniVictories/${id}`), { done: !done });
  };

  const saveLabNotes = (notes) => {
    set(ref(db, `users/juan/labNotes`), notes);
  };

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-muted" size={48} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <AnimatePresence>
        {warMode ? (
          <WarMode key="war-mode" onClose={() => setWarMode(false)} />
        ) : (
          <Dashboard 
            key="dashboard" 
            data={data}
            onEnterWarMode={() => setWarMode(true)} 
            onToggleMission={toggleMission}
            onToggleVictory={toggleVictory}
            onSaveLabNotes={saveLabNotes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Dashboard({ data, onEnterWarMode, onToggleMission, onToggleVictory, onSaveLabNotes }) {
  const [labOpen, setLabOpen] = useState(false);
  const [labText, setLabText] = useState(data.labNotes || "");

  const handleSaveLab = () => {
    onSaveLabNotes(labText);
    setLabOpen(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="container"
    >
      {/* 10. FRASE CENTRAL DEL SISTEMA */}
      <header className="mb-8 mt-4 text-center">
        <h1 className="text-huge text-muted" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#333' }}>
          NO ESTAMOS INTENTANDO SOBREVIVIR.
        </h1>
        <h1 className="text-huge">
          ESTAMOS CONSTRUYENDO LA VIDA QUE QUEREMOS DOMINAR.
        </h1>
      </header>

      <div className="grid-dashboard">
        
        {/* LEFT COLUMN */}
        <div className="flex-col gap-6">
          {/* 7. SISTEMA DE IDENTIDAD */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2"><Shield size={16} /> Identidad en Construcción</h3>
            </div>
            <ul className="flex-col gap-2">
              <IdentityTrait text="Disciplinado" />
              <IdentityTrait text="Estratégico" />
              <IdentityTrait text="Fuerte Mentalmente" />
              <IdentityTrait text="Peligroso para la mediocridad" active />
            </ul>
          </section>

          {/* 4. ÁREAS DE VIDA */}
          <section className="card mt-6">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2"><Activity size={16} /> Áreas de Vida</h3>
            </div>
            <div className="flex-col gap-3">
              {Object.entries(data.lifeAreas).map(([id, area]) => (
                <LifeArea key={id} name={area.name} value={area.value} />
              ))}
            </div>
          </section>

          {/* 8. TRACKER DE RESURRECCIÓN */}
          <section className="card mt-6">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2"><BarChart size={16} /> Resurrección</h3>
            </div>
            <div className="text-small mb-2">Energía & Enfoque (Últimos 7 días)</div>
            <div className="flex items-end gap-2 h-24 mt-4">
              {[30, 45, 40, 60, 55, 80, 95].map((val, i) => (
                <div key={i} className="flex-col justify-end h-full flex-1 gap-1">
                  <div className="w-full bg-text-primary rounded-t-sm transition-all duration-1000" style={{ height: `${val}%`, backgroundColor: val > 70 ? 'var(--text-primary)' : 'var(--text-muted)' }}></div>
                </div>
              ))}
            </div>
            <div className="text-center text-small mt-2">"Estoy volviendo."</div>
          </section>
        </div>


        {/* CENTER COLUMN: EL MAPA */}
        <div className="flex-col gap-6">
          
          {/* 1. TABLERO CENTRAL */}
          <section className="card" style={{ borderColor: 'var(--text-primary)' }}>
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2 text-primary"><Crosshair size={16} /> El Mapa</h3>
              <div className="text-small flex items-center gap-1"><Flame size={14} className="text-accent-red" /> Racha: {data.racha} días</div>
            </div>
            
            <div className="mb-4 pb-4 border-b border-border-color">
              <div className="text-small">Misión Actual</div>
              <div className="text-title">Recuperar disciplina. Aprobar finales. Reconstruir enfoque.</div>
            </div>

            <div className="flex gap-4 text-small">
              <div className="flex-1">
                <span className="text-muted block">Objetivo Mes</span>
                <span>Dominar el 80% del temario</span>
              </div>
              <div className="flex-1">
                <span className="text-muted block">Objetivo Semana</span>
                <span>Cerrar unidad 3 y 4</span>
              </div>
            </div>
          </section>

          {/* 2. SISTEMA DE MISIONES */}
          <section className="card mt-6">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2"><Target size={16} /> Misiones Activas</h3>
              <button className="btn-icon"><Plus size={16} /></button>
            </div>
            
            {Object.entries(data.missions).map(([id, mission]) => (
              <Mission 
                key={id} 
                {...mission} 
                onToggle={() => onToggleMission(id, mission.done)} 
              />
            ))}
          </section>

          {/* 3. MINI VICTORIAS */}
          <section className="card mt-6">
            <div className="card-header">
              <h3 className="card-title flex items-center gap-2"><Flag size={16} /> Mini Victorias</h3>
              <span className="text-small">Acumulando Dopamina</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.miniVictories).map(([id, victory]) => (
                <MiniVictory 
                  key={id} 
                  text={victory.text} 
                  done={victory.done} 
                  onToggle={() => onToggleVictory(id, victory.done)} 
                />
              ))}
            </div>
          </section>
        </div>


        {/* RIGHT COLUMN */}
        <div className="flex-col gap-6">
          
          {/* 9. SISTEMA NO CERO */}
          <section className="card" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
             <div className="card-header border-none pb-0 mb-2">
               <h3 className="card-title flex items-center gap-2"><Battery size={16} /> Sistema No Cero</h3>
             </div>
             <p className="text-small text-muted mb-4">Regla máxima: Nunca un día completamente vacío. Los días en cero destruyen identidad.</p>
             <button className="btn btn-outline w-full justify-between" onClick={() => alert('¡Día salvado! ✅')}>
               <span>Salvar el día (10 min)</span>
               <Check size={16} />
             </button>
          </section>

          {/* ACCIONES RÁPIDAS */}
          <section className="flex-col gap-3 mt-6">
            <button onClick={() => setLabOpen(!labOpen)} className="btn btn-outline w-full justify-between py-4" style={{ backgroundColor: labOpen ? 'var(--bg-highlight)' : 'transparent' }}>
              <span className="flex items-center gap-2"><Terminal size={18} /> Laboratorio de Ideas</span>
              <ArrowRight size={16} />
            </button>
            
            <button onClick={onEnterWarMode} className="btn btn-outline w-full justify-between py-4" style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)' }}>
              <span className="flex items-center gap-2"><Sword size={18} /> Activar Modo Guerra</span>
              <Zap size={16} />
            </button>
          </section>

          {/* 6. LABORATORIO (TOGGLEABLE) */}
          <AnimatePresence>
            {labOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="card mt-2 overflow-hidden"
              >
                 <h3 className="card-title mb-4 flex items-center gap-2"><Brain size={16} /> Descarga Mental</h3>
                 <textarea 
                   className="w-full bg-bg-elevated border border-border-color text-text-primary p-3 rounded-md font-mono text-small resize-none focus:outline-none focus:border-text-primary transition-colors" 
                   rows="6"
                   placeholder="Ideas de negocios, apps, proyectos, frases, pensamientos..."
                   value={labText}
                   onChange={(e) => setLabText(e.target.value)}
                 ></textarea>
                 <button className="btn btn-primary w-full mt-3 text-small" onClick={handleSaveLab}>Guardar en el Laboratorio</button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </motion.div>
  );
}

// --- MODO GUERRA (5) ---
function WarMode({ onClose }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="war-mode"
    >
      <button onClick={onClose} className="absolute top-8 right-8 text-muted hover:text-white transition-colors">
        <X size={32} />
      </button>

      <div className="war-mode-content">
        <div className="text-accent-red tracking-widest text-small font-bold mb-4 flex items-center justify-center gap-2">
          <Sword size={16} /> MODO GUERRA ACTIVADO
        </div>

        <h1 className="text-huge mb-8 text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          HOY GANAR SIGNIFICA NO ABANDONAR
        </h1>

        <div className="war-timer font-mono">
          {mins}:{secs}
        </div>

        <div className="card text-left max-w-md mx-auto mt-8 border-accent-red" style={{ backgroundColor: 'rgba(255,0,0,0.05)', borderColor: 'rgba(255,51,51,0.3)' }}>
          <h3 className="card-title mb-4 text-white">Objetivos Mínimos Viables</h3>
          <div className="flex-col gap-3">
            <WarObjective text="Bañarse" />
            <WarObjective text="Estudiar 25 minutos" />
            <WarObjective text="Salir de la cama mentalmente" />
          </div>
        </div>

        <button className="btn btn-danger mt-8 px-8 py-4 flex items-center gap-2 mx-auto" onClick={() => alert('¡Empieza la cuenta atrás! 💪')}>
          <Play size={20} /> Empezar a Luchar
        </button>
      </div>
    </motion.div>
  );
}

function WarObjective({ text }) {
  const [done, setDone] = useState(false);
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded border border-border-color cursor-pointer transition-colors"
      style={{ backgroundColor: done ? 'rgba(255,255,255,0.1)' : 'transparent', borderColor: done ? 'var(--text-primary)' : 'var(--border-color)' }}
      onClick={() => setDone(!done)}
    >
      <div className={`mission-checkbox ${done ? 'checked' : ''}`}>
        {done && <Check size={14} />}
      </div>
      <span className={done ? 'text-muted line-through' : 'text-white'}>{text}</span>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function IdentityTrait({ text, active }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded ${active ? 'bg-bg-elevated' : ''}`}>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-text-primary' : 'bg-border-color'}`}></div>
      <span className={active ? 'text-white font-bold' : 'text-muted'}>{text}</span>
    </div>
  );
}

function LifeArea({ name, value }) {
  return (
    <div>
      <div className="flex justify-between text-small mb-1">
        <span>{name}</span>
        <span className="text-muted">{value}%</span>
      </div>
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${value}%`, backgroundColor: value < 50 ? 'var(--text-muted)' : 'var(--text-primary)' }}></div>
      </div>
    </div>
  );
}

function Mission({ title, difficulty, duration, impact, done, onToggle }) {
  return (
    <div className="mission-item">
      <div className={`mission-checkbox ${done ? 'checked' : ''}`} onClick={onToggle}>
        {done && <Check size={14} />}
      </div>
      <div className="mission-content">
        <div className={`mission-title ${done ? 'text-muted line-through' : ''}`}>Misión: {title}</div>
        <div className="mission-meta">
          <span className="meta-tag"><Zap size={10} /> {difficulty}</span>
          <span className="meta-tag">⏱ {duration}</span>
          <span className="meta-tag">💥 Impacto {impact}</span>
        </div>
      </div>
    </div>
  );
}

function MiniVictory({ text, done, onToggle }) {
  return (
    <div 
      onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1 rounded-full border cursor-pointer transition-colors text-small"
      style={{ 
        borderColor: done ? 'var(--text-primary)' : 'var(--border-color)',
        color: done ? 'var(--bg-base)' : 'var(--text-secondary)',
        backgroundColor: done ? 'var(--text-primary)' : 'transparent'
      }}
    >
      {done && <Check size={12} />}
      {text}
    </div>
  );
}
