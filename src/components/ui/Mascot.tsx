import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface MascotProps {
  mood: 'idle' | 'happy' | 'sad' | 'thinking';
  message: string;
  onClick?: () => void;
}

export default function Mascot({ mood, message, onClick }: MascotProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleClick = () => {
    if (isScanning) return;
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1500);
    if (onClick) onClick();
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-[100] flex flex-col items-end select-none perspective-[1000px]">
      {/* Speech Bubble - Minimalist & Sleek */}
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="mb-4 md:mb-6 mr-2 bg-slate-900/90 backdrop-blur-md text-white px-5 md:px-6 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] rounded-br-none shadow-xl relative max-w-[160px] md:max-w-[220px] border border-white/10 pointer-events-none"
        >
          <p className="text-xs md:text-sm font-medium leading-relaxed text-center">
            {message}
          </p>
          <div className="absolute -bottom-1.5 right-0 w-4 h-4 bg-slate-900/90 rotate-12" 
               style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
        </motion.div>
      </AnimatePresence>

      {/* EVE Character - Smooth & Elegant */}
      <motion.div
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className="relative cursor-pointer pointer-events-auto flex flex-col items-center preserve-3d"
      >
        {/* Floating Head */}
        <motion.div
          animate={{
            y: mood === 'happy' ? [0, -5, 0] : [0, -3, 0],
            rotateZ: mood === 'happy' ? [0, 10, -10, 0] : isScanning ? [0, 5, -5, 0] : 0,
            rotateX: mood === 'sad' ? 20 : 0
          }}
          transition={{ 
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: mood === 'happy' ? 0.3 : 2, repeat: mood === 'happy' ? 2 : 0 }
          }}
          className="w-10 h-7 md:w-16 md:h-11 bg-white rounded-[50%] shadow-lg border border-slate-100 relative overflow-hidden flex items-center justify-center mb-1 z-30 preserve-3d"
        >
          {/* Black Face Screen */}
          <div className="w-[85%] h-[80%] bg-[#0a0a0a] rounded-[42%] flex items-center justify-center gap-1.5 md:gap-3 relative shadow-inner overflow-hidden">
             {/* Subtle Scan Line */}
             {isScanning && (
               <motion.div 
                 initial={{ top: '-100%' }}
                 animate={{ top: '100%' }}
                 transition={{ duration: 1, ease: "linear" }}
                 className="absolute inset-x-0 h-1 bg-cyan-400/40 blur-[1px] z-10"
               />
             )}

            {/* Glowing Eyes - Change shape based on mood */}
            <motion.div 
              animate={mood === 'happy' ? {
                scaleY: [1, 0.5, 1],
                height: [4, 3, 4],
                borderRadius: "50% 50% 10% 10%" // Smiling eyes
              } : mood === 'sad' ? {
                scaleY: 0.5,
                y: 2
              } : {
                scaleY: [1, 0.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              className="w-1.5 h-1.5 md:w-3.5 md:h-3.5 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]" 
            />
            <motion.div 
              animate={mood === 'happy' ? {
                scaleY: [1, 0.5, 1],
                height: [4, 3, 4],
                borderRadius: "50% 50% 10% 10%" // Smiling eyes
              } : mood === 'sad' ? {
                scaleY: 0.5,
                y: 2
              } : {
                scaleY: [1, 0.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
              className="w-1.5 h-1.5 md:w-3.5 md:h-3.5 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee]" 
            />
          </div>
          {/* Top Shine */}
          <div className="absolute top-0.5 left-1/4 w-1/2 h-1 bg-white/30 rounded-full blur-[1px]" />
        </motion.div>

        {/* Sleek Body */}
        <motion.div
          animate={{
            y: mood === 'happy' ? [0, -10, 0] : [0, -6, 0],
            rotateZ: mood === 'happy' ? [0, 2, -2, 0] : 0,
            scale: mood === 'sad' ? 0.95 : 1
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-16 md:w-20 md:h-28 bg-gradient-to-b from-white to-slate-50 rounded-[50%_50%_45%_45%] shadow-[inset_-4px_-8px_16px_rgba(0,0,0,0.05),0_15px_30px_rgba(0,0,0,0.1)] border border-slate-100 relative z-20 preserve-3d"
        >
          {/* Arms - More subtle */}
          <motion.div 
            animate={mood === 'happy' ? { rotateZ: [-20, -40, -20] } : { rotateZ: [-5, 5, -5] }}
            className="absolute -left-1 top-4 w-2 h-8 md:w-3 md:h-14 bg-white rounded-full border border-slate-50 origin-top shadow-sm" 
          />
          <motion.div 
            animate={mood === 'happy' ? { rotateZ: [20, 40, 20] } : { rotateZ: [5, -5, 5] }}
            className="absolute -right-1 top-4 w-2 h-8 md:w-3 md:h-14 bg-white rounded-full border border-slate-100 origin-top shadow-sm" 
          />
          
          {/* Center Light */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-100/30 rounded-full blur-[1px]" />
        </motion.div>

        {/* Shadow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-10 h-2 md:w-16 md:h-3 bg-slate-900/10 rounded-[50%] blur-md mt-3" 
        />
      </motion.div>
    </div>
  );
}
