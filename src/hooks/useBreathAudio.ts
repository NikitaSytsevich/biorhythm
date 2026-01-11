import { useRef, useCallback } from 'react';

export const useBreathAudio = () => {
  const audioContext = useRef<AudioContext | null>(null);
  const masterGain = useRef<GainNode | null>(null);

  const initAudio = useCallback(() => {
    if (!audioContext.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext.current = new AudioCtx();
      
      masterGain.current = audioContext.current.createGain();
      masterGain.current.gain.value = 1.0; 
      masterGain.current.connect(audioContext.current.destination);
    }
    
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  }, []);

  const triggerBell = (frequency: number, intensity: 'soft' | 'bright' | 'deep') => {
    if (!audioContext.current || !masterGain.current) return;
    const ctx = audioContext.current;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = frequency;

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * (intensity === 'deep' ? 2.0 : 2.4); 

    const volume = intensity === 'soft' ? 0.1 : (intensity === 'deep' ? 0.3 : 0.2);
    const duration = intensity === 'deep' ? 6 : 4;

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * 0.5, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + (duration / 2));

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterGain.current);
    gain2.connect(masterGain.current);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + duration + 1);
    osc2.stop(now + duration + 1);
  };

  // Исправление: _duration вместо duration, чтобы линтер не ругался
  const playTone = useCallback((_duration: number, type: 'inhale' | 'exhale' | 'hold') => {
    if (!audioContext.current) initAudio();
    
    if (type === 'inhale') {
      triggerBell(659.25, 'bright');
    } else if (type === 'hold') {
      triggerBell(220.00, 'deep');
    } else if (type === 'exhale') {
      triggerBell(329.63, 'soft');
    }
  }, [initAudio]);

  const stopAudio = useCallback(() => {
    if (audioContext.current && masterGain.current) {
      const now = audioContext.current.currentTime;
      masterGain.current.gain.cancelScheduledValues(now);
      masterGain.current.gain.setValueAtTime(masterGain.current.gain.value, now);
      masterGain.current.gain.linearRampToValueAtTime(0, now + 0.1);
      
      setTimeout(() => {
        if (masterGain.current) masterGain.current.gain.value = 1.0;
      }, 200);
    }
  }, []);

  return { playTone, stopAudio, initAudio };
};
