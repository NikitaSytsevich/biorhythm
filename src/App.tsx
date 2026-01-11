import { useState } from 'react';
import { useAppStore } from './store/appStore';
import { FastingDashboard } from './components/modules/fasting/FastingDashboard';
import { PranayamaLotus } from './components/modules/breathing/PranayamaLotus';
import { HistoryView } from './components/modules/history/HistoryView';
import { Clock, Wind, BarChart3, Sprout, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { currentTab, setTab } = useAppStore();
  const [showCredits, setShowCredits] = useState(false);

  const tabs = [
    { id: 'fasting', icon: Clock, color: 'text-teal-400', bg: 'bg-teal-500/20' },
    { id: 'breathing', icon: Wind, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { id: 'history', icon: BarChart3, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'fasting': return <FastingDashboard />;
      case 'breathing': return <PranayamaLotus />;
      case 'history': return <HistoryView />;
      default: return null;
    }
  };

  return (
    <div className="h-[100dvh] w-full relative bg-[#050505] font-sans overflow-hidden">
      
      {/* Main Content Layer */}
      <main className="h-full w-full relative z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- ASYMMETRIC NAVIGATION DOCK (LEFT) --- */}
      <div className="fixed bottom-8 left-6 z-50">
        <div className="p-1.5 flex items-center bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { if (navigator.vibrate) navigator.vibrate(30); setTab(tab.id as any); }}
                className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-bubble"
                    className={`absolute inset-0 rounded-full ${tab.bg} border border-white/5`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`relative z-10 transition-colors duration-300 ${isActive ? tab.color : 'text-gray-500 hover:text-white'}`}
                />
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Credits Trigger */}
      <button onClick={() => setShowCredits(true)} className="fixed top-6 right-6 z-40 p-2 text-white/10 hover:text-white/50 transition-colors"><Sparkles size={16}/></button>

      {/* Credits Overlay */}
      <AnimatePresence>
        {showCredits && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCredits(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="p-8 bg-[#121212] border border-white/10 rounded-3xl text-center">
              <Sprout size={32} className="mx-auto text-teal-400 mb-4" />
              <h2 className="text-xl font-bold text-white">Zenith OS</h2>
              <p className="text-gray-500 text-sm">v 2.1 • Asymmetric</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
