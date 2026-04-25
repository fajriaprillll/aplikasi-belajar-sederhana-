'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Screen = "HOME" | "GRADE_SELECT" | "MODE_SELECT" | "SUBJECT_SELECT" | "QUIZ" | "RESULT" | "REVIEW";
type AnswerStatus = "idle" | "correct" | "wrong";
type EveMood = 'idle' | 'happy' | 'sad' | 'thinking';

interface EveContextType {
  screen: Screen;
  answerStatus: AnswerStatus;
  message: string;
  mood: EveMood;
  setScreen: (screen: Screen) => void;
  setAnswerStatus: (status: AnswerStatus) => void;
  setEveState: (message: string, mood?: EveMood) => void;
}

const EveContext = createContext<EveContextType | undefined>(undefined);

export function EveProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("HOME");
  const [answerStatus, setAnswerStatus] = useState<AnswerStatus>("idle");
  const [message, setMessage] = useState("Halo! Ayo kita belajar bareng yuk! 🚀");
  const [mood, setMood] = useState<EveMood>('idle');

  // Auto-messages based on screen changes
  useEffect(() => {
    if (answerStatus !== 'idle') return; // Don't override answer feedback

    switch (screen) {
      case "HOME":
        setMessage("Halo! Sudah siap jadi juara hari ini? ✨");
        setMood('idle');
        break;
      case "GRADE_SELECT":
        setMessage("Pilih kelasmu dulu ya! 🎓");
        setMood('thinking');
        break;
      case "MODE_SELECT":
        setMessage("Mau latihan santai atau langsung ujian? 🏆");
        setMood('thinking');
        break;
      case "SUBJECT_SELECT":
        setMessage("Pilih mata pelajaran yang kamu suka! 📚");
        setMood('thinking');
        break;
      case "QUIZ":
        setMessage("Fokus ya, aku yakin kamu bisa jawab semuanya! 💪");
        setMood('idle');
        break;
      case "RESULT":
        setMessage("Wuih! Hasil yang luar biasa! Bangga deh! 🌟");
        setMood('happy');
        break;
      case "REVIEW":
        setMessage("Yuk kita pelajari lagi jawaban yang tadi! 📖");
        setMood('thinking');
        break;
    }
  }, [screen, answerStatus]);

  const setEveState = (msg: string, newMood: EveMood = 'idle') => {
    setMessage(msg);
    setMood(newMood);
  };

  return (
    <EveContext.Provider value={{ 
      screen, 
      answerStatus, 
      message, 
      mood, 
      setScreen, 
      setAnswerStatus, 
      setEveState 
    }}>
      {children}
    </EveContext.Provider>
  );
}

export function useEve() {
  const context = useContext(EveContext);
  if (context === undefined) {
    throw new Error('useEve must be used within an EveProvider');
  }
  return context;
}
