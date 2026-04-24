'use client';

import { motion } from 'framer-motion';

export default function BackgroundShapes() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary Blob */}
      <motion.div
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -60, 60, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-300/30 rounded-full blur-[100px]"
      />
      
      {/* Secondary Blob */}
      <motion.div
        animate={{
          x: [0, -50, 50, 0],
          y: [0, 80, -80, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-300/30 rounded-full blur-[100px]"
      />

      {/* Tertiary Blob */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, 40, -40, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-24 left-1/4 w-[500px] h-[500px] bg-pink-200/20 rounded-full blur-[120px]"
      />
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
    </div>
  );
}
