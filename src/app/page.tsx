"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  ArrowLeft, 
  RefreshCcw, 
  Home as HomeIcon,
  CheckCircle2,
  XCircle,
  Calculator,
  Type,
  Flag,
  Leaf,
  Map,
  Globe,
  Heart,
  Star,
  Award,
  Zap,
  Send,
  Timer as TimerIcon,
  Eye,
  History,
  Medal,
  Play,
  Sparkles,
  Target
} from "lucide-react";
import { quizData, Question } from "@/data/questions";
import { playUISound } from "@/lib/uiSounds";
import Mascot from "@/components/ui/Mascot";

// --- Types ---
type Screen = "HOME" | "GRADE_SELECT" | "SUBJECT_SELECT" | "QUIZ" | "RESULT" | "REVIEW";

interface QuizHistory {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: string;
}

const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {[...Array(60)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 md:w-3 md:h-3 rounded-sm"
        initial={{ 
          top: "-5%", 
          left: `${Math.random() * 100}%`,
          backgroundColor: ["#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#a855f7"][Math.floor(Math.random() * 5)]
        }}
        animate={{ 
          top: "105%",
          left: `${Math.random() * 100}%`,
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          duration: 3 + Math.random() * 3, 
          repeat: Infinity, 
          ease: "linear",
          delay: Math.random() * 2
        }}
      />
    ))}
  </div>
);

