import React, { useState, useEffect } from 'react';
import { generateGameData } from '../services/geminiService';
import { Gamepad2, Timer, Trophy, Zap, RefreshCw, Loader2, Star, MoveLeft, Check, X, AlertCircle } from 'lucide-react';
import { addXp } from '../utils/progressUtils';

const GameArena: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'menu' | 'scramble' | 'rapidFire'>('menu');
  const [loading, setLoading] = useState(false);
  const [gameData, setGameData] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  // Scramble State
  const [scrambleInput, setScrambleInput] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<{char: string, id: number}[]>([]);

  // Rapid Fire State
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // --- GAME LOGIC ---

  const startGame = async (type: 'scramble' | 'rapidFire') => {
    setLoading(true);
    const data = await generateGameData(type, 5); // Fetch 5 rounds
    setGameData(data);
    setActiveGame(type);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameOver(false);
    setFeedback(null);
    setSelectedOption(null);
    setLoading(false);

    if (type === 'scramble' && data.length > 0) {
        initScrambleRound(data[0]);
    } else if (type === 'rapidFire' && data.length > 0) {
        initRapidFireRound();
    }
  };

  const initScrambleRound = (item: any) => {
    const letters = item.scrambled.split('').map((char: string, i: number) => ({ char, id: i }));
    setAvailableLetters(letters);
    setScrambleInput([]);
    setFeedback(null);
  };

  const initRapidFireRound = () => {
      setTimeLeft(10);
      setTimerActive(true);
      setFeedback(null);
      setSelectedOption(null);
  };

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive) {
        handleRapidFireTimeout();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // --- HANDLERS ---

  const handleScrambleClick = (charObj: {char: string, id: number}) => {
     if (feedback) return; // Prevent clicks during feedback
     setScrambleInput(prev => [...prev, charObj.char]);
     setAvailableLetters(prev => prev.filter(l => l.id !== charObj.id));
  };

  const resetScrambleInput = () => {
      if (!gameData[currentQuestionIndex]) return;
      initScrambleRound(gameData[currentQuestionIndex]);
  };

  const checkScrambleAnswer = () => {
      const currentWord = gameData[currentQuestionIndex].word;
      const attempt = scrambleInput.join('');
      
      if (attempt === currentWord) {
          setScore(prev => prev + 10);
          setFeedback('success');
          // Delay to show success state before next round
          setTimeout(() => {
            nextRound();
          }, 1000);
      } else {
          setFeedback('error');
          // Delay to show error state before resetting
          setTimeout(() => {
            setFeedback(null);
            resetScrambleInput();
          }, 1000);
      }
  };

  const handleRapidFireAnswer = (index: number) => {
      if (feedback) return; // Prevent double clicking
      setTimerActive(false);
      setSelectedOption(index);

      const correctIndex = gameData[currentQuestionIndex].correctIndex;
      
      if (index === correctIndex) {
          setScore(prev => prev + 10 + Math.ceil(timeLeft / 2)); // Bonus for speed
          setFeedback('success');
      } else {
          setFeedback('error');
      }

      setTimeout(nextRound, 1500); // 1.5s delay to see correct answer
  };

  const handleRapidFireTimeout = () => {
      setTimerActive(false);
      setFeedback('error');
      setSelectedOption(-1); // No selection made
      setTimeout(nextRound, 1500);
  };

  const nextRound = () => {
      if (currentQuestionIndex < gameData.length - 1) {
          const nextIdx = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIdx);
          
          if (activeGame === 'scramble') initScrambleRound(gameData[nextIdx]);
          if (activeGame === 'rapidFire') initRapidFireRound();
      } else {
          endGame();
      }
  };

  const endGame = () => {
      setGameOver(true);
      setTimerActive(false);
      addXp(score);
  };

  const exitGame = () => {
      setActiveGame('menu');
      setGameData([]);
      setTimerActive(false);
  };

  // --- RENDER ---

  if (activeGame === 'menu') {
      return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                    <Gamepad2 className="text-purple-600" size={32} /> Game Arena
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Learn while you play. Earn XP!</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Word Scramble Card */}
                <button 
                  onClick={() => startGame('scramble')}
                  disabled={loading}
                  className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden text-left"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-purple-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 dark:shadow-none">
                            <RefreshCw size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Word Scramble</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Unjumble letters to find the English word. Great for spelling!</p>
                        <div className="mt-6 inline-flex items-center text-sm font-bold text-purple-600 dark:text-purple-400">
                             Play Now <MoveLeft className="ml-2 rotate-180" size={16}/>
                        </div>
                    </div>
                </button>

                {/* Rapid Fire Card */}
                <button 
                  onClick={() => startGame('rapidFire')}
                  disabled={loading}
                  className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden text-left"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 dark:shadow-none">
                            <Timer size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Rapid Fire</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Race against the clock! Choose the correct translation in 10s.</p>
                        <div className="mt-6 inline-flex items-center text-sm font-bold text-orange-600 dark:text-orange-400">
                             Play Now <MoveLeft className="ml-2 rotate-180" size={16}/>
                        </div>
                    </div>
                </button>
            </div>
            
            {loading && (
                <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                    <p className="font-bold text-xl text-slate-800 dark:text-white">Generating Game Level...</p>
                </div>
            )}
        </div>
      );
  }

  // --- GAME OVER VIEW ---
  if (gameOver) {
      return (
          <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl text-center border border-slate-100 dark:border-slate-800 animate-scale-in">
              <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 animate-bounce">
                  <Trophy size={48} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Game Over!</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">You scored <span className="text-indigo-600 font-bold">{score} XP</span></p>
              
              <button onClick={exitGame} className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl hover:bg-black dark:hover:bg-slate-200 transition">
                  Back to Menu
              </button>
          </div>
      );
  }

  // --- ACTIVE GAME VIEW ---
  return (
      <div className="max-w-2xl mx-auto h-[600px] flex flex-col">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-8">
               <button onClick={exitGame} className="text-slate-400 hover:text-slate-600 p-2 font-bold flex items-center gap-2"><X size={20}/> Quit</button>
               <div className="flex items-center gap-4">
                   <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-xl text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-2">
                       <Zap size={18} fill="currentColor" /> {score}
                   </div>
                   {activeGame === 'rapidFire' && (
                       <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${timeLeft < 4 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                           <Timer size={18} /> {timeLeft}s
                       </div>
                   )}
               </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
              {/* SCRAMBLE UI */}
              {activeGame === 'scramble' && gameData[currentQuestionIndex] && (
                  <div className="text-center space-y-8 animate-fade-in-up">
                      <div>
                          <p className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-2">Hint</p>
                          <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">{gameData[currentQuestionIndex].hint}</h3>
                      </div>

                      {/* Scramble Input Area with Visual Feedback */}
                      <div className="flex flex-col items-center gap-4">
                        <div className={`h-20 flex justify-center gap-2 p-2 rounded-2xl transition-all duration-300 ${feedback === 'error' ? 'bg-red-50 border-red-200 animate-shake' : feedback === 'success' ? 'bg-green-50 border-green-200 scale-105' : ''}`}>
                             {scrambleInput.map((char, i) => (
                                 <div key={i} className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm animate-scale-in transition-colors ${feedback === 'success' ? 'bg-green-500 text-white' : feedback === 'error' ? 'bg-red-500 text-white' : 'bg-purple-600 text-white shadow-purple-200'}`}>
                                     {char}
                                 </div>
                             ))}
                             {Array(gameData[currentQuestionIndex].word.length - scrambleInput.length).fill(null).map((_, i) => (
                                 <div key={i} className="w-12 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700"></div>
                             ))}
                        </div>
                        {feedback === 'error' && <p className="text-red-500 font-bold text-sm flex items-center gap-1 animate-pulse"><AlertCircle size={14}/> Try Again!</p>}
                        {feedback === 'success' && <p className="text-green-500 font-bold text-sm flex items-center gap-1"><Check size={14}/> Perfect!</p>}
                      </div>

                      <div className="flex flex-wrap justify-center gap-3">
                          {availableLetters.map((l) => (
                              <button 
                                key={l.id} 
                                onClick={() => handleScrambleClick(l)}
                                className="w-14 h-14 bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 rounded-xl text-xl font-bold text-slate-700 dark:text-white hover:-translate-y-1 active:border-b-0 active:translate-y-1 transition-all"
                              >
                                  {l.char}
                              </button>
                          ))}
                      </div>
                      
                      <div className="flex gap-4 pt-8">
                          <button onClick={resetScrambleInput} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">Reset</button>
                          <button 
                            onClick={checkScrambleAnswer}
                            disabled={scrambleInput.length !== gameData[currentQuestionIndex].word.length || feedback !== null}
                            className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:shadow-none shadow-lg shadow-purple-200 dark:shadow-none hover:bg-purple-700 active:scale-95 transition"
                          >
                            Check Word
                          </button>
                      </div>
                  </div>
              )}

              {/* RAPID FIRE UI */}
              {activeGame === 'rapidFire' && gameData[currentQuestionIndex] && (
                  <div className="text-center w-full animate-fade-in-up">
                      <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-8">{gameData[currentQuestionIndex].question}</h3>
                      
                      <div className="grid gap-4">
                          {gameData[currentQuestionIndex].options.map((opt: string, i: number) => {
                              const isCorrectOption = i === gameData[currentQuestionIndex].correctIndex;
                              const isSelected = selectedOption === i;
                              
                              let buttonStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200";
                              if (feedback) {
                                  if (isCorrectOption) {
                                      buttonStyle = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400"; // Always show correct
                                  } else if (isSelected && !isCorrectOption) {
                                      buttonStyle = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400"; // Show incorrect if chosen
                                  } else {
                                      buttonStyle = "opacity-40 bg-slate-50 dark:bg-slate-800 border-transparent"; // Fade others
                                  }
                              } else {
                                  buttonStyle += " hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20";
                              }

                              return (
                                <button 
                                    key={i}
                                    onClick={() => handleRapidFireAnswer(i)}
                                    disabled={feedback !== null}
                                    className={`w-full p-4 border-2 rounded-2xl text-lg font-bold transition-all text-left flex justify-between items-center group ${buttonStyle}`}
                                >
                                    {opt}
                                    {feedback && isCorrectOption && <Check size={20} className="text-green-600" />}
                                    {feedback && isSelected && !isCorrectOption && <X size={20} className="text-red-600" />}
                                    {!feedback && <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-orange-500"></div>}
                                </button>
                              )
                          })}
                      </div>
                  </div>
              )}
          </div>
          <div className="text-center py-4 text-xs font-bold text-slate-300 uppercase tracking-widest">
              Question {currentQuestionIndex + 1} / {gameData.length}
          </div>
      </div>
  );
};

export default GameArena;