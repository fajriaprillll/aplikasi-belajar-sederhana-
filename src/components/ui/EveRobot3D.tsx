'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Float, Stage } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';
import * as THREE from 'three';
import { useEve } from '@/context/EveContext';

/**
 * EveRobot3D - CONTEXT-CONNECTED VERSION
 * Fully aware of app state via EveContext.
 */

// Silence warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('THREE.Clock')) return;
    originalWarn(...args);
  };
}

function Model({ mood, isClicked, isHovered }: { mood: string, isClicked: boolean, isHovered: boolean }) {
  const { scene } = useGLTF('/models/eve.glb');
  const modelRef = useRef<THREE.Group>(null!);
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!modelRef.current) return;
    time.current += delta;

    let targetRotX = 0;
    let targetRotZ = 0;
    let targetPosY = 0;
    
    // Mood physics
    if (mood === 'happy') {
      targetPosY = Math.sin(time.current * 10) * 0.15;
      targetRotZ = Math.sin(time.current * 5) * 0.1;
    }
    if (mood === 'sad') {
      targetRotX = 0.4; // Looking down
    }
    if (mood === 'thinking') {
      targetRotZ = Math.sin(time.current * 3) * 0.15;
    }

    // Smooth movement
    modelRef.current.rotation.x = THREE.MathUtils.lerp(modelRef.current.rotation.x, targetRotX + (isClicked ? 0.3 : 0), 0.1);
    modelRef.current.rotation.z = THREE.MathUtils.lerp(modelRef.current.rotation.z, targetRotZ, 0.1);
    modelRef.current.rotation.y = Math.sin(time.current * 0.8) * 0.05 + (state.mouse.x * 0.4);
    modelRef.current.position.y = Math.sin(time.current * 1.5) * 0.05 + targetPosY + (isClicked ? 0.5 : 0);
  });

  return <primitive ref={modelRef} object={scene} />;
}

export default function EveRobot3D({ onClick }: { onClick?: () => void }) {
  const { message, mood, setEveState } = useEve();
  const [isMounted, setIsMounted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show bubble whenever message changes
  useEffect(() => {
    if (message) {
      setShowBubble(true);
      // Dynamic duration: minimum 2.5 seconds, or 60ms per character
      const duration = Math.max(2500, message.length * 60);
      const timer = setTimeout(() => setShowBubble(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleClick = () => {
    setIsClicked(true);
    setShowBubble(true);
    setTimeout(() => setIsClicked(false), 500);
    if (onClick) onClick();
  };

  if (!isMounted) return null;

  return (
    <div className="fixed bottom-0 right-0 md:bottom-1 md:right-1 z-[100] flex flex-col items-end select-none pointer-events-none">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="mb-1 mr-12 bg-white/30 backdrop-blur-2xl text-slate-900 px-6 py-4 rounded-[32px] rounded-br-none shadow-2xl border border-white/50 max-w-[200px] md:max-w-[280px] relative pointer-events-auto"
          >
            <p className="text-sm md:text-base font-bold text-center leading-relaxed text-slate-800">
              {message}
            </p>
            <div className="absolute -bottom-2 right-0 w-6 h-6 bg-white/30 backdrop-blur-2xl shadow-lg" 
                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick} 
        className="w-[140px] h-[180px] md:w-[200px] md:h-[280px] cursor-pointer pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}>
          <Suspense fallback={null}>
            <Stage intensity={0.8} environment="city" adjustCamera={true} shadows={false}>
              <Float speed={2.5} rotationIntensity={0.2} floatIntensity={1.2}>
                <Model mood={mood} isClicked={isClicked} isHovered={isHovered} />
              </Float>
            </Stage>
          </Suspense>
        </Canvas>
      </motion.div>
    </div>
  );
}

useGLTF.preload('/models/eve.glb');
