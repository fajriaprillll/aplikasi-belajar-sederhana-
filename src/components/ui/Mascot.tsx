'use client';

import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none select-none">
      {/* Balon Ucapan */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className="mb-4 mr-2 bg-white px-6 py-3 rounded-2xl rounded-br-none shadow-xl border-2 border-indigo-100 max-w-[200px] text-center"
        >
          <p className="text-slate-700 font-bold text-sm md:text-base leading-snug">
            {message}
          </p>
          {/* Segitiga Balon */}
          <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r-2 border-b-2 border-indigo-100 rotate-45" />
        </motion.div>
      </AnimatePresence>

      {/* Karakter Biam */}
      <motion.div
        animate={mood === 'happy' ? {
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        } : mood === 'thinking' ? {
          rotate: [0, -10, 10, 0],
        } : {
          y: [0, -5, 0],
        }}
        transition={{
          duration: mood === 'happy' ? 0.5 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center text-4xl md:text-6xl border-4 border-white overflow-hidden relative"
      >
        {/* Kilauan / Glossy Effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20" />
        
        <motion.span
          key={mood}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          {EMOJIS[mood]}
        </motion.span>
      </motion.div>
    </div>
  );
}
