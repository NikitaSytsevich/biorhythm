import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, ChevronLeft,
  StopCircle, Edit3, CalendarClock,
  ArrowRight, Lightbulb, AlertTriangle,
  Activity, Thermometer, Brain
} from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { FASTING_PHASES, PRESETS } from '../../../data/fastingPhases';
import type { FastingPhase } from '../../../data/fastingPhases';
import { buildStyles, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

// ==========================================
// 🌈 THEME ENGINE
// ==========================================

type PhaseTheme = { primary: string; secondary: string; bg: string; accent: string; shadow: string; };
const getPhaseTheme = (hours: number): PhaseTheme => {
  if (hours < 12) return { primary: '#60A5FA', secondary: '#93C5FD', bg: 'bg-blue-500/10', accent: 'text-blue-400', shadow: 'shadow-blue-500/20' };
  if (hours < 24) return { primary: '#F97316', secondary: '#FDBA74', bg: 'bg-orange-500/10', accent: 'text-orange-400', shadow: 'shadow-orange-500/20' };
  if (hours < 72) return { primary: '#34D399', secondary: '#6EE7B7', bg: 'bg-emerald-500/10', accent: 'text-emerald-400', shadow: 'shadow-emerald-500/20' };
  return { primary: '#A78BFA', secondary: '#C4B5FD', bg: 'bg-violet-500/10', accent: 'text-violet-400', shadow: 'shadow-violet-500/20' };
};

// ==========================================
// 🛠 UTILITIES
// ==========================================

const formatTimeDetailed = (ms: number) => {
  if (!ms || ms < 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h: h.toString().padStart(2, '0'), m: m.toString().padStart(2, '0'), s: s.toString().padStart(2, '0') };
};

const formatDuration = (ms: number) => {
  if (!ms || ms < 0) return "0м";
  const totalMin = Math.floor(ms / (1000 * 60));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h === 0 ? `${m}м` : `${h}ч ${m}м`;
};

const getExpectedEndTime = (startTime: number | null, targetHours: number) => {
  if (!startTime) return "--:--";
  const end = new Date(startTime + targetHours * 60 * 60 * 1000);
  const now = new Date();
  const isToday = end.getDate() === now.getDate();
  const timeStr = end.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return isToday ? timeStr : `Завтра ${timeStr}`;
};

const toLocalISOString = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  return localISOTime;
};

const haptic = (pattern: number | number[] = 20) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
};

// ==========================================
// 🧩 COMPONENTS
// ==========================================

const GlassCard = ({ children, className = "", onClick }: any) => (
  <div onClick={onClick} className={`bg-[#121212]/80 backdrop-blur-md border border-white/5 rounded-[2rem] shadow-xl overflow-hidden ${className}`}>{children}</div>
);

const AnimatedBackground = ({ theme }: { theme: PhaseTheme }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#050505] z-0 transition-colors duration-1000">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05]" />
    <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], opacity: [0.2, 0.4, 0.2], backgroundColor: theme.primary }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] rounded-full blur-[150px] opacity-20" />
    <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -100, 0], opacity: [0.1, 0.3, 0.1], backgroundColor: theme.secondary }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-20%] right-[-20%] w-[90vw] h-[90vw] rounded-full blur-[150px] opacity-20" />
  </div>
);

const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#050505] z-0">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
    <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], scale: [1, 1.2, 0.9, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-teal-900/30 rounded-full blur-[120px]" />
    <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -100, 0], scale: [1, 1.3, 0.8, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-20%] right-[-20%] w-[90vw] h-[90vw] bg-indigo-900/20 rounded-full blur-[120px]" />
  </div>
);

const BeamLine = ({ active, height }: { active: boolean, height: number }) => (
  <div className="absolute left-[29px] top-0 w-[2px] z-0 overflow-hidden" style={{ height }}>
    <div className="absolute inset-0 bg-white/5" />
    {active && <motion.div className="absolute inset-0 w-full bg-gradient-to-b from-teal-500 via-emerald-400 to-teal-500" initial={{ y: "-100%" }} animate={{ y: "100%" }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ boxShadow: "0 0 15px #2dd4bf" }} />}
  </div>
);

