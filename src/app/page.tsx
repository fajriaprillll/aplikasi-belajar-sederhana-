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
  Play
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
          className="text-indigo-600"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span 
          initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="text-5xl font-black text-slate-900"
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

  const springTransition = { type: "spring", stiffness: 300, damping: 25 } as const;

  const getMedal = () => {
    if(!selectedGrade || !selectedSubject) return null;
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
    <main className="min-h-screen relative flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      
      {/* Mascot Robot */}
      <Mascot mood={mascotMood} message={mascotMessage} />
      
      <AnimatePresence mode="wait">
        {screen === "HOME" && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }} transition={springTransition}
            className="w-full max-w-lg text-center z-10"
          >
            <div className="space-y-8">
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [0, 5, -5, 0]
                }} 
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
                className="inline-flex p-8 rounded-[3rem] bg-white glass shadow-2xl relative group"
              >
                <GraduationCap size={80} strokeWidth={1.5} className="text-indigo-600" />
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-lg">✨</div>
              </motion.div>
              
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-black tracking-tight text-gradient leading-tight">Belajar Seru!</h1>
                <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-sm mx-auto">Tantang dirimu dengan kuis menarik setiap hari!</p>
              </div>

              {lastScore !== null && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-8 py-4 bg-white/50 glass rounded-2xl border border-white/50">
                  <div className="flex items-center justify-center gap-3">
                    <Zap size={24} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Skor Tertinggi:</span>
                    <span className="text-3xl font-black text-indigo-600">{lastScore}</span>
                  </div>
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }} 
                onClick={() => { playUISound('click'); setScreen("GRADE_SELECT"); }} 
                className="group relative w-full py-6 px-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2.5rem] font-black text-3xl shadow-2xl shadow-indigo-200 transition-all"
              >
                AYO MULAI! <Play className="inline ml-2 fill-current" size={28} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {screen === "GRADE_SELECT" && (
          <motion.div 
            key="grade"
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
            transition={springTransition} className="w-full max-w-3xl space-y-12 z-10"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <button onClick={() => { playUISound('pop'); setScreen("HOME"); }} className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold"><ArrowLeft size={20} /> Kembali</button>
              <h2 className="text-5xl font-black text-gradient">Pilih Kelas</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <motion.button
                  key={num} whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { playUISound('click'); setSelectedGrade(`grade${num}`); setScreen("SUBJECT_SELECT"); }}
                  className="glass group flex flex-col items-center justify-center p-10 rounded-[3rem] shadow-xl hover:shadow-2xl hover:border-indigo-500/50 transition-all text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-4xl font-black shadow-inner">{num}</div>
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">KELAS</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {screen === "SUBJECT_SELECT" && (
          <motion.div 
            key="subject"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            transition={springTransition} className="w-full max-w-5xl space-y-12 z-10 px-4"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <button onClick={() => { playUISound('pop'); setScreen("GRADE_SELECT"); }} className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold"><ArrowLeft size={20} /> Ganti Kelas</button>
              <h2 className="text-5xl font-black text-gradient">Mata Pelajaran</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(quizData[selectedGrade] || {}).map((subjectKey) => {
                const getIcon = () => {
                   switch(subjectKey) {
                    case 'matematika': return <Calculator size={32} />;
                    case 'indonesia': return <Type size={32} />;
                    case 'ppkn': return <Flag size={32} />;
                    case 'ipas': return <Leaf size={32} />;
                    case 'blp': return <Map size={32} />;
                    case 'english': return <Globe size={32} />;
                    default: return <Heart size={32} />;
                  }
                };
                return (
                  <motion.button
                    key={subjectKey} whileHover={{ scale: 1.03, y: -4 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { playUISound('click'); startQuiz(selectedGrade, subjectKey); }}
                    className="glass flex items-center p-8 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all text-left gap-6 border-2 border-transparent hover:border-indigo-100 group"
                  >
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl group-hover:scale-110 transition-transform">{getIcon()}</div>
                    <div className="flex-1">
                      <h3 className="font-black text-xl text-slate-800 capitalize leading-tight">{subjectKey === 'blp' ? 'B. Lampung' : subjectKey === 'indonesia' ? 'B. Indonesia' : subjectKey.toUpperCase()}</h3>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">{quizData[selectedGrade][subjectKey].length} Soal</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {screen === "QUIZ" && (
          <motion.div key="quiz" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="w-full max-w-2xl z-10 px-4">
            <div className="mb-10 space-y-6 text-center">
               <div className="flex items-center justify-between">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => { playUISound('pop'); resetGame(); }} 
                  className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-white glass text-slate-500 hover:text-red-600 transition-all font-black text-sm shadow-sm"
                >
                  <XCircle size={20} /> <span className="hidden md:inline">Keluar</span>
                </motion.button>
                
                <div className={`flex items-center gap-3 py-3 px-6 rounded-2xl border-2 transition-all ${timeLeft < 10 ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-white glass border-white text-slate-700'}`}>
                   <TimerIcon size={24} />
                   <span className="font-black text-2xl tabular-nums">{timeLeft}s</span>
                </div>

                <div className="font-black text-indigo-600 text-2xl tabular-nums bg-white glass px-6 py-3 rounded-2xl">
                  {currentQuestionIndex + 1}/{quizData[selectedGrade][selectedSubject].length}
                </div>
              </div>
              <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden p-1.5 shadow-inner border border-white">
                <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" initial={{ width: 0 }} animate={{ width: `${((currentQuestionIndex + 1) / quizData[selectedGrade][selectedSubject].length) * 100}%` }} transition={{ duration: 0.8 }} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestionIndex} 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className={`glass p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden ${feedback === 'WRONG' ? 'shake' : ''}`}
              >
                <div className="relative z-10 mb-8 flex items-center justify-center">
                   <span className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm ${quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'essay' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'essay' ? '✍️ Isian' : '🔘 Pilihan Ganda'}
                  </span>
                </div>
                <h3 className="relative z-10 text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-12 text-center tracking-tight">
                  {quizData[selectedGrade][selectedSubject][currentQuestionIndex].question}
                </h3>
                <div className="relative z-10">
                  {quizData[selectedGrade][selectedSubject][currentQuestionIndex].type === 'multiple-choice' ? (
                    <div className="grid grid-cols-1 gap-5">
                      {quizData[selectedGrade][selectedSubject][currentQuestionIndex].options?.map((option, idx) => {
                        const isSelected = selectedOption === option;
                        const isCorrect = option === quizData[selectedGrade][selectedSubject][currentQuestionIndex].answer;
                        return (
                          <motion.button
                            key={idx} whileHover={!isAnswering ? { scale: 1.02, x: 8 } : {}} whileTap={!isAnswering ? { scale: 0.98 } : {}}
                            onClick={() => processAnswer(option)} disabled={isAnswering}
                            className={`p-6 text-left rounded-[2rem] border-4 transition-all flex items-center gap-6 ${!isAnswering ? "border-slate-50 bg-white/50 hover:border-indigo-200" : isCorrect ? "border-green-500 bg-green-50 text-green-700 font-black shadow-green-100 shadow-xl" : isSelected ? "border-red-500 bg-red-50 text-red-700" : "opacity-40"}`}
                          >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl flex-shrink-0 ${!isAnswering ? 'bg-slate-100 text-slate-400' : isCorrect ? 'bg-green-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-slate-100'}`}>{String.fromCharCode(65 + idx)}</div>
                            <span className="text-xl font-bold">{option}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); if(!isAnswering && essayAnswer.trim()) processAnswer(essayAnswer.trim()); }} className="space-y-8">
                      <input
                        type="text" value={essayAnswer} onChange={(e) => setEssayAnswer(e.target.value)} disabled={isAnswering} placeholder="Ketik jawabanmu di sini..."
                        className={`w-full p-8 bg-white/50 rounded-[2.5rem] border-4 transition-all text-2xl font-black outline-none placeholder:text-slate-300 ${!isAnswering ? "border-slate-50 focus:border-indigo-500" : feedback === 'CORRECT' ? "border-green-500 bg-green-50 text-green-700" : "border-red-500 bg-red-50 text-red-700"}`}
                        autoFocus
                      />
                      {!isAnswering && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          disabled={!essayAnswer.trim()} 
                          className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-4 shadow-2xl transition-all"
                        >
                          Kirim Jawaban <Send size={28}/>
                        </motion.button>
                      )}
                    </form>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>{feedback && (
              <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-12 py-6 rounded-[3rem] shadow-2xl flex items-center gap-5 text-white font-black text-3xl ${feedback === "CORRECT" ? "bg-green-500" : "bg-red-500"}`}>
                {feedback === "CORRECT" ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                {feedback === "CORRECT" ? "MANTAP!" : "COBA LAGI!"}
              </motion.div>
            )}</AnimatePresence>
          </motion.div>
        )}

        {screen === "RESULT" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-xl text-center z-10 px-4">
             {correctAnswers >= quizData[selectedGrade][selectedSubject].length * 0.7 && <Confetti />}
             <div className="glass p-12 md:p-20 rounded-[5rem] shadow-2xl relative space-y-12">
                <div className="relative space-y-8">
                  {medalData && (
                    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }} className="flex flex-col items-center gap-4">
                       <div className={`p-8 rounded-[2rem] shadow-xl ${medalData.bg} text-white`}>{medalData.icon}</div>
                       <span className={`text-3xl font-black ${medalData.color} tracking-tighter uppercase`}>MEDALI {medalData.label}</span>
                    </motion.div>
                  )}
                  <h2 className="text-6xl font-black text-slate-800">SKOR KAMU</h2>
                  <ScoreCircle score={score} maxScore={quizData[selectedGrade][selectedSubject].length * 10} />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-[2.5rem] bg-green-50 border-2 border-green-100 shadow-sm"><span className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">BENAR</span><span className="text-4xl font-black text-green-600">{correctAnswers}</span></div>
                    <div className="p-6 rounded-[2.5rem] bg-red-50 border-2 border-red-100 shadow-sm"><span className="block text-xs font-black text-red-500 uppercase tracking-widest mb-1">SALAH</span><span className="text-4xl font-black text-red-600">{quizData[selectedGrade][selectedSubject].length - correctAnswers}</span></div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { playUISound('click'); setScreen("REVIEW"); }} className="w-full py-6 px-10 bg-indigo-600 text-white rounded-[2.5rem] font-black text-2xl flex items-center justify-center gap-3 shadow-2xl shadow-indigo-200"><Eye size={28} /> CEK PEMBAHASAN</motion.button>
                  <div className="flex gap-4">
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => { playUISound('click'); startQuiz(selectedGrade, selectedSubject); }} className="flex-1 py-6 bg-white glass border-indigo-100 text-indigo-600 rounded-[2.5rem] font-black text-2xl shadow-lg border-2"><RefreshCcw size={28} /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} onClick={() => { playUISound('pop'); resetGame(); }} className="flex-1 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl"><HomeIcon size={28} /></motion.button>
                  </div>
                </div>
             </div>
          </motion.div>
        )}

        {screen === "REVIEW" && (
          <motion.div key="review" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl z-10 p-4">
             <div className="glass p-10 md:p-16 rounded-[4rem] shadow-2xl space-y-10 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl p-6 z-20 rounded-[2rem] border-b border-indigo-50">
                  <h2 className="text-4xl font-black text-indigo-600 flex items-center gap-4"><History size={40} /> Pembahasan</h2>
                  <button onClick={() => { playUISound('pop'); setScreen("RESULT"); }} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><XCircle size={32} /></button>
                </div>
                <div className="space-y-8 px-2 pb-10">
                   {quizHistory.map((item, idx) => (
                     <div key={idx} className={`p-8 rounded-[3rem] border-4 transition-all hover:scale-[1.01] ${item.isCorrect ? 'border-green-100 bg-green-50/20' : 'border-red-100 bg-red-50/20'}`}>
                        <div className="flex items-start gap-6">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 shadow-sm ${item.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{idx + 1}</div>
                           <div className="space-y-5">
                              <p className="font-black text-2xl text-slate-800 leading-tight tracking-tight">{item.question}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-white border border-slate-100"><span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Jawaban Kamu:</span> <span className={`text-xl font-black ${item.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{item.userAnswer}</span></div>
                                {!item.isCorrect && <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100"><span className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Jawaban Benar:</span> <span className="text-xl font-black text-indigo-600">{item.correctAnswer}</span></div>}
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
