'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';

interface MascotProps {
  mood: 'idle' | 'happy' | 'sad' | 'thinking';
  message: string;
}

const EMOJIS = {
  idle: '😊',
  happy: '🤩',
  sad: '🥺',
  thinking: '🤔'
};

export default function Mascot({ mood, message }: MascotProps) {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] flex flex-col items-end pointer-events-none select-none">
      {/* Speech Bubble */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.5, y: 30, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20, x: 10 }}
          className="mb-3 md:mb-6 mr-2 md:mr-4 bg-slate-900 text-white px-5 md:px-8 py-3 md:py-5 rounded-[1.5rem] md:rounded-[2.5rem] rounded-br-none shadow-2xl relative max-w-[180px] md:max-w-[240px] border border-white/10"
        >
          <div className="absolute top-0 right-0 p-1 md:p-2 opacity-20">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          </div>
          <p className="text-xs md:text-base font-bold leading-relaxed tracking-tight">
            {message}
          </p>
          {/* Bubble Tail */}
          <div className="absolute -bottom-2 right-0 w-6 h-6 md:w-8 md:h-8 bg-slate-900 rotate-12" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
        </motion.div>
      </AnimatePresence>

      {/* Robot Character */}
      <motion.div
        animate={mood === 'happy' ? {
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        } : mood === 'thinking' ? {
          rotate: [0, -10, 10, -10, 0],
        } : {
          y: [0, -5, 0],
        }}
        transition={{
          duration: mood === 'happy' ? 0.4 : 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="group relative"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-primary/20 blur-xl md:blur-2xl rounded-full scale-125 md:scale-150 animate-pulse" />
        
        <div className="w-16 h-16 md:w-32 md:h-32 bg-gradient-to-br from-slate-800 to-slate-950 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center border-2 md:border-4 border-white/10 overflow-hidden relative">
          {/* Scanning Line */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-0.5 md:h-1 bg-primary/30 blur-sm z-10" 
          />
          
          <div className="flex flex-col items-center gap-0.5 md:gap-1 z-20">
            <Bot size={mood === 'happy' ? 32 : 24} className="text-primary mb-0.5 md:mb-1 transition-all md:w-12 md:h-12" />
            <motion.span
              key={mood}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="text-xl md:text-4xl"
            >
              {EMOJIS[mood]}
            </motion.span>
          </div>
        </div>
        
        {/* Antenna */}
        <motion.div 
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 md:-top-4 left-1/2 -translate-x-1/2 w-0.5 md:w-1 h-3 md:h-6 bg-slate-700 rounded-full"
        >
          <div className="absolute -top-0.5 -left-0.5 md:-top-1 md:-left-1 w-1.5 md:h-3 md:w-3 h-1.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
        </motion.div>
      </motion.div>
    </div>
  );
}
