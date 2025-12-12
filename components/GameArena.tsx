import React, { useState, useEffect, useRef } from 'react';
import { generateGameData, generateCrosswordData } from '../services/geminiService';
import { Gamepad2, Timer, Trophy, Zap, RefreshCw, Loader2, Star, MoveLeft, Check, X, AlertCircle, Grid3X3, Play, Keyboard } from 'lucide-react';
import { addXp } from '../utils/progressUtils';

type Difficulty = 'easy' | 'medium' | 'hard';

const GameArena: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'menu' | 'scramble' | 'rapidFire' | 'crossword'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
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
  const [initialTime, setInitialTime] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Crossword State
  const [crosswordTopic, setCrosswordTopic] = useState('');
  const [crosswordGrid, setCrosswordGrid] = useState<any[][]>([]);
  const [crosswordClues, setCrosswordClues] = useState<any>({ across: [], down: [] });
  const [crosswordUserInputs, setCrosswordUserInputs] = useState<Record<string, string>>({});
  const [crosswordStatus, setCrosswordStatus] = useState<'input_topic' | 'playing'>('input_topic');
  const [crosswordFocus, setCrosswordFocus] = useState<{r: number, c: number, dir: 'across'|'down'} | null>(null);
  const gridInputRefs = useRef<any>({});

  // --- GAME LOGIC ---

  const startGame = async (type: 'scramble' | 'rapidFire' | 'crossword') => {
    setActiveGame(type);
    setScore(0);
    setGameOver(false);
    setFeedback(null);
    setSelectedOption(null);

    if (type === 'crossword') {
        setCrosswordStatus('input_topic');
        setCrosswordTopic('');
        setCrosswordGrid([]);
        setCrosswordClues({ across: [], down: [] });
        return;
    }

    setLoading(true);
    const data = await generateGameData(type, 5, difficulty); // Fetch 5 rounds with selected difficulty
    setGameData(data);
    setCurrentQuestionIndex(0);
    setLoading(false);

    if (type === 'scramble' && data.length > 0) {
        initScrambleRound(data[0]);
    } else if (type === 'rapidFire' && data.length > 0) {
        initRapidFireRound();
    }
  };

  const startCrosswordGame = async () => {
     if (!crosswordTopic.trim()) return;
     setLoading(true);
     try {
         const words = await generateCrosswordData(crosswordTopic);
         if (words && words.length > 0) {
             const layout = generateCrosswordLayout(words);
             if (layout.placedCount < 3) {
                 alert("Could not generate a good puzzle for this topic. Please try a different or broader topic.");
                 setLoading(false);
                 return;
             }
             setCrosswordGrid(layout.grid);
             setCrosswordClues(layout.clues);
             setCrosswordUserInputs({});
             setCrosswordStatus('playing');
             // Set initial focus
             if (layout.clues.across.length > 0) {
                 const first = layout.clues.across[0];
                 setCrosswordFocus({ r: first.row, c: first.col, dir: 'across' });
             } else if (layout.clues.down.length > 0) {
                 const first = layout.clues.down[0];
                 setCrosswordFocus({ r: first.row, c: first.col, dir: 'down' });
             }
         } else {
             alert("Could not fetch words. Try another topic.");
         }
     } catch (e) {
         console.error(e);
         alert("Error generating crossword.");
     } finally {
         setLoading(false);
     }
  };

  const initScrambleRound = (item: any) => {
    const letters = item.scrambled.split('').map((char: string, i: number) => ({ char, id: i }));
    setAvailableLetters(letters);
    setScrambleInput([]);
    setFeedback(null);
  };

  const initRapidFireRound = () => {
      // Set timer based on difficulty
      let time = 10;
      if (difficulty === 'easy') time = 15;
      if (difficulty === 'hard') time = 5;
      
      setInitialTime(time);
      setTimeLeft(time);
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

  const getDifficultyMultiplier = () => {
      if (difficulty === 'easy') return 1;
      if (difficulty === 'hard') return 2;
      return 1.5;
  };

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
          const basePoints = 10;
          const points = Math.round(basePoints * getDifficultyMultiplier());
          setScore(prev => prev + points);
          setFeedback('success');
          setTimeout(() => {
            nextRound();
          }, 1000);
      } else {
          setFeedback('error');
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
          const basePoints = 10;
          // Bonus for speed (more time left = more points)
          const speedBonus = Math.ceil((timeLeft / initialTime) * 5);
          const totalPoints = Math.round((basePoints + speedBonus) * getDifficultyMultiplier());
          
          setScore(prev => prev + totalPoints);
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
      setCrosswordStatus('input_topic');
  };

  // --- CROSSWORD INTERACTION LOGIC ---

  const handleCrosswordCellClick = (r: number, c: number) => {
      if (crosswordFocus && crosswordFocus.r === r && crosswordFocus.c === c) {
          // Toggle direction if clicking same cell
          setCrosswordFocus({ ...crosswordFocus, dir: crosswordFocus.dir === 'across' ? 'down' : 'across' });
      } else {
          setCrosswordFocus({ r, c, dir: crosswordFocus?.dir || 'across' });
      }
  };

  const handleCrosswordKeyDown = (e: React.KeyboardEvent, r: number, c: number) => {
      if (!crosswordFocus) return;
      
      const { dir } = crosswordFocus;
      
      if (e.key === 'Backspace') {
          setCrosswordUserInputs(prev => ({ ...prev, [`${r}-${c}`]: '' }));
          // Move back
          const prevR = dir === 'down' ? r - 1 : r;
          const prevC = dir === 'across' ? c - 1 : c;
          if (crosswordGrid[prevR] && crosswordGrid[prevR][prevC]) {
               setCrosswordFocus({ ...crosswordFocus, r: prevR, c: prevC });
               // Focus element
               const key = `${prevR}-${prevC}`;
               if (gridInputRefs.current[key]) gridInputRefs.current[key].focus();
          }
      } else if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
          setCrosswordUserInputs(prev => ({ ...prev, [`${r}-${c}`]: e.key.toUpperCase() }));
          // Move forward
          const nextR = dir === 'down' ? r + 1 : r;
          const nextC = dir === 'across' ? c + 1 : c;
           if (crosswordGrid[nextR] && crosswordGrid[nextR][nextC]) {
               setCrosswordFocus({ ...crosswordFocus, r: nextR, c: nextC });
               const key = `${nextR}-${nextC}`;
               if (gridInputRefs.current[key]) gridInputRefs.current[key].focus();
          }
      } else if (e.key === 'ArrowRight') {
          if (crosswordGrid[r][c+1]) setCrosswordFocus({...crosswordFocus, c: c+1});
      } else if (e.key === 'ArrowLeft') {
          if (crosswordGrid[r][c-1]) setCrosswordFocus({...crosswordFocus, c: c-1});
      } else if (e.key === 'ArrowDown') {
          if (crosswordGrid[r+1] && crosswordGrid[r+1][c]) setCrosswordFocus({...crosswordFocus, r: r+1});
      } else if (e.key === 'ArrowUp') {
          if (crosswordGrid[r-1] && crosswordGrid[r-1][c]) setCrosswordFocus({...crosswordFocus, r: r-1});
      }
  };

  const checkCrossword = () => {
      let correctCount = 0;
      let totalLetters = 0;
      let isComplete = true;

      crosswordGrid.forEach((row, r) => {
          row.forEach((cell, c) => {
              if (cell) {
                  totalLetters++;
                  const key = `${r}-${c}`;
                  const input = crosswordUserInputs[key] || '';
                  if (input !== cell.char) {
                      isComplete = false;
                  } else {
                      correctCount++;
                  }
              }
          });
      });

      if (isComplete) {
          setFeedback('success');
          setScore(50); // Flat 50 XP for crossword
          setTimeout(endGame, 2000);
      } else {
          // Visual feedback for wrong answers (simple alert for now or implement red text)
          alert(`You have ${correctCount} correct letters out of ${totalLetters}. Incorrect letters are not highlighted to keep it challenging!`);
      }
  };

  const getHint = () => {
       // Reveal a random letter
       const emptyCells = [];
       for (let r = 0; r < crosswordGrid.length; r++) {
           for (let c = 0; c < crosswordGrid[r].length; c++) {
               const cell = crosswordGrid[r][c];
               if (cell) {
                   const key = `${r}-${c}`;
                   if (crosswordUserInputs[key] !== cell.char) {
                       emptyCells.push({r, c, char: cell.char});
                   }
               }
           }
       }
       
       if (emptyCells.length > 0) {
           const rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
           setCrosswordUserInputs(prev => ({ ...prev, [`${rand.r}-${rand.c}`]: rand.char }));
       }
  };


  // --- RENDER ---

  if (activeGame === 'menu') {
      return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Gamepad2 className="text-purple-600" size={32} /> Game Arena
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Learn while you play. Earn XP!</p>
                </div>
                
                {/* Difficulty Selector */}
                <div className="bg-white dark:bg-slate-800 p-1 rounded-xl inline-flex shadow-sm border border-slate-200 dark:border-slate-700">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                difficulty === level
                                ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Word Scramble Card */}
                <button 
                  onClick={() => startGame('scramble')}
                  disabled={loading}
                  className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden text-left h-full"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-purple-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200 dark:shadow-none">
                            <RefreshCw size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Word Scramble</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 text-sm">Unjumble letters to find the word.</p>
                        
                        <div className="flex gap-2 text-xs font-bold text-slate-500 dark:text-slate-500">
                             <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                {difficulty === 'easy' ? '3-4 Letters' : difficulty === 'medium' ? '5-6 Letters' : '7+ Letters'}
                             </span>
                             <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                {getDifficultyMultiplier()}x XP
                             </span>
                        </div>

                        <div className="mt-6 inline-flex items-center text-sm font-bold text-purple-600 dark:text-purple-400">
                             Play Now <MoveLeft className="ml-2 rotate-180" size={16}/>
                        </div>
                    </div>
                </button>

                {/* Rapid Fire Card */}
                <button 
                  onClick={() => startGame('rapidFire')}
                  disabled={loading}
                  className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden text-left h-full"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200 dark:shadow-none">
                            <Timer size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Rapid Fire</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 text-sm">Race against the clock!</p>
                        
                        <div className="flex gap-2 text-xs font-bold text-slate-500 dark:text-slate-500">
                             <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                {difficulty === 'easy' ? '15s Timer' : difficulty === 'medium' ? '10s Timer' : '5s Timer'}
                             </span>
                             <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                {getDifficultyMultiplier()}x XP
                             </span>
                        </div>

                        <div className="mt-6 inline-flex items-center text-sm font-bold text-orange-600 dark:text-orange-400">
                             Play Now <MoveLeft className="ml-2 rotate-180" size={16}/>
                        </div>
                    </div>
                </button>

                {/* Crossword Card */}
                <button 
                  onClick={() => startGame('crossword')}
                  disabled={loading}
                  className="group relative bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden text-left h-full"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition"></div>
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200 dark:shadow-none">
                            <Grid3X3 size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Crossword</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-4 text-sm">Solve puzzles on any topic.</p>
                        
                        <div className="flex gap-2 text-xs font-bold text-slate-500 dark:text-slate-500">
                             <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                Any Topic
                             </span>
                             <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                                50 XP
                             </span>
                        </div>

                        <div className="mt-6 inline-flex items-center text-sm font-bold text-blue-600 dark:text-blue-400">
                             Play Now <MoveLeft className="ml-2 rotate-180" size={16}/>
                        </div>
                    </div>
                </button>
            </div>
            
            {loading && (
                <div className="fixed inset-0 bg-white/80 dark:bg-slate-950/80 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                    <p className="font-bold text-xl text-slate-800 dark:text-white">Generating game...</p>
                </div>
            )}
        </div>
      );
  }

  // --- GAME OVER VIEW ---
  if (gameOver) {
      return (
          <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl text-center border border-slate-200 dark:border-slate-800 animate-scale-in">
              <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500 animate-bounce">
                  <Trophy size={48} fill="currentColor" />
              </div>
              <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Game Over!</h2>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{activeGame === 'crossword' ? 'Crossword' : difficulty + ' mode'}</div>
              <p className="text-slate-500 dark:text-slate-400 mb-8">You scored <span className="text-indigo-600 font-bold">{score} XP</span></p>
              
              <button onClick={exitGame} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl hover:bg-black dark:hover:bg-slate-200 transition">
                  Back to Menu
              </button>
          </div>
      );
  }

  // --- CROSSWORD SPECIFIC UI ---
  if (activeGame === 'crossword') {
      return (
          <div className="max-w-6xl mx-auto min-h-[600px] flex flex-col pb-10">
               <div className="flex justify-between items-center mb-6">
                   <button onClick={exitGame} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 font-bold flex items-center gap-2"><X size={20}/> Quit</button>
                   {crosswordStatus === 'playing' && (
                       <div className="flex items-center gap-4">
                           <button onClick={getHint} className="text-xs font-bold bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition">Hint</button>
                           <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-xl text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-2">
                               <Zap size={18} fill="currentColor" /> {score}
                           </div>
                       </div>
                   )}
               </div>

               {crosswordStatus === 'input_topic' ? (
                   <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center animate-fade-in-up">
                       <Grid3X3 size={64} className="text-blue-500 mb-6" />
                       <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Crossword Generator</h2>
                       <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">Enter a topic (e.g. "Fruit", "Space", "Technology") and we'll build a puzzle for you.</p>
                       
                       <input 
                         type="text" 
                         value={crosswordTopic}
                         onChange={e => setCrosswordTopic(e.target.value)}
                         placeholder="Enter topic (e.g. Fruit)..."
                         onKeyDown={e => e.key === 'Enter' && startCrosswordGame()}
                         className="w-full max-w-sm p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:border-blue-500 outline-none font-bold text-center text-xl mb-4"
                       />
                       
                       <button 
                         onClick={startCrosswordGame}
                         disabled={loading || !crosswordTopic.trim()}
                         className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center gap-2"
                       >
                           {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={20} />}
                           Generate Puzzle
                       </button>
                   </div>
               ) : (
                   <div className="flex flex-col lg:flex-row gap-8 animate-fade-in items-start">
                       {/* THE GRID */}
                       <div className="flex-1 w-full flex flex-col items-center">
                           <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 capitalize">{crosswordTopic}</h2>
                           
                           <div className="bg-black p-3 rounded-lg shadow-2xl border-4 border-slate-800 overflow-x-auto max-w-full">
                               <div 
                                 className="grid gap-[1px] bg-slate-800"
                                 style={{ 
                                     gridTemplateColumns: `repeat(${crosswordGrid[0]?.length || 10}, minmax(0, 1fr))`,
                                     width: 'fit-content'
                                 }}
                               >
                                   {crosswordGrid.map((row, r) => (
                                       row.map((cell, c) => {
                                           const isFocused = crosswordFocus?.r === r && crosswordFocus?.c === c;
                                           return (
                                           <div 
                                             key={`${r}-${c}`} 
                                             className={`w-9 h-9 sm:w-11 sm:h-11 relative flex items-center justify-center ${cell ? (isFocused ? 'bg-yellow-100' : 'bg-white') : 'bg-black'}`}
                                             onClick={() => cell && handleCrosswordCellClick(r, c)}
                                           >
                                               {cell && (
                                                   <>
                                                       {cell.number && <span className="absolute top-0.5 left-0.5 text-[9px] font-bold text-slate-800 leading-none select-none">{cell.number}</span>}
                                                       <input 
                                                         ref={el => gridInputRefs.current[`${r}-${c}`] = el}
                                                         type="text" 
                                                         maxLength={1}
                                                         value={crosswordUserInputs[`${r}-${c}`] || ''}
                                                         onKeyDown={(e) => handleCrosswordKeyDown(e, r, c)}
                                                         onChange={() => {}} // Controlled via KeyDown for movement logic
                                                         className={`w-full h-full text-center font-bold text-lg sm:text-xl uppercase outline-none bg-transparent cursor-pointer caret-transparent ${
                                                             feedback === 'success' ? 'text-green-600' : 'text-slate-900'
                                                         }`}
                                                       />
                                                   </>
                                               )}
                                           </div>
                                       )})
                                   ))}
                               </div>
                           </div>

                           <div className="mt-6 flex gap-4">
                               <button 
                                 onClick={checkCrossword} 
                                 className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
                               >
                                   Check Answers
                               </button>
                           </div>
                           
                           <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
                               <Keyboard size={14}/> Click cell to toggle direction. Use arrows to move.
                           </div>
                       </div>

                       {/* CLUES */}
                       <div className="lg:w-96 w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-[600px] overflow-y-auto custom-scrollbar shadow-sm">
                           <div className="mb-8">
                               <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                                   <MoveLeft size={16} /> Across
                               </h3>
                               <ul className="space-y-3 text-sm">
                                   {crosswordClues.across.map((clue: any) => (
                                       <li 
                                        key={clue.number} 
                                        className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg cursor-pointer transition"
                                        onClick={() => {
                                            setCrosswordFocus({ r: clue.row, c: clue.col, dir: 'across' });
                                            if(gridInputRefs.current[`${clue.row}-${clue.col}`]) gridInputRefs.current[`${clue.row}-${clue.col}`].focus();
                                        }}
                                       >
                                           <span className="font-bold text-blue-500 mr-2">{clue.number}.</span> {clue.text}
                                       </li>
                                   ))}
                               </ul>
                           </div>
                           <div>
                               <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-sm mb-4 border-b border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                                   <MoveLeft size={16} className="-rotate-90"/> Down
                               </h3>
                               <ul className="space-y-3 text-sm">
                                   {crosswordClues.down.map((clue: any) => (
                                       <li 
                                        key={clue.number} 
                                        className="text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg cursor-pointer transition"
                                        onClick={() => {
                                            setCrosswordFocus({ r: clue.row, c: clue.col, dir: 'down' });
                                            if(gridInputRefs.current[`${clue.row}-${clue.col}`]) gridInputRefs.current[`${clue.row}-${clue.col}`].focus();
                                        }}
                                       >
                                           <span className="font-bold text-blue-500 mr-2">{clue.number}.</span> {clue.text}
                                       </li>
                                   ))}
                               </ul>
                           </div>
                       </div>
                   </div>
               )}
          </div>
      );
  }

  // --- ACTIVE GAME VIEW (Scramble / RapidFire) ---
  return (
      <div className="max-w-2xl mx-auto h-[600px] flex flex-col">
          {/* Game Header */}
          <div className="flex justify-between items-center mb-8">
               <button onClick={exitGame} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 font-bold flex items-center gap-2"><X size={20}/> Quit</button>
               <div className="flex items-center gap-4">
                   <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-xl text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-2">
                       <Zap size={18} fill="currentColor" /> {score}
                   </div>
                   {activeGame === 'rapidFire' && (
                       <div className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors duration-300 ${timeLeft < 4 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
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
                          <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{gameData[currentQuestionIndex].hint}</h3>
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
          <div className="text-center py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Question {currentQuestionIndex + 1} / {gameData.length}
          </div>
      </div>
  );
};

// --- CROSSWORD GENERATOR ALGORITHM ---
// Attempts to create a dense crossword grid from a list of words.
// Returns grid 2D array and clue lists.
function generateCrosswordLayout(words: {word: string, clue: string}[]) {
    const GRID_SIZE = 15; // Standard small puzzle size
    // Initialize empty grid
    const createGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    let bestGrid = createGrid();
    let bestPlacedCount = 0;
    let bestClues = { across: [] as any[], down: [] as any[] };
    
    // Sort words by length desc - placing long words first helps structure
    const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);

    // Try a few times with different starting positions to optimize
    for (let attempt = 0; attempt < 10; attempt++) {
        const grid = createGrid();
        const placedWords: any[] = [];
        const clues = { across: [] as any[], down: [] as any[] };
        let placedCount = 0;

        // Place first word in center
        const first = sortedWords[0];
        if (!first) break;

        const startRow = Math.floor(GRID_SIZE / 2);
        const startCol = Math.floor((GRID_SIZE - first.word.length) / 2);
        
        if (canPlace(grid, first.word, startRow, startCol, 'across')) {
           placeWord(grid, first, startRow, startCol, 'across', placedWords, clues);
           placedCount++;
        }

        // Try to place remaining words
        for (let i = 1; i < sortedWords.length; i++) {
            const current = sortedWords[i];
            let placed = false;

            // Iterate through already placed words to find intersection
            // Shuffle placed words array to vary structure
            const shuffledPlaced = [...placedWords].sort(() => Math.random() - 0.5);

            for (const pw of shuffledPlaced) {
                if (placed) break;
                
                // Find matching letter between current word and placed word
                for (let j = 0; j < current.word.length; j++) {
                    if (placed) break;
                    const char = current.word[j];
                    
                    for (let k = 0; k < pw.word.length; k++) {
                        if (pw.word[k] === char) {
                            // pw is placed at (pw.row, pw.col) with pw.direction
                            // We need to place 'current' perpendicular
                            const isPwAcross = pw.direction === 'across';
                            const newDir = isPwAcross ? 'down' : 'across';
                            
                            // Calculate coordinate of the intersection letter on the grid
                            const intersectR = isPwAcross ? pw.row : pw.row + k;
                            const intersectC = isPwAcross ? pw.col + k : pw.col;
                            
                            // Calculate potential start pos for new word
                            const newR = newDir === 'down' ? intersectR - j : intersectR;
                            const newC = newDir === 'across' ? intersectC - j : intersectC;

                            if (canPlace(grid, current.word, newR, newC, newDir)) {
                                placeWord(grid, current, newR, newC, newDir, placedWords, clues);
                                placed = true;
                                placedCount++;
                            }
                        }
                    }
                }
            }
        }

        if (placedCount > bestPlacedCount) {
            bestPlacedCount = placedCount;
            bestGrid = grid;
            bestClues = clues;
        }
    }
    
    // Sort clues by number
    bestClues.across.sort((a, b) => a.number - b.number);
    bestClues.down.sort((a, b) => a.number - b.number);

    return { grid: bestGrid, clues: bestClues, placedCount: bestPlacedCount };
}

function canPlace(grid: any[][], word: string, row: number, col: number, direction: 'across' | 'down') {
    const height = grid.length;
    const width = grid[0].length;

    if (row < 0 || col < 0) return false;
    
    // Check bounds
    if (direction === 'across') {
        if (col + word.length > width) return false;
        // Check cell before and after (must be empty or boundary)
        if (col > 0 && grid[row][col - 1]) return false;
        if (col + word.length < width && grid[row][col + word.length]) return false;
    } else {
        if (row + word.length > height) return false;
        if (row > 0 && grid[row - 1][col]) return false;
        if (row + word.length < height && grid[row + word.length][col]) return false;
    }

    // Check cells and neighbors
    for (let i = 0; i < word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;
        const cell = grid[r][c];

        // 1. Conflict check: if cell is occupied, char must match
        if (cell && cell.char !== word[i]) return false;

        // 2. Neighbor check: if cell is empty, it shouldn't have neighbors perpendicular to direction
        // unless it's the intersection point (which is covered by the loop logic usually)
        if (!cell) {
             if (direction === 'across') {
                 if ((r > 0 && grid[r-1][c]) || (r < height-1 && grid[r+1][c])) return false;
             } else {
                 if ((c > 0 && grid[r][c-1]) || (c < width-1 && grid[r][c+1])) return false;
             }
        }
    }
    return true;
}

function placeWord(grid: any[][], wordObj: any, row: number, col: number, direction: 'across' | 'down', placedList: any[], clues: any) {
    // Determine number
    let num = 0;
    if (grid[row][col] && grid[row][col].number) {
        num = grid[row][col].number;
    } else {
        // Find max number used so far across whole grid to increment
        // Simple heuristic: just look at placedList length or recalculate. 
        // Better: check grid for max number.
        let maxNum = 0;
        grid.forEach(row => row.forEach(cell => {
            if (cell && cell.number > maxNum) maxNum = cell.number;
        }));
        num = maxNum + 1;
    }

    if (direction === 'across') clues.across.push({ number: num, text: wordObj.clue, row, col });
    else clues.down.push({ number: num, text: wordObj.clue, row, col });

    placedList.push({ ...wordObj, row, col, direction });

    for (let i = 0; i < wordObj.word.length; i++) {
        const r = direction === 'across' ? row : row + i;
        const c = direction === 'across' ? col + i : col;
        
        if (!grid[r][c]) {
            grid[r][c] = { char: wordObj.word[i], number: i === 0 ? num : null };
        } else if (i === 0) {
            grid[r][c].number = num; // Add number if this was an existing letter becoming a start
        }
    }
}

export default GameArena;