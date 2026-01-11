import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wind, Play, Pause, X, Info, 
  Brain, Zap, BookOpen, Activity 
} from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { useBreathAudio } from '../../../hooks/useBreathAudio';

// ==========================================
// 🧘‍♂️ DATA & CONFIG
// ==========================================

const LEVELS = [
  { id: 0, inhale: 4, hold: 16, exhale: 8, label: "Новичок" },
  { id: 1, inhale: 5, hold: 20, exhale: 10, label: "База" },
  { id: 2, inhale: 6, hold: 24, exhale: 12, label: "Ученик" },
  { id: 3, inhale: 7, hold: 28, exhale: 14, label: "Практик" },
  { id: 4, inhale: 8, hold: 32, exhale: 16, label: "Продвинутый" },
  { id: 5, inhale: 9, hold: 36, exhale: 18, label: "Адепт" },
  { id: 6, inhale: 10, hold: 40, exhale: 20, label: "Мастер" },
  { id: 7, inhale: 12, hold: 48, exhale: 24, label: "Йог" },
  { id: 8, inhale: 13, hold: 52, exhale: 26, label: "Гуру" },
  { id: 9, inhale: 15, hold: 60, exhale: 30, label: "Мудрец" },
  { id: 10, inhale: 20, hold: 80, exhale: 40, label: "Титан" },
  { id: 11, inhale: 24, hold: 96, exhale: 48, label: "Абсолют" },
  { id: 12, inhale: 36, hold: 144, exhale: 72, label: "Зенит" },
];

const GUIDE_TEXT = [
  {
    title: "Подготовка",
    icon: Wind,
    text: "Для практики ноздри должны быть чистыми. Так же чистым должен быть желудок. Не занимайтесь, если вы простужены и не можете свободно дышать через нос."
  },
  {
    title: "Эффект",
    icon: Zap,
    text: "Практика очищает и тонизирует нервную систему. Наверное, ни одна другая техника не может так быстро привести состояние сознания и ума от беспокойства к умиротворению."
  },
  {
    title: "Глубина",
    icon: Brain,
    text: "Конечно, мощный успокоительный эффект практики это хороший плюс. Но регулярное выполнение практики воздействует на сознание и энергетическую структуру человека гораздо глубже."
  },
  {
    title: "Механика",
    icon: Activity,
    text: "Техника дыхания относится к гиповентиляционным техникам. То есть во время выполнения объём воздуха, проходящий через лёгкие уменьшается."
  }
];

const haptic = (pattern: number | number[] = 20) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// ==========================================
// 🎨 COMPONENTS
// ==========================================