const TimelineNode = ({ phase, activePhaseId, currentHour, onSelect }: any) => {
  const isPassed = currentHour >= phase.hoursStart;
  const isCurrent = activePhaseId === phase.id;
  const theme = getPhaseTheme(phase.hoursStart);
  return (
    <div id={`phase-${phase.id}`} onClick={() => onSelect(phase)} className="relative flex flex-col items-center min-w-[100px] snap-center cursor-pointer group pt-4">
       <motion.div layoutId={`phase-icon-container-${phase.id}`} className={`relative w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${isCurrent ? `bg-[#0F0F0F] text-white shadow-[0_0_20px_${theme.primary}40] scale-110` : (isPassed ? `bg-[#0A0A0A] text-${theme.accent} border-white/10` : 'bg-transparent border-white/5 text-gray-600')}`} style={{ borderColor: isCurrent ? theme.primary : undefined }}>
          <phase.icon size={20} style={{ color: isCurrent ? theme.primary : undefined }} />
          {isCurrent && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg" style={{backgroundColor: theme.primary}}/>}
       </motion.div>
       <span className="text-[10px] font-mono mt-3 text-gray-500">{phase.hoursStart}ч</span>
    </div>
  );
};

// NATIVE PICKER BUTTON (Wrapper)
const NativePickerButton = ({ icon: Icon, value, onChange }: { icon: any, value: number, onChange: (date: number) => void }) => {
  const dateValue = value ? toLocalISOString(new Date(value)) : toLocalISOString(new Date());

  return (
    <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition-colors">
      <Icon size={20} className="text-gray-400 pointer-events-none" />
      <input
        type="datetime-local"
        value={dateValue}
        onChange={(e) => {
          if (e.target.value) {
            const newDate = new Date(e.target.value).getTime();
            onChange(newDate);
          }
        }}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
      />
    </div>
  );
};

const PhaseDeepDive = ({ phase, onClose, theme }: { phase: FastingPhase, onClose: () => void, theme: PhaseTheme }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-6">
      <div className="absolute inset-0" onClick={onClose} />
      <motion.div layoutId={`phase-card-${phase.id}`} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-full max-w-lg h-[95vh] sm:h-[85vh] bg-[#0A0A0A] sm:rounded-[3rem] rounded-t-[3rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        <div className="relative p-8 pb-6 shrink-0 z-20">
           <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-30 pointer-events-none`} style={{ backgroundColor: theme.primary }} />
           <div className="relative z-10 flex justify-between items-start">
              <div>
                 <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md mb-3`} style={{ backgroundColor: `${theme.primary}20` }}><phase.icon size={14} style={{ color: theme.primary }} /><span className="text-[10px] font-bold uppercase tracking-widest text-white">Фаза {phase.id}</span></div>
                 <h2 className="text-3xl font-bold text-white leading-tight max-w-[250px]">{phase.title}</h2>
                 <p className="text-gray-400 text-sm mt-1">{phase.subtitle}</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-md"><X size={20} /></button>
           </div>
           <div className="mt-6 flex items-center gap-3"><div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full w-1/3 rounded-full" style={{ backgroundColor: theme.primary }} /></div><span className="text-xs font-mono text-gray-400 whitespace-nowrap">{phase.hoursStart} — {phase.hoursEnd || '∞'} ч</span></div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scroll">
           <div className="flex flex-col gap-4">
              <GlassCard className="p-6 bg-gradient-to-br from-white/5 to-transparent"><div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-blue-500/20 text-blue-400"><Activity size={20}/></div><h3 className="text-sm font-bold text-white uppercase tracking-wider">Физиология</h3></div><p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{phase.details.physiology}</p></GlassCard>
              <div className="grid grid-cols-2 gap-4"><GlassCard className="p-5 bg-white/[0.02]"><div className="mb-3 text-orange-400"><Thermometer size={20}/></div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Ощущения</h4><p className="text-xs text-gray-300 leading-relaxed">{phase.details.sensations}</p></GlassCard><GlassCard className="p-5 bg-white/[0.02]"><div className="mb-3 text-purple-400"><Brain size={20}/></div><h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Настрой</h4><p className="text-xs text-gray-300 leading-relaxed">{phase.details.mindset}</p></GlassCard></div>
              {phase.recommendations && (<GlassCard className="p-6 border-l-4" style={{ borderLeftColor: theme.primary }}><div className="flex items-center gap-2 mb-4"><Lightbulb size={18} style={{ color: theme.primary }}/><h3 className="text-sm font-bold text-white uppercase">Что делать</h3></div><div className="space-y-4"><div><p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Питание & Вода</p><ul className="space-y-2">{phase.recommendations.nutrition.map((rec, i) => (<li key={i} className="flex gap-3 text-sm text-gray-300"><div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: theme.primary }}/>{rec}</li>))}</ul></div><div><p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Активность</p><ul className="space-y-2">{phase.recommendations.activity.map((rec, i) => (<li key={i} className="flex gap-3 text-sm text-gray-300"><div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-white/20"/>{rec}</li>))}</ul></div></div></GlassCard>)}
              {phase.precautions && phase.precautions.riskLevel === 'high' && (<GlassCard className="p-5 border-red-500/30 bg-red-500/5"><div className="flex items-center gap-2 mb-3 text-red-400"><AlertTriangle size={18} /><h3 className="text-xs font-bold uppercase">Внимание</h3></div><ul className="space-y-2">{phase.precautions.warnings.map((warn, i) => (<li key={i} className="text-xs text-red-200/80 leading-relaxed list-disc list-inside">{warn}</li>))}</ul></GlassCard>)}
           </div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none"><motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} onClick={onClose} className="pointer-events-auto px-8 py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-transform">Ясно</motion.button></div>
      </motion.div>
    </motion.div>
  );
};

// ==========================================
// 🚀 MAIN DASHBOARD
// ==========================================

export const FastingDashboard: React.FC = () => {
  const { isFasting, startTime, targetHours, startFasting, stopFasting, updateStartTime, history } = useAppStore();
  const [elapsed, setElapsed] = useState(0);
  const [viewState, setViewState] = useState<'idle' | 'selecting' | 'active'>('idle');
  const [selectedPhase, setSelectedPhase] = useState<FastingPhase | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setViewState(isFasting ? 'active' : 'idle'); }, [isFasting]);
  useEffect(() => {
    let interval: any;
    if (isFasting && startTime) {
      const update = () => setElapsed(Date.now() - startTime);
      update();
      interval = setInterval(update, 1000);
    } else { setElapsed(0); }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  const currentHour = elapsed / (1000 * 60 * 60);
  const activePhaseObj = FASTING_PHASES.find(p => currentHour >= p.hoursStart && (p.hoursEnd === null || currentHour < p.hoursEnd));
  const progressPercent = Math.min((elapsed / (targetHours * 3600 * 1000)) * 100, 100);
  const currentTheme = getPhaseTheme(currentHour);
  const timeDisplay = formatTimeDetailed(elapsed);
  
  // Рассчитываем следующую фазу и время до нее
  const nextPhase = FASTING_PHASES.find(p => p.hoursStart > currentHour);
  const timeToNextPhase = nextPhase ? (nextPhase.hoursStart * 3600 * 1000) - elapsed : 0;

  useEffect(() => {
    if (viewState === 'active' && activePhaseObj) {
      setTimeout(() => {
        const el = document.getElementById(`phase-${activePhaseObj.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }, 500);
    }
  }, [viewState, activePhaseObj?.id]);

  const handleStart = (hours: number) => { haptic([50, 50]); startFasting(hours); setViewState('active'); };
  
  const updateStartNative = (timestamp: number) => { updateStartTime(timestamp); };
  const endFastNative = (timestamp: number) => { stopFasting(timestamp); setViewState('idle'); };

  if (viewState === 'idle') {
    return (
      <div className="flex flex-col h-full pt-16 px-6 pb-32 relative z-10 text-white font-sans">
        <AuroraBackground />
        <div className="mb-12 relative z-10">
           <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 mb-6 backdrop-blur-md">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">BioRhythm OS</span>
           </motion.div>
           <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-5xl font-bold leading-tight mb-4">
             Начни<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400">Свой Путь</span>
           </motion.h1>
        </div>
        <motion.button whileTap={{ scale: 0.98 }} onClick={() => setViewState('selecting')} className="relative z-10 w-full h-32 rounded-[2.5rem] bg-[#121212] border border-white/10 flex items-center justify-between px-8 group overflow-hidden active:scale-95 transition-all shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-r from-teal-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative z-10 flex flex-col items-start"><span className="text-2xl font-bold text-white">Старт</span><span className="text-sm text-gray-500">Запустить таймер</span></div>
           <div className="relative z-10 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)]"><Play size={24} fill="currentColor" className="ml-1"/></div>
        </motion.button>
        <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
           <div className="p-6 bg-[#121212]/50 rounded-[2rem] border border-white/5 backdrop-blur-md"><span className="text-3xl font-bold text-white block">{history.length}</span><span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Сессий</span></div>
           <div className="p-6 bg-[#121212]/50 rounded-[2rem] border border-white/5 backdrop-blur-md"><span className="text-3xl font-bold text-white block">{history[0]?.actualHours || 0}ч</span><span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Последняя</span></div>
        </div>
      </div>
    );
  }

  if (viewState === 'selecting') {
    return (
      <div className="flex flex-col h-full pt-12 px-6 pb-32 relative z-10 text-white">
        <AuroraBackground />
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <button onClick={() => setViewState('idle')} className="p-3 bg-white/5 rounded-full text-white hover:bg-white/10"><ChevronLeft size={20}/></button>
          <h2 className="text-2xl font-bold">Выбор цели</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 overflow-y-auto hide-scroll pb-10 relative z-10">
          {PRESETS.map((p, idx) => {
             const theme = getPhaseTheme(p.hours);
             return (
              <motion.button key={p.hours} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} onClick={() => handleStart(p.hours)} className="h-24 bg-[#121212]/80 backdrop-blur-md border border-white/10 rounded-[2rem] px-8 flex items-center justify-between active:scale-95 transition-all hover:border-white/20 group relative overflow-hidden">
                 <div className={`absolute left-0 top-0 bottom-0 w-1 ${theme.bg.replace('bg-', 'bg-')}`} style={{backgroundColor: theme.primary}}/>
                 <div className="flex flex-col items-start gap-1 relative z-10">
                    <span className="text-3xl font-bold text-white group-hover:text-teal-400 transition-colors">{p.hours}<span className="text-sm text-gray-500 ml-1">часов</span></span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.title}</span>
                 </div>
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/5 bg-white/5 ${theme.accent}`}><ArrowRight size={18}/></div>
              </motion.button>
             )
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white relative overflow-hidden font-sans bg-[#050505]">
      <AnimatedBackground theme={currentTheme} />
      
      <div className="pt-12 px-6 pb-6 flex justify-between items-end relative z-20">
         <div>
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentTheme.primary }}/>
               <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: currentTheme.primary }}>Статус</span>
            </div>
            <motion.h2 key={activePhaseObj?.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-white truncate max-w-[250px] drop-shadow-lg">{activePhaseObj?.title || "Подготовка"}</motion.h2>
         </div>
         <div className="text-right">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Прогресс</span>
            <div className="w-12 h-12 relative flex items-center justify-center">
               <CircularProgressbarWithChildren value={progressPercent} strokeWidth={10} styles={buildStyles({ pathColor: currentTheme.primary, trailColor: 'rgba(255,255,255,0.1)', strokeLinecap: 'round', pathTransitionDuration: 1 })}><span className="text-[10px] font-bold">{Math.round(progressPercent)}%</span></CircularProgressbarWithChildren>
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
         <motion.div className="flex items-baseline font-sans text-white relative" style={{ textShadow: `0 0 40px ${currentTheme.primary}50` }}>
            <span className="text-[6rem] xs:text-[7rem] font-bold tracking-tighter tabular-nums leading-none">{timeDisplay.h}</span>
            <span className="text-4xl font-light text-white/20 mx-2 pb-6">:</span>
            <span className="text-[6rem] xs:text-[7rem] font-bold tracking-tighter tabular-nums leading-none">{timeDisplay.m}</span>
         </motion.div>
         <span className="text-xl font-mono text-gray-500 mt-2 tracking-[0.5em] tabular-nums">{timeDisplay.s}</span>
         <div className="mt-8 flex gap-4"><div className="px-4 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md flex items-center gap-2"><CalendarClock size={14} className="text-gray-400"/><span className="text-xs text-gray-300 font-mono">Финиш: {getExpectedEndTime(startTime, targetHours)}</span></div></div>
      </div>

      <div className="w-full relative z-20 pb-32">
         <div className="px-6 mb-4 flex justify-between items-end opacity-80"><h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Хронология</h3></div>
         <div ref={scrollContainerRef} className="flex gap-4 overflow-x-auto hide-scroll px-6 snap-x relative pb-6">
            <div className="flex gap-6 relative min-h-[80px]">
               <BeamLine active={true} height={80} />
               <div className="w-14 h-14 rounded-2xl bg-[#121212] border border-teal-900/50 flex items-center justify-center shrink-0 z-10 relative"><Play size={20} className="text-teal-600 fill-teal-900" /></div>
               <div className="pt-2"><p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">Старт</p><p className="text-gray-400 text-xs">{startTime ? new Date(startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}</p></div>
            </div>
            {/* TIMELINE ITEMS */}
            {FASTING_PHASES.map((phase) => (
               <TimelineNode key={phase.id} phase={phase} activePhaseId={activePhaseObj?.id || 0} currentHour={currentHour} onSelect={setSelectedPhase} />
            ))}
            
            {/* NEXT UP INDICATOR (Inline in timeline) */}
            {nextPhase && (
               <div className="flex gap-6 relative min-h-[80px] opacity-60">
                  <BeamLine active={false} height={80} />
                  <div className="w-14 h-14 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-center shrink-0 z-10 relative border-dashed"><ArrowRight size={20} className="text-gray-600" /></div>
                  <div className="pt-2"><p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Далее</p><p className="text-gray-400 text-xs">Через {formatDuration(timeToNextPhase)}</p></div>
               </div>
            )}
            
            <div className="w-4 shrink-0" />
         </div>
      </div>

      <div className="fixed bottom-8 right-6 z-50 flex gap-3 items-center">
         <div className="flex flex-col gap-2">
            <NativePickerButton icon={Edit3} value={startTime || Date.now()} onChange={updateStartNative} />
            <NativePickerButton icon={CalendarClock} value={Date.now()} onChange={endFastNative} />
         </div>
         <motion.button whileTap={{ scale: 0.95 }} onClick={() => { haptic(50); stopFasting(); }} className="h-26 min-w-[80px] rounded-[2rem] bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center gap-1 p-1 overflow-hidden relative">
            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center mb-1 relative z-10"><StopCircle size={20} fill="currentColor" /></div>
            <span className="text-[10px] font-black uppercase tracking-widest relative z-10">Стоп</span>
         </motion.button>
      </div>

      <AnimatePresence>{selectedPhase && <PhaseDeepDive phase={selectedPhase} onClose={() => setSelectedPhase(null)} theme={currentTheme} />}</AnimatePresence>
    </div>
  );
};
