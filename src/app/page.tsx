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
  Medal
} from "lucide-react";
import { quizData, Question } from "@/data/questions";

// --- Types ---
type Screen = "HOME" | "GRADE_SELECT" | "SUBJECT_SELECT" | "QUIZ" | "RESULT" | "REVIEW";

interface QuizHistory {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  type: string;
}

// --- Sound Engine (Web Audio API) ---
const playSound = (type: 'correct' | 'wrong' | 'complete') => {
  if (typeof window === 'undefined') return;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else if (type === 'wrong') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } else {
    // complete sound
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }
};

// --- Components ---

const Background = () => (
  <div className="bg-mesh">
    <div className="blob blob-1" />
    <div className="blob blob-2" />
    <div className="blob blob-3" />
  </div>
);

const Confetti = () => (
  <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
    {[...Array(50)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 rounded-full"
        initial={{ 
          top: "-5%", 
          left: `${Math.random() * 100}%`,
          backgroundColor: ["#3b82f6", "#ef4444", "#eab308", "#22c55e", "#a855f7"][Math.floor(Math.random() * 5)]
        }}
        animate={{ 
          top: "105%",
          left: `${Math.random() * 100}%`,
          rotate: 360,
        }}
        transition={{ 
          duration: 2 + Math.random() * 2, 
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
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
        <motion.circle
          cx="96" cy="96" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          className="text-blue-600"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span 
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="text-5xl font-black text-slate-900 dark:text-white"
        >
          {score}
        </motion.span>
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Poin</span>
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
  };

  const processAnswer = (userAnswer: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsAnswering(true);
    setSelectedOption(userAnswer);

    const questions = quizData[selectedGrade]?.[selectedSubject] || [];
    const currentQ = questions[currentQuestionIndex];
    
    const isCorrect = currentQ.type === 'multiple-choice' 
      ? userAnswer === currentQ.answer 
      : userAnswer.toLowerCase() === currentQ.answer.toLowerCase();

    // Sound
    if (isCorrect) playSound('correct');
    else playSound('wrong');

    // Store history
    setQuizHistory(prev => [...prev, {
      question: currentQ.question,
      userAnswer: userAnswer,
      correctAnswer: currentQ.answer,
      isCorrect,
      type: currentQ.type
    }]);

    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
      setFeedback("CORRECT");
    } else {
      setFeedback("WRONG");
    }

    setTimeout(() => {
      setFeedback(null);
      setIsAnswering(false);
      setSelectedOption(null);
      setEssayAnswer("");
      setTimeLeft(30);
      
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        const finalScore = score + (isCorrect ? 10 : 0);
        localStorage.setItem("last_quiz_score", finalScore.toString());
        setLastScore(finalScore);
        setScreen("RESULT");
        playSound('complete');
      }
    }, 1200);
  };

  const springTransition = { type: "spring", stiffness: 300, damping: 25 } as const;

  const getMedal = () => {
    const questionsCount = quizData[selectedGrade][selectedSubject].length;
    const percentage = (correctAnswers / questionsCount) * 100;
    if (percentage >= 95) return { color: "text-yellow-400", bg: "bg-yellow-400", label: "GOLD", icon: <Award size={32} /> };
    if (percentage >= 80) return { color: "text-slate-300", bg: "bg-slate-300", label: "SILVER", icon: <Award size={32} /> };
    if (percentage >= 60) return { color: "text-amber-600", bg: "bg-amber-600", label: "BRONZE", icon: <Award size={32} /> };
    return null;
  };

  const medalData = useMemo(() => {
    if (screen !== "RESULT") return null;
    return getMedal();
  }, [screen, correctAnswers]);

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Background />
      
      <AnimatePresence mode="wait">
        {screen === "HOME" && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }} transition={springTransition}
            className="w-full max-w-lg text-center z-10"
          >
            <div className="space-y-6">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="inline-flex p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-2xl shadow-blue-500/30 mb-2">
                <GraduationCap size={64} strokeWidth={1.5} />
              </motion.div>
              <div className="space-y-2">
                <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">Game Belajar <span className="text-blue-600">Seru!</span></h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Tantang dirimu dengan soal-soal seru tiap hari!</p>
              </div>
              {lastScore !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-1 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[1.4rem] border border-white/50">
                    <div className="flex items-center justify-center gap-3">
                      <Zap size={20} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Skor Tertinggi:</span>
                      <span className="text-2xl font-black text-blue-600">{lastScore}</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => setScreen("GRADE_SELECT")} className="group relative w-full py-5 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-2xl shadow-2xl transition-all">
                Ayo Mulai! <ChevronRight className="inline ml-1 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {screen === "GRADE_SELECT" && (
          <motion.div 
            key="grade"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            transition={springTransition} className="w-full max-w-3xl space-y-10 z-10"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <button onClick={() => setScreen("HOME")} className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4"><ArrowLeft size={20} /> Kembali</button>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white">Pilih Kelas</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <motion.button
                  key={num} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedGrade(`grade${num}`); setScreen("SUBJECT_SELECT"); }}
                  className="glass group flex flex-col items-center justify-center p-8 rounded-[2.5rem] shadow-lg hover:shadow-2xl hover:border-blue-500/50 transition-all text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 mb-4 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all text-3xl font-black">{num}</div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Kelas</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {screen === "SUBJECT_SELECT" && (
          <motion.div 
            key="subject"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={springTransition} className="w-full max-w-5xl space-y-10 z-10 px-4"
          >
            <div className="flex flex-col items-center text-center gap-2">
              <button onClick={() => setScreen("GRADE_SELECT")} className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4"><ArrowLeft size={20} /> Ganti Kelas</button>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white">Mata Pelajaran</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.keys(quizData[selectedGrade] || {}).map((subjectKey, i) => {
                const getIcon = () => {
                   switch(subjectKey) {
                    case 'matematika': return <Calculator size={28} />;
                    case 'indonesia': return <Type size={28} />;
                    case 'ppkn': return <Flag size={28} />;
                    case 'ipas': return <Leaf size={28} />;
                    case 'blp': return <Map size={28} />;
                    case 'english': return <Globe size={28} />;
                    default: return <Heart size={28} />;
                  }
                };
                return (
                  <motion.button
                    key={subjectKey} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
                    onClick={() => startQuiz(selectedGrade, subjectKey)}
                    className="glass flex items-center p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all text-left gap-5 border border-slate-100 dark:border-white/5"
                  >
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">{getIcon()}</div>
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-slate-800 dark:text-white capitalize">{subjectKey === 'blp' ? 'B. Lampung' : subjectKey === 'indonesia' ? 'B. Indonesia' : subjectKey.toUpperCase()}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quizData[selectedGrade][subjectKey].length} Soal</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {screen === "QUIZ" && (
          <motion.div key="quiz" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="w-full max-w-2xl z-10 px-4">
            <div className="mb-8 space-y-6 text-center">
               <div className="flex items-center justify-between">
                <button onClick={resetGame} className="flex items-center gap-2 py-2 px-4 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all font-bold text-xs"><XCircle size={16} /> Keluar</button>
                
                {/* Timer Display */}
                <div className={`flex items-center gap-2 py-2 px-4 rounded-2xl border transition-all ${timeLeft < 10 ? 'bg-red-500 text-white animate-pulse' : 'bg-white/50 border-white/50 text-slate-700'}`}>
                   <TimerIcon size={18} />
                   <span className="font-black text-lg tabular-nums">{timeLeft}s</span>
                </div>

                <div className="font-black text-blue-600 text-lg tabular-nums">
                  {currentQuestionIndex + 1}<span className="text-slate-300 mx-1">/</span>{quizData[selectedGrade][selectedSubject].length}
                </div>
              </div>
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner ring-1 ring-white/50">
                <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentQuestionIndex + 1) / quizData[selectedGrade][selectedSubject].length) * 100}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={currentQuestionIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="glass p-8 md:p-14 rounded-[3.5rem] shadow-2xl relative">
                <AnimatePresence>{feedback && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 z-0 opacity-10 ${feedback === 'CORRECT' ? 'bg-green-500' : 'bg-red-500'}`} />}</AnimatePresence>
                <div className="relative z-10 mb-6 flex items-center justify-center">
                   <span className={`px-4 py-1 rounded-xl text-xs font-black uppercase tracking-widest ${quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'essay' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'essay' ? 'Isian / Essai' : 'Pilihan Ganda'}
                  </span>
                </div>
                <h3 className="relative z-10 text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-snug mb-10 text-center">
                  {quizData[selectedGrade][selectedSubject][currentQuestionIndex].question}
                </h3>
                <div className="relative z-10">
                  {quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'multiple-choice' ? (
                    <div className="grid grid-cols-1 gap-4">
                      {quizData[selectedGrade][selectedSubject][currentQuestionIndex].options?.map((option, idx) => {
                        const isSelected = selectedOption === option;
                        const isCorrect = option === quizData[selectedGrade][selectedSubject][currentQuestionIndex].answer;
                        return (
                          <motion.button
                            key={idx} whileHover={!isAnswering ? { scale: 1.02, x: 5 } : {}} whileTap={!isAnswering ? { scale: 0.98 } : {}}
                            animate={isSelected && feedback === "WRONG" ? { x: [-10, 10, -10, 10, 0] } : {}}
                            onClick={() => processAnswer(option)} disabled={isAnswering}
                            className={`p-5 md:p-6 text-left rounded-[1.8rem] border-2 transition-all flex items-center gap-5 ${!isAnswering ? "border-slate-100 bg-white/50" : isCorrect ? "border-green-500 bg-green-500/10 text-green-700 font-bold" : isSelected ? "border-red-500 bg-red-500/10 text-red-700" : "opacity-40"}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${!isAnswering ? 'bg-slate-100 text-slate-400' : isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-100'}`}>{String.fromCharCode(65 + idx)}</div>
                            <span className="text-lg">{option}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); if(!isAnswering && essayAnswer.trim()) processAnswer(essayAnswer.trim()); }} className="space-y-6">
                      <input
                        type="text" value={essayAnswer} onChange={(e) => setEssayAnswer(e.target.value)} disabled={isAnswering} placeholder="Ketik jawabanmu..."
                        className={`w-full p-6 bg-slate-100 rounded-[1.8rem] border-4 transition-all text-xl font-bold outline-none ${!isAnswering ? "border-transparent focus:border-blue-500" : feedback === 'CORRECT' ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"}`}
                        autoFocus
                      />
                      {!isAnswering && <button disabled={!essayAnswer.trim()} className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 shadow-xl">Kirim <Send size={20}/></button>}
                    </form>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>{feedback && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-4 text-white font-black text-2xl ${feedback === "CORRECT" ? "bg-green-500" : "bg-red-500"}`}>
                {feedback === "CORRECT" ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                {feedback === "CORRECT" ? "MANTAP! BENAR" : "YAAH! SALAH"}
              </motion.div>
            )}</AnimatePresence>
          </motion.div>
        )}

        {screen === "RESULT" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl text-center z-10 px-4">
             {correctAnswers >= quizData[selectedGrade][selectedSubject].length * 0.7 && <Confetti />}
             <div className="glass p-10 md:p-16 rounded-[4rem] shadow-2xl relative space-y-10">
                <div className="relative space-y-6">
                  {medalData && (
                    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }} className="flex flex-col items-center gap-2">
                       <div className={`p-6 rounded-full shadow-lg ${medalData.bg} text-white`}>{medalData.icon}</div>
                       <span className={`text-2xl font-black ${medalData.color} tracking-tighter`}>{medalData.label} ARCHIEVED</span>
                    </motion.div>
                  )}
                  <h2 className="text-5xl font-black text-slate-900">SKOR KAMU</h2>
                  <ScoreCircle score={score} maxScore={quizData[selectedGrade][selectedSubject].length * 10} />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-green-500/10 border border-green-500/20"><span className="block text-xs font-bold text-green-600">BENAR</span><span className="text-2xl font-black text-green-700">{correctAnswers}</span></div>
                    <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/20"><span className="block text-xs font-bold text-red-600">SALAH</span><span className="text-2xl font-black text-red-700">{quizData[selectedGrade][selectedSubject].length - correctAnswers}</span></div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setScreen("REVIEW")} className="w-full py-5 px-8 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"><Eye size={20} /> Lihat Pembahasan</motion.button>
                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => startQuiz(selectedGrade, selectedSubject)} className="flex-1 py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-lg"><RefreshCcw size={18} /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={resetGame} className="flex-1 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-lg"><HomeIcon size={18} /></motion.button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {screen === "REVIEW" && (
          <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl z-10 p-4">
             <div className="glass p-8 md:p-12 rounded-[3.5rem] shadow-2xl space-y-8 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md p-4 z-20 rounded-2xl">
                  <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3"><History size={32} /> Pembahasan</h2>
                  <button onClick={() => setScreen("RESULT")} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-all"><XCircle size={24} /></button>
                </div>
                <div className="space-y-6">
                   {quizHistory.map((item, idx) => (
                     <div key={idx} className={`p-6 rounded-3xl border-2 ${item.isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                        <div className="flex items-start gap-4">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${item.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{idx + 1}</div>
                           <div className="space-y-3">
                              <p className="font-bold text-lg text-slate-800 leading-tight">{item.question}</p>
                              <div className="space-y-1">
                                <p className="text-sm"><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">Jawaban Kamu:</span> <span className={item.isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{item.userAnswer}</span></p>
                                {!item.isCorrect && <p className="text-sm"><span className="font-bold text-slate-400 uppercase tracking-tighter mr-2">Jawaban Benar:</span> <span className="text-blue-600 font-bold">{item.correctAnswer}</span></p>}
                              </div>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
