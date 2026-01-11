import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tab = 'fasting' | 'breathing' | 'history';

export interface FastingSession {
  id: string;
  startTime: number;
  endTime: number;
  targetHours: number;
  actualHours: number;
  rating?: number;
}

interface AppState {
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  
  // Fasting Logic
  isFasting: boolean;
  startTime: number | null;
  targetHours: number;
  history: FastingSession[];
  
  startFasting: (targetHours: number) => void;
  stopFasting: (customEndTime?: number) => void; // Обновили: можно передать свое время
  updateStartTime: (newStartTime: number) => void; // Новое: коррекция старта
  
  deleteSession: (id: string) => void;

  // Breathing Logic
  breathingLevel: number;
  setBreathingLevel: (level: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentTab: 'fasting',
      setTab: (tab) => set({ currentTab: tab }),

      // --- FASTING ---
      isFasting: false,
      startTime: null,
      targetHours: 16,
      history: [],

      startFasting: (targetHours) => set({ 
        isFasting: true, 
        startTime: Date.now(), 
        targetHours 
      }),

      updateStartTime: (newStartTime) => set({
        startTime: newStartTime
      }),

      stopFasting: (customEndTime) => {
        const { startTime, targetHours, history } = get();
        if (startTime) {
          const endTime = customEndTime || Date.now();
          const durationMs = endTime - startTime;
          // Защита от отрицательного времени
          if (durationMs < 0) return; 

          const actualHours = durationMs / (1000 * 60 * 60);
          
          const newSession: FastingSession = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            startTime,
            endTime,
            targetHours,
            actualHours: parseFloat(actualHours.toFixed(2))
          };

          set({ 
            isFasting: false, 
            startTime: null, 
            history: [newSession, ...history] 
          });
        } else {
          set({ isFasting: false, startTime: null });
        }
      },

      deleteSession: (id) => set((state) => ({
        history: state.history.filter((s) => s.id !== id)
      })),

      // --- BREATHING ---
      breathingLevel: 0,
      setBreathingLevel: (level) => set({ breathingLevel: level }),
    }),
    {
      name: 'biorhythm-storage',
    }
  )
);