const ScoreCircle = ({ score, maxScore }: { score: number, maxScore: number }) => {
  const percentage = (score / maxScore) * 100;
  const radius = 65; // Slightly smaller for mobile
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-40 h-40 md:w-56 md:h-56">
      <svg className="w-full h-full transform -rotate-90">
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200/50" />
        <motion.circle
          cx="50%" cy="50%" r={radius} stroke="url(#scoreGradient)" strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "circOut", delay: 0.5 }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span 
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", bounce: 0.5 }}
          className="text-4xl md:text-6xl font-black text-slate-900"
        >
          {score}
        </motion.span>
        <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-slate-400">Total Poin</span>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>("HOME");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"CORRECT" | "WRONG" | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [essayAnswer, setEssayAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mascot State
  const [mascotMood, setMascotMood] = useState<'idle' | 'happy' | 'sad' | 'thinking'>('idle');
  const [mascotMessage, setMascotMessage] = useState<string>('Halo! Ayo belajar bersama robot!');

  useEffect(() => {
    const saved = localStorage.getItem("last_quiz_score");
    if (saved) setLastScore(parseInt(saved));
  }, []);

  // Timer Logic
  useEffect(() => {
    if (screen === "QUIZ" && !isAnswering) {
      if (timeLeft > 0) {
        timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      } else {
        processAnswer("TIDAK ADA JAWABAN (WAKTU HABIS)");
      }
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [timeLeft, screen, isAnswering]);

  const resetGame = () => {
    setScreen("HOME");
    setSelectedGrade("");
    setSelectedSubject("");
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setFeedback(null);
    setIsAnswering(false);
    setSelectedOption(null);
    setEssayAnswer("");
    setQuizHistory([]);
    setMascotMood('idle');
    setMascotMessage('Halo! Ayo belajar bersama robot!');
  };

  const startQuiz = (grade: string, subject: string) => {
    setSelectedGrade(grade);
    setSelectedSubject(subject);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setScreen("QUIZ");
    setEssayAnswer("");
    setQuizHistory([]);
    setTimeLeft(30);
    setMascotMood('idle');
    setMascotMessage('Semangat ya mengerjakannya!');
  };

  const processAnswer = (userAnswer: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAnswering(true);
    setSelectedOption(userAnswer);

    const questions = quizData[selectedGrade]?.[selectedSubject] || [];
    const currentQ = questions[currentQuestionIndex];
    
    const isCorrect = currentQ.type === 'multiple-choice' 
      ? userAnswer === currentQ.answer 
      : userAnswer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim();

    // Store history
    setQuizHistory(prev => [...prev, {
      question: currentQ.question,
      userAnswer: userAnswer,
      correctAnswer: currentQ.answer,
      isCorrect,
      type: currentQ.type
    }]);

    if (isCorrect) {
      playUISound('success');
      setMascotMood('happy');
      setMascotMessage('Wih, jawabanmu BENAR!');
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setFeedback("CORRECT");
    } else {
      playUISound('wrong');
      setMascotMood('sad');
      setMascotMessage('Yah, kurang tepat. Coba lagi ya!');
      setFeedback("WRONG");
    }

    setTimeout(() => {
      setFeedback(null);
      setIsAnswering(false);
      setSelectedOption(null);
      setEssayAnswer("");
      setTimeLeft(30);
      setMascotMood('idle');
      
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
        setMascotMessage(`Soal nomor ${currentQuestionIndex + 2}, ayo fokus!`);
      } else {
        const finalScore = score + (isCorrect ? 10 : 0);
        localStorage.setItem("last_quiz_score", finalScore.toString());
        setLastScore(finalScore);
        setScreen("RESULT");
        playUISound('success');
      }
    }, 1500);
  };

  const springTransition = { type: "spring", stiffness: 260, damping: 20 } as const;

  const getMedal = () => {
    if(!selectedGrade || !selectedSubject) return null;
    const questionsCount = quizData[selectedGrade][selectedSubject].length;
    const percentage = (correctAnswers / questionsCount) * 100;
    if (percentage >= 95) return { color: "text-yellow-400", bg: "bg-yellow-400/20", label: "GOLD", icon: <Award size={48} className="text-yellow-500" /> };
    if (percentage >= 80) return { color: "text-slate-400", bg: "bg-slate-400/20", label: "SILVER", icon: <Award size={48} className="text-slate-500" /> };
    if (percentage >= 60) return { color: "text-orange-500", bg: "bg-orange-500/20", label: "BRONZE", icon: <Award size={48} className="text-orange-600" /> };
    return null;
  };

  const medalData = useMemo(() => {
    if (screen !== "RESULT") return null;
    return getMedal();
  }, [screen, correctAnswers]);

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-12 font-sans overflow-x-hidden bg-[#f0f4f8]">
      
      {/* Dynamic Background Blobs */}
      <div className="bg-blob blob-1 hidden md:block" />
      <div className="bg-blob blob-2 hidden md:block" />
      <div className="bg-blob blob-3 hidden md:block" />
      
      {/* Mascot Robot - Smaller on mobile */}
      <Mascot mood={mascotMood} message={mascotMessage} />
      
      <AnimatePresence mode="wait">
        {screen === "HOME" && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }} 
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 1.1, rotateX: -20 }} 
            transition={springTransition}
            className="w-full max-w-xl text-center z-10 py-10"
          >
            <div className="space-y-8 md:space-y-12">
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }} 
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
                className="inline-flex p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] bg-white glass shadow-2xl relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-[2.5rem] md:rounded-[4rem] blur-xl opacity-50" />
                <GraduationCap className="text-primary relative z-10 w-16 h-16 md:w-24 md:h-24" strokeWidth={1} />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-accent rounded-full flex items-center justify-center text-xl md:text-2xl shadow-xl z-20"
                >
                  ✨
                </motion.div>
              </motion.div>
              
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-gradient leading-[1] md:leading-[0.9]">
                  Quiz<br/>Master!
                </h1>
                <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-xs md:max-w-md mx-auto leading-relaxed px-4">
                  Platform belajar paling seru dengan tantangan harian yang menantang!
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 md:gap-6 px-4">
                {lastScore !== null && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3 md:py-4 bg-white/40 glass rounded-2xl md:rounded-3xl border border-white/60">
                    <Target className="text-accent w-5 h-5 md:w-6 md:h-6" />
                    <div className="text-left">
                      <span className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Skor Terbaik</span>
                      <span className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{lastScore}</span>
                    </div>
                  </motion.div>
                )}

                <motion.button 
                  whileHover={{ scale: 1.05, y: -5 }} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => { playUISound('click'); setScreen("GRADE_SELECT"); }} 
                  className="group relative w-full max-w-sm py-6 md:py-8 px-8 md:px-12 bg-slate-900 text-white rounded-[2rem] md:rounded-[3rem] font-black text-2xl md:text-3xl shadow-2xl shadow-indigo-200/50 flex items-center justify-center gap-4 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="relative z-10 uppercase tracking-widest">Mulai</span>
                  <Play className="relative z-10 fill-current w-6 h-6 md:w-8 md:h-8" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {screen === "GRADE_SELECT" && (
          <motion.div 
            key="grade"
            initial={{ opacity: 0, x: 100, rotateY: 30 }} 
            animate={{ opacity: 1, x: 0, rotateY: 0 }} 
            exit={{ opacity: 0, x: -100, rotateY: -30 }}
            transition={springTransition} className="w-full max-w-4xl space-y-10 md:space-y-16 z-10 px-4 py-10"
          >
            <div className="flex flex-col items-center text-center gap-4 md:gap-6">
              <button onClick={() => { playUISound('pop'); setScreen("HOME"); }} className="group flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/50 glass hover:bg-white transition-all font-bold text-slate-500 text-sm md:text-base"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali</button>
              <h2 className="text-4xl md:text-6xl font-black text-gradient tracking-tight">Pilih Kelas</h2>
              <p className="text-slate-500 font-medium text-sm md:text-base">Pilih tingkatan belajarmu sekarang!</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-10">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <motion.button
                  key={num} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { playUISound('click'); setSelectedGrade(`grade${num}`); setScreen("SUBJECT_SELECT"); }}
                  className="glass group relative flex flex-col items-center justify-center p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-xl hover:shadow-primary/20 transition-all overflow-hidden border-2 border-transparent hover:border-primary/20"
                >
                  <div className="absolute top-0 right-0 p-4 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                    <GraduationCap className="w-12 h-12 md:w-20 md:h-20" />
                  </div>
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl bg-primary/10 text-primary mb-4 md:mb-6 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-3xl md:text-5xl font-black shadow-inner">
                    {num}
                  </div>
                  <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] group-hover:text-primary transition-colors">KELAS</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {screen === "SUBJECT_SELECT" && (
          <motion.div 
            key="subject"
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={springTransition} className="w-full max-w-6xl space-y-10 md:space-y-16 z-10 px-4 py-10"
          >
            <div className="flex flex-col items-center text-center gap-4 md:gap-6">
              <button onClick={() => { playUISound('pop'); setScreen("GRADE_SELECT"); }} className="group flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl bg-white/50 glass hover:bg-white transition-all font-bold text-slate-500 text-sm md:text-base"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Ganti Kelas</button>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 md:px-6 md:py-2 bg-primary/10 rounded-full text-primary font-black text-[10px] md:text-sm uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Kelas {selectedGrade.replace('grade', '')}
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gradient tracking-tight">Mata Pelajaran</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {Object.keys(quizData[selectedGrade] || {}).map((subjectKey) => {
                const getIcon = () => {
                   switch(subjectKey) {
                    case 'matematika': return <Calculator className="w-7 h-7 md:w-9 md:h-9" />;
                    case 'indonesia': return <Type className="w-7 h-7 md:w-9 md:h-9" />;
                    case 'ppkn': return <Flag className="w-7 h-7 md:w-9 md:h-9" />;
                    case 'ipa': return <Leaf className="w-7 h-7 md:w-9 md:h-9" />;
                    case 'ips': return <Globe className="w-7 h-7 md:w-9 md:h-9" />;
                    case 'pai': return <Star className="w-7 h-7 md:w-9 md:h-9" />;
                    case 'blp': return <BookOpen className="w-7 h-7 md:w-9 md:h-9" />;
                    case 'english': return <Zap className="w-7 h-7 md:w-9 md:h-9" />;
                    default: return <Heart className="w-7 h-7 md:w-9 md:h-9" />;
                  }
                };
                const colors = {
                  matematika: "from-blue-500 to-indigo-600",
                  indonesia: "from-red-500 to-rose-600",
                  ppkn: "from-emerald-500 to-teal-600",
                  ipa: "from-green-500 to-emerald-600",
                  ips: "from-orange-500 to-amber-600",
                  pai: "from-purple-500 to-indigo-600",
                  blp: "from-pink-500 to-rose-600",
                  english: "from-sky-500 to-blue-600"
                };
                return (
                  <motion.button
                    key={subjectKey} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { playUISound('click'); startQuiz(selectedGrade, subjectKey); }}
                    className="glass flex flex-row items-center md:flex-col p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] shadow-xl hover:shadow-2xl transition-all text-left gap-4 md:gap-8 border-2 border-transparent hover:border-white group relative overflow-hidden"
                  >
                    <div className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-gradient-to-br ${colors[subjectKey as keyof typeof colors] || "from-slate-500 to-slate-700"} text-white shadow-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 flex-shrink-0`}>
                      {getIcon()}
                    </div>
                    <div className="space-y-1 md:space-y-2 flex-1 md:text-center">
                      <h3 className="font-black text-lg md:text-2xl text-slate-800 capitalize leading-tight group-hover:text-primary transition-colors">
                        {subjectKey === 'blp' ? 'B. Lampung' : 
                         subjectKey === 'indonesia' ? 'B. Indonesia' : 
                         subjectKey === 'pai' ? 'Agama Islam' :
                         subjectKey === 'ipa' ? 'Sains / IPA' :
                         subjectKey === 'ips' ? 'Sosial / IPS' :
                         subjectKey.toUpperCase()}
                      </h3>
                      <div className="flex items-center md:justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Target className="w-3 h-3 md:w-3.5 md:h-3.5" /> {quizData[selectedGrade][subjectKey].length} Tantangan
                      </div>
                    </div>
                    <div className="hidden md:block absolute bottom-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="text-slate-300 w-6 h-6 md:w-8 md:h-8" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {screen === "QUIZ" && (
          <motion.div 
            key="quiz" 
            initial={{ opacity: 0, scale: 0.9, y: 50 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 1.1, y: -50 }} 
            className="w-full max-w-4xl z-10 px-2 md:px-4 py-6"
          >
            {/* Quiz Header */}
            <div className="mb-6 md:mb-12 space-y-6 md:space-y-8">
              <div className="flex items-center justify-between gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => { playUISound('pop'); resetGame(); }} 
                  className="flex items-center gap-2 py-2.5 px-4 md:py-4 md:px-8 rounded-2xl md:rounded-3xl bg-white glass text-slate-500 hover:text-red-500 transition-all font-black text-[10px] md:text-sm shadow-md"
                >
                  <XCircle className="w-4 h-4 md:w-5 md:h-5" /> <span className="uppercase tracking-widest">Batal</span>
                </motion.button>
                
                <div className="flex flex-col items-center">
                  <div className={`flex items-center gap-3 md:gap-4 py-2.5 px-6 md:py-4 md:px-10 rounded-full border-2 md:border-4 shadow-xl transition-all duration-500 ${timeLeft < 10 ? 'bg-rose-500 border-rose-400 text-white animate-pulse' : 'bg-white glass border-white text-slate-900'}`}>
                    <TimerIcon className={`w-5 h-5 md:w-7 md:h-7 ${timeLeft < 10 ? 'animate-spin' : ''}`} />
                    <span className="font-black text-xl md:text-3xl tabular-nums leading-none">{timeLeft}s</span>
                  </div>
                </div>

                <div className="bg-slate-900 text-white px-5 py-2.5 md:px-8 md:py-4 rounded-2xl md:rounded-3xl shadow-xl flex items-center gap-2 md:gap-3">
                  <span className="hidden sm:inline text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Soal</span>
                  <span className="text-lg md:text-2xl font-black">{currentQuestionIndex + 1}/{quizData[selectedGrade][selectedSubject].length}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-2.5 md:h-4 w-full bg-slate-200/50 rounded-full overflow-hidden p-0.5 md:p-1 shadow-inner backdrop-blur-md border border-white">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary via-secondary to-rose-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]" 
                  initial={{ width: 0 }} 
                  animate={{ width: `${((currentQuestionIndex + 1) / quizData[selectedGrade][selectedSubject].length) * 100}%` }} 
                  transition={{ duration: 1, ease: "circOut" }} 
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestionIndex} 
                initial={{ opacity: 0, x: 50, rotateY: 5 }} 
                animate={{ opacity: 1, x: 0, rotateY: 0 }} 
                exit={{ opacity: 0, x: -50, rotateY: -5 }} 
                className={`glass p-6 md:p-16 lg:p-20 rounded-[2.5rem] md:rounded-[5rem] shadow-2xl relative overflow-hidden transition-all duration-500 ${feedback === 'WRONG' ? 'shake border-rose-200' : feedback === 'CORRECT' ? 'border-emerald-200' : 'border-white'}`}
              >
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 md:-top-20 md:-right-20 w-40 h-40 md:w-64 md:h-64 bg-primary/5 rounded-full blur-2xl md:blur-3xl" />
                
                <div className="relative z-10 mb-8 md:mb-12 flex justify-center">
                  <div className={`inline-flex items-center gap-2 px-6 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-[0.2em] shadow-sm ${quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'essay' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'essay' ? '✍️ Isian Singkat' : '🔘 Pilihan Ganda'}
                  </div>
                </div>

                <h3 className="relative z-10 text-2xl md:text-4xl lg:text-5xl font-black text-slate-800 leading-[1.3] mb-8 md:mb-16 text-center tracking-tight px-2">
                  {quizData[selectedGrade][selectedSubject][currentQuestionIndex].question}
                </h3>

                <div className="relative z-10 max-w-2xl mx-auto">
                  {quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'multiple-choice' ? (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                      {quizData[selectedGrade][selectedSubject][currentQuestionIndex].options?.map((option, idx) => {
                        const isSelected = selectedOption === option;
                        const isCorrect = option === quizData[selectedGrade][selectedSubject][currentQuestionIndex].answer;
                        
                        return (
                          <motion.button
                            key={idx} 
                            whileHover={!isAnswering ? { scale: 1.02, x: 10 } : {}} 
                            whileTap={!isAnswering ? { scale: 0.98 } : {}}
                            onClick={() => processAnswer(option)} 
                            disabled={isAnswering}
                            className={`p-5 md:p-8 text-left rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 transition-all flex items-center gap-4 md:gap-8 ${
                              !isAnswering 
                                ? "border-transparent bg-white/60 hover:bg-white hover:border-primary/20 shadow-lg" 
                                : isCorrect 
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-black shadow-emerald-100 shadow-xl" 
                                  : isSelected 
                                    ? "border-rose-500 bg-rose-50 text-rose-900" 
                                    : "opacity-30 scale-95 grayscale"
                            }`}
                          >
                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-lg md:text-2xl flex-shrink-0 transition-colors shadow-inner ${
                              !isAnswering ? 'bg-slate-100 text-slate-400' : isCorrect ? 'bg-emerald-500 text-white' : isSelected ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-lg md:text-2xl font-bold tracking-tight">{option}</span>
                            {isAnswering && isCorrect && <CheckCircle2 className="ml-auto text-emerald-500 w-6 h-6 md:w-8 md:h-8" />}
                            {isAnswering && isSelected && !isCorrect && <XCircle className="ml-auto text-rose-500 w-6 h-6 md:w-8 md:h-8" />}
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); if(!isAnswering && essayAnswer.trim()) processAnswer(essayAnswer.trim()); }} className="space-y-6 md:space-y-10">
                      <div className="relative">
                        <input
                          type="text" value={essayAnswer} onChange={(e) => setEssayAnswer(e.target.value)} disabled={isAnswering} placeholder="Ketik jawabanmu..."
                          className={`w-full p-6 md:p-10 bg-white/60 rounded-[1.5rem] md:rounded-[3rem] border-2 md:border-4 transition-all text-xl md:text-3xl font-black outline-none placeholder:text-slate-300 shadow-xl ${
                            !isAnswering 
                              ? "border-transparent focus:border-primary focus:bg-white" 
                              : feedback === 'CORRECT' 
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900" 
                                : "border-rose-500 bg-rose-50 text-rose-900"
                          }`}
                          autoFocus
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
                          <Send className="w-8 h-8" />
                        </div>
                      </div>
                      {!isAnswering && (
                        <motion.button 
                          whileHover={{ scale: 1.02, y: -3 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!essayAnswer.trim()} 
                          className="w-full py-5 md:py-8 bg-slate-900 text-white rounded-[1.5rem] md:rounded-[3rem] font-black text-lg md:text-2xl flex items-center justify-center gap-3 md:gap-5 shadow-2xl transition-all disabled:opacity-50"
                        >
                          Kirim Jawaban <Send className="w-6 h-6 md:w-8 md:h-8" />
                        </motion.button>
                      )}
                    </form>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {screen === "RESULT" && (
          <motion.div 
            key="result" 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }} 
            animate={{ opacity: 1, scale: 1, rotate: 0 }} 
            className="w-full max-w-2xl text-center z-10 px-4 py-10"
          >
             {correctAnswers >= quizData[selectedGrade][selectedSubject].length * 0.7 && <Confetti />}
             <div className="glass p-8 md:p-20 rounded-[3rem] md:rounded-[6rem] shadow-2xl relative space-y-10 md:space-y-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                
                <div className="relative space-y-8 md:space-y-12">
                  <div className="flex flex-col items-center gap-4">
                    {medalData ? (
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }} 
                        animate={{ scale: 1, rotate: 0 }} 
                        transition={{ type: "spring", damping: 15, stiffness: 200 }} 
                        className="flex flex-col items-center gap-4"
                      >
                         <div className={`p-6 md:p-10 rounded-3xl md:rounded-[3rem] shadow-2xl ${medalData.bg} backdrop-blur-xl border-2 border-white/50 relative`}>
                            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                              <Award className={`w-12 h-12 md:w-16 md:h-16 ${medalData.color.replace('text-', '') === 'yellow-400' ? 'text-yellow-500' : medalData.color.replace('text-', '') === 'slate-400' ? 'text-slate-500' : 'text-orange-600'}`} />
                            </motion.div>
                         </div>
                         <span className={`text-2xl md:text-4xl font-black ${medalData.color} tracking-tighter uppercase`}>Medali {medalData.label}</span>
                      </motion.div>
                    ) : (
                      <Trophy className="w-12 h-12 md:w-16 md:h-16" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-base md:text-2xl font-black text-slate-400 uppercase tracking-[0.3em]">Hasil Akhir</h2>
                    <ScoreCircle score={score} maxScore={quizData[selectedGrade][selectedSubject].length * 10} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-8">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2 }} className="p-5 md:p-8 rounded-3xl md:rounded-[3.5rem] bg-emerald-50 border-2 border-emerald-100 shadow-sm">
                      <span className="block text-[8px] md:text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Benar</span>
                      <span className="text-3xl md:text-5xl font-black text-emerald-600">{correctAnswers}</span>
                    </motion.div>
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.4 }} className="p-5 md:p-8 rounded-3xl md:rounded-[3.5rem] bg-rose-50 border-2 border-rose-100 shadow-sm">
                      <span className="block text-[8px] md:text-xs font-black text-rose-500 uppercase tracking-widest mb-1">Salah</span>
                      <span className="text-3xl md:text-5xl font-black text-rose-600">{quizData[selectedGrade][selectedSubject].length - correctAnswers}</span>
                    </motion.div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:gap-6 relative z-10">
                  <motion.button 
                    whileHover={{ scale: 1.03, y: -3 }} 
                    whileTap={{ scale: 0.97 }} 
                    onClick={() => { playUISound('click'); setScreen("REVIEW"); }} 
                    className="w-full py-6 md:py-8 px-8 md:px-12 bg-primary text-white rounded-3xl md:rounded-[3.5rem] font-black text-xl md:text-3xl flex items-center justify-center gap-3 md:gap-5 shadow-2xl"
                  >
                    <Eye className="w-6 h-6 md:w-9 md:h-9" /> <span>PEMBAHASAN</span>
                  </motion.button>
                  <div className="flex gap-4 md:gap-6">
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      onClick={() => { playUISound('click'); startQuiz(selectedGrade, selectedSubject); }} 
                      className="flex-1 py-5 md:py-8 bg-white glass border-primary/10 text-primary rounded-2xl md:rounded-[3rem] font-black text-xl md:text-2xl shadow-xl border-2 flex items-center justify-center"
                    >
                      <RefreshCcw className="w-7 h-7 md:w-8 md:h-8" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      onClick={() => { playUISound('pop'); resetGame(); }} 
                      className="flex-1 py-5 md:py-8 bg-slate-900 text-white rounded-2xl md:rounded-[3rem] font-black text-xl md:text-2xl shadow-2xl flex items-center justify-center"
                    >
                      <HomeIcon className="w-7 h-7 md:w-8 md:h-8" />
                    </motion.button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {screen === "REVIEW" && (
          <motion.div 
            key="review" 
            initial={{ opacity: 0, y: 100 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full max-w-5xl z-10 p-2 md:p-4 py-10"
          >
             <div className="glass p-6 md:p-12 lg:p-20 rounded-[2rem] md:rounded-[5rem] shadow-2xl space-y-8 md:space-y-12 max-h-[90vh] overflow-y-auto relative">
                <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-2xl p-4 md:p-8 z-30 rounded-[1.5rem] md:rounded-[3rem] border-b border-primary/10 shadow-sm gap-4">
                  <div className="flex items-center gap-3 md:gap-6">
                    <div className="p-2 md:p-4 bg-primary/10 rounded-xl md:rounded-2xl text-primary">
                      <History className="w-6 h-6 md:w-10 md:h-10" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight">Review</h2>
                      <p className="hidden md:block text-slate-400 font-bold text-sm uppercase tracking-widest">Penjelasan jawaban</p>
                    </div>
                  </div>
                  <button onClick={() => { playUISound('pop'); setScreen("RESULT"); }} className="p-3 md:p-6 bg-slate-100 text-slate-500 rounded-2xl md:rounded-3xl hover:bg-rose-500 hover:text-white transition-all shadow-md group"><XCircle className="w-6 h-6 md:w-10 md:h-10" /></button>
                </div>

                <div className="space-y-6 md:space-y-10 px-1 md:px-2 pb-12">
                   {quizHistory.map((item, idx) => (
                     <motion.div 
                       key={idx} 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.05 }}
                       className={`p-6 md:p-10 rounded-[2rem] md:rounded-[4rem] border-2 md:border-4 transition-all relative group ${item.isCorrect ? 'border-emerald-100 bg-emerald-50/20' : 'border-rose-100 bg-rose-50/20'}`}
                     >
                        <div className="flex flex-col items-start gap-4 md:gap-8">
                           <div className={`w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center font-black text-xl md:text-3xl flex-shrink-0 shadow-lg ${item.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                            {idx + 1}
                           </div>
                           <div className="space-y-4 md:space-y-8 flex-1 w-full">
                              <p className="font-black text-xl md:text-3xl text-slate-800 leading-tight tracking-tight">{item.question}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-sm">
                                  <span className="block text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 md:mb-2">Jawaban Kamu</span> 
                                  <div className="flex items-center gap-2">
                                    <span className={`text-lg md:text-2xl font-black ${item.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{item.userAnswer}</span>
                                    {item.isCorrect ? <CheckCircle2 className="text-emerald-500 w-5 h-5 md:w-6 md:h-6" /> : <XCircle className="text-rose-500 w-5 h-5 md:w-6 md:h-6" />}
                                  </div>
                                </div>
                                {!item.isCorrect && (
                                  <div className="p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] bg-indigo-50 border-2 border-primary/10 shadow-sm">
                                    <span className="block text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 md:mb-2">Jawaban Benar</span> 
                                    <span className="text-lg md:text-2xl font-black text-primary">{item.correctAnswer}</span>
                                  </div>
                                )}
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
