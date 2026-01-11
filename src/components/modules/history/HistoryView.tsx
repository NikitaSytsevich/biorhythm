import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, Calendar, Clock, Flame, 
  TrendingUp, Trophy, Zap, Info, ArrowUpRight, Send, Heart
} from 'lucide-react';
import { useAppStore } from '../../../store/appStore';
import { format, isSameDay, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';

// ==========================================
// 🛠 UTILITIES
// ==========================================

const getEfficiencyColor = (hours: number) => {
  if (hours < 16) return "text-gray-400 bg-gray-500/10 border-gray-500/20";
  if (hours < 20) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
  if (hours < 36) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-purple-400 bg-purple-500/10 border-purple-500/20";
};

const getIcon = (hours: number) => {
  if (hours < 16) return Clock;
  if (hours < 20) return Flame;
  if (hours < 36) return Zap;
  return Trophy;
};

// ==========================================
// 🧩 COMPONENTS
// ==========================================

const StatCard = ({ icon: Icon, label, value, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-[#1a1500] border border-amber-500/10 p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group h-32"
  >
    {/* Glow */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 blur-2xl rounded-full group-hover:bg-amber-500/10 transition-colors" />
    
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
        <Icon size={20} />
      </div>
    </div>
    
    <div className="relative z-10">
      <h3 className="text-3xl font-bold text-white tabular-nums tracking-tight">{value}</h3>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
    </div>
  </motion.div>
);

const WeeklyChart = ({ history }: { history: any[] }) => {
  const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  const maxHours = 24; 

  return (
    <div className="flex justify-between items-end h-32 px-2 gap-2 mt-2">
      {days.map((day, i) => {
        const daySessions = history.filter(s => isSameDay(new Date(s.endTime), day));
        const totalHours = daySessions.reduce((acc, s) => acc + s.actualHours, 0);
        const heightPercent = Math.min((totalHours / maxHours) * 100, 100);
        const isToday = isSameDay(day, new Date());

        return (
          <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
             <div className="w-full relative h-full flex items-end bg-white/5 rounded-t-lg overflow-hidden">
                {totalHours > 0 && (
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                    className={`w-full relative ${isToday ? 'bg-amber-500' : 'bg-amber-500/40 group-hover:bg-amber-500/60'} transition-colors`}
                  >
                    <div className="absolute top-0 w-full h-[2px] bg-white/50" />
                  </motion.div>
                )}
             </div>
             <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-white' : 'text-gray-600'}`}>
               {format(day, 'EEEEEE', { locale: ru })}
             </span>
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// 🚀 MAIN COMPONENT
// ==========================================

export const HistoryView: React.FC = () => {
  const { history, deleteSession } = useAppStore();

  const stats = useMemo(() => {
    const totalHours = history.reduce((acc, s) => acc + s.actualHours, 0);
    const totalSessions = history.length;
    return { totalHours, totalSessions };
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-[#050505] text-white font-sans overflow-hidden">
      
      <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-[#1a1500] to-transparent pointer-events-none z-0" />
      <div className="absolute top-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-amber-900/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* HEADER */}
      <div className="pt-16 px-6 pb-6 relative z-10 shrink-0">
        <div className="flex items-center justify-between mb-2">
           <h1 className="text-3xl font-bold">Хроники</h1>
           <div className="p-2 bg-amber-500/10 rounded-full text-amber-500"><Calendar size={20}/></div>
        </div>
        <p className="text-gray-500 text-sm">Ваш путь к совершенству</p>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 hide-scroll relative z-10">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-3 mb-8">
           <StatCard icon={Clock} label="Всего часов" value={stats.totalHours.toFixed(0)} delay={0.1} />
           <StatCard icon={Trophy} label="Сессий" value={stats.totalSessions} delay={0.2} />
        </div>

        {/* CHART SECTION */}
        <div className="mb-10">
           <div className="flex items-center gap-2 mb-4 opacity-70">
              <TrendingUp size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Активность (7 дней)</span>
           </div>
           <div className="h-40 p-4 rounded-[2rem] bg-[#121212] border border-white/5 shadow-inner">
              <WeeklyChart history={history} />
           </div>
        </div>

        {/* HISTORY LIST */}
        <div className="mb-8">
           <div className="flex items-center gap-2 mb-4 opacity-70">
              <ArrowUpRight size={14} className="text-amber-500" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Журнал</span>
           </div>

           {history.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-40 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-3xl">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 text-gray-600"><Info size={24} /></div>
                <p className="text-gray-500 text-sm">История пуста.</p>
                <p className="text-gray-700 text-xs mt-1">Завершите свой первый цикл.</p>
             </motion.div>
           ) : (
             <div className="space-y-3">
               <AnimatePresence>
                 {history.map((session, i) => {
                   const Icon = getIcon(session.actualHours);
                   const styleClass = getEfficiencyColor(session.actualHours);
                   
                   return (
                     <motion.div key={session.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.05 }} className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${styleClass}`}><Icon size={20} /></div>
                           <div>
                              <div className="flex items-baseline gap-2"><span className="text-lg font-bold text-white tabular-nums">{session.actualHours}</span><span className="text-xs text-gray-500">часов</span></div>
                              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">{format(session.endTime, 'd MMMM, HH:mm', { locale: ru })}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-mono text-gray-500">{Math.round((session.actualHours / session.targetHours) * 100)}%</div>
                           <button onClick={() => deleteSession(session.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                        </div>
                     </motion.div>
                   );
                 })}
               </AnimatePresence>
             </div>
           )}
        </div>

        {/* --- TEAM CREDITS (FOOTER) --- */}
        <div className="pt-8 pb-4 border-t border-white/5 mt-8">
           <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4 text-center">Команда проекта</p>
           
           <div className="flex gap-3 overflow-x-auto hide-scroll px-2 pb-4 snap-x justify-center">
              
              {/* Creator */}
              <a href="https://t.me/nikita_sytsevich" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 snap-center">
                 <div className="bg-[#121212] border border-white/10 p-3 rounded-2xl w-40 hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-2 group-hover:scale-110 transition-transform"><Zap size={14}/></div>
                    <p className="text-xs font-bold text-white">Никита Сыцевич</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Создатель & Dev</p>
                 </div>
              </a>

              {/* Inspiration */}
              <a href="https://t.me/inntheeairr" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 snap-center">
                 <div className="bg-[#121212] border border-white/10 p-3 rounded-2xl w-40 hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-2 group-hover:scale-110 transition-transform"><Send size={14}/></div>
                    <p className="text-xs font-bold text-white">Александр Якимчик</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Идейный вдохновитель</p>
                 </div>
              </a>

              {/* Support */}
              <a href="https://t.me/bubnovzavaliebalo" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 snap-center">
                 <div className="bg-[#121212] border border-white/10 p-3 rounded-2xl w-40 hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mb-2 group-hover:scale-110 transition-transform"><Heart size={14}/></div>
                    <p className="text-xs font-bold text-white">Кирилл Бубнов</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Моральная опора</p>
                 </div>
              </a>

           </div>
        </div>

      </div>
    </div>
  );
};