const AuroraViolet = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#050505] z-0">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05]" />
    <motion.div animate={{ x: [0, 100, -50, 0], y: [0, -50, 100, 0], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-900/30 rounded-full blur-[120px]" />
    <motion.div animate={{ x: [0, -100, 50, 0], y: [0, 50, -100, 0], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-20%] right-[-20%] w-[90vw] h-[90vw] bg-fuchsia-900/20 rounded-full blur-[120px]" />
  </div>
);

const GuideModal = ({ onClose }: { onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-xl p-0 sm:p-6">
    <div className="absolute inset-0" onClick={onClose} />
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full max-w-lg h-[90vh] bg-[#0A0A0A] rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
      <div className="p-8 pb-4 shrink-0 bg-gradient-to-b from-purple-900/20 to-transparent">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2"><BookOpen className="text-purple-400"/> Руководство</h2>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10"><X size={20}/></button>
         </div>
         <p className="text-sm text-gray-400">Основы гиповентиляционной практики</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-10 hide-scroll">
         <div className="space-y-6">
            {GUIDE_TEXT.map((section, idx) => (
               <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-3 text-purple-400"><section.icon size={20} /><h3 className="font-bold uppercase tracking-wider text-xs">{section.title}</h3></div>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{section.text}</p>
               </div>
            ))}
         </div>
      </div>
      <div className="p-6 border-t border-white/5 bg-[#0A0A0A]"><button onClick={onClose} className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-purple-900/20">Ясно</button></div>
    </motion.div>
  </motion.div>
);

// ==========================================
// 🌸 MAIN COMPONENT
// ==========================================

export const PranayamaLotus: React.FC = () => {
  const { breathingLevel, setBreathingLevel } = useAppStore();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  
  const { playTone, stopAudio, initAudio } = useBreathAudio();
  const pattern = LEVELS[breathingLevel];

  // Logic Loop
  useEffect(() => {
    if (!isActive) {
      setPhase('idle');
      setTimeLeft(0);
      stopAudio();
      return;
    }

    let timeout: any;
    let timerInterval: any;

    const runCycle = async () => {
      // INHALE
      setPhase('inhale'); setTimeLeft(pattern.inhale); playTone(pattern.inhale, 'inhale');
      await new Promise(r => timeout = setTimeout(r, pattern.inhale * 1000));
      if (!isActive) return;

      // HOLD
      setPhase('hold'); setTimeLeft(pattern.hold); playTone(pattern.hold, 'hold'); haptic(50);
      await new Promise(r => timeout = setTimeout(r, pattern.hold * 1000));
      if (!isActive) return;

      // EXHALE
      setPhase('exhale'); setTimeLeft(pattern.exhale); playTone(pattern.exhale, 'exhale'); haptic(50);
      await new Promise(r => timeout = setTimeout(r, pattern.exhale * 1000));
      if (isActive) runCycle();
    };

    runCycle();
    timerInterval = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000);
    return () => { clearTimeout(timeout); clearInterval(timerInterval); stopAudio(); };
  }, [isActive, pattern]); // eslint-disable-line

  const handleToggle = () => { initAudio(); haptic(50); setIsActive(!isActive); };

  // --- VISUAL LOGIC ---
  const getOrbColor = () => {
    switch(phase) {
      case 'inhale': return 'bg-cyan-200 shadow-[0_0_50px_rgba(165,243,252,0.6)]';
      case 'hold': return 'bg-fuchsia-300 shadow-[0_0_60px_rgba(240,171,252,0.8)]';
      case 'exhale': return 'bg-purple-900 shadow-[0_0_30px_rgba(88,28,135,0.4)]';
      default: return 'bg-white/10 shadow-none';
    }
  };

  const getPhaseText = () => {
    if (!isActive) return "Прана";
    if (phase === 'inhale') return "Вдох";
    if (phase === 'hold') return "Задержка";
    if (phase === 'exhale') return "Выдох";
    return "";
  };

  const lotusVariants: any = { // Используем any чтобы TS не ругался на типы
    idle: { scale: 1, rotate: 0, opacity: 0.3 },
    inhale: { scale: 2.8, rotate: 45, opacity: 0.8, transition: { duration: pattern.inhale, ease: "easeInOut" } },
    hold: { scale: 3.0, rotate: 50, opacity: 1, transition: { duration: pattern.hold, ease: "linear" } },
    exhale: { scale: 1, rotate: 0, opacity: 0.3, transition: { duration: pattern.exhale, ease: "easeInOut" } }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white font-sans relative overflow-hidden">
      <AuroraViolet />

      {/* HEADER */}
      <div className="pt-12 px-6 flex justify-between items-start z-20">
         <div>
            <div className="flex items-center gap-2 mb-1 opacity-70"><Wind size={14} className="text-purple-400" /><span className="text-[10px] font-bold uppercase tracking-widest">Дыхание</span></div>
            <h1 className="text-3xl font-bold text-white">Пранаяма</h1>
         </div>
         <button onClick={() => setShowGuide(true)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Info size={20} className="text-purple-300" /></button>
      </div>

      {/* MAIN VISUAL (LOTUS) */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
         <div className="relative flex items-center justify-center w-80 h-80">
            {[0, 60, 120].map((deg) => (
               <motion.div key={deg} variants={lotusVariants} animate={phase} className="absolute w-40 h-40 border border-purple-400/20 rounded-[40%] bg-purple-500/5 blur-sm" style={{ rotate: deg }} />
            ))}
            <motion.div
               animate={{ scale: phase === 'inhale' ? 1.5 : (phase === 'hold' ? 1.4 : 1), opacity: isActive ? 1 : 0.5 }}
               transition={{ duration: phase === 'inhale' ? pattern.inhale : (phase === 'exhale' ? pattern.exhale : 0.5) }}
               className={`w-32 h-32 rounded-full backdrop-blur-md transition-colors duration-1000 flex items-center justify-center z-20 ${getOrbColor()}`}
            >
               <AnimatePresence mode="wait">
                  {isActive ? (
                     <motion.div key={timeLeft} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.5 }} className={`text-6xl font-thin font-mono tabular-nums tracking-tighter ${phase === 'inhale' ? 'text-black' : 'text-white'}`}>
                        {Math.ceil(timeLeft)}
                     </motion.div>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  )}
               </AnimatePresence>
            </motion.div>
         </div>
         <div className="h-8 mt-8">
            <AnimatePresence mode="wait">
               {isActive && (
                  <motion.span key={phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-xs font-bold uppercase tracking-[0.3em] text-purple-300/70">
                     {getPhaseText()}
                  </motion.span>
               )}
            </AnimatePresence>
         </div>
      </div>

      {/* LEVEL SELECTOR */}
      <div className="relative z-20 pb-32">
         <div className="px-6 mb-4 flex justify-between items-end">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Сложность</h3>
            <span className="text-xs text-purple-400 font-bold">{LEVELS[breathingLevel].label}</span>
         </div>
         <div className="flex gap-3 overflow-x-auto hide-scroll px-6 snap-x pb-6">
            {LEVELS.map((lvl) => {
               const isSelected = breathingLevel === lvl.id;
               return (
                  <button key={lvl.id} disabled={isActive} onClick={() => setBreathingLevel(lvl.id)} className={`flex-shrink-0 w-32 p-4 rounded-2xl border transition-all snap-center text-left relative overflow-hidden ${isSelected ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-[#121212] border-white/5 opacity-60 hover:opacity-100'} ${isActive ? 'opacity-30 cursor-not-allowed' : ''}`}>
                     <div className="flex justify-between items-start mb-3"><span className={`text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}>{lvl.id}</span>{isSelected && <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />}</div>
                     <div className="space-y-1 text-[10px] font-mono text-gray-400">
                        <div className="flex justify-between"><span>Вдох</span><span className="text-white">{lvl.inhale}с</span></div>
                        <div className="flex justify-between"><span>Пауза</span><span className="text-purple-300 font-bold">{lvl.hold}с</span></div>
                        <div className="flex justify-between"><span>Выдох</span><span className="text-white">{lvl.exhale}с</span></div>
                     </div>
                  </button>
               )
            })}
            <div className="w-4 shrink-0" />
         </div>
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-6 z-50">
         <motion.button whileTap={{ scale: 0.95 }} onClick={handleToggle} className={`h-16 px-8 rounded-full flex items-center gap-3 font-bold uppercase tracking-widest shadow-2xl transition-all ${isActive ? 'bg-[#1a1a1a] text-purple-400 border border-purple-500/30' : 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}>
            {isActive ? <><Pause size={20} fill="currentColor" /> Стоп</> : <><Play size={20} fill="currentColor" /> Старт</>}
         </motion.button>
      </div>

      <AnimatePresence>{showGuide && <GuideModal onClose={() => setShowGuide(false)} />}</AnimatePresence>
    </div>
  );
};
