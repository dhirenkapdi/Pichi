
import React, { useState, useEffect } from 'react';
import { generateLessonContent, generateScenarioDrills } from '../services/geminiService';
import { Book, Loader2, CheckCircle, XCircle, Lock, Star, Heart, Check, Zap, MapPin } from 'lucide-react';
import { loadUserStats, updateHearts, addXp, markTopicComplete } from '../utils/progressUtils';

// --- DATA STRUCTURES ---

const units = [
  {
    id: 1,
    title: "Unit 1: The Basics (શરૂઆત)",
    color: "bg-green-500",
    topics: [
      { id: 'intro', label: 'Meeting People', guj: 'નવા લોકોને મળવું', icon: '👋' },
      { id: 'daily', label: 'Daily Routine', guj: 'દિનચર્યા', icon: '📅' },
      { id: 'family', label: 'Family & Friends', guj: 'પરિવાર', icon: '👨‍👩‍👧' },
      { id: 'numbers', label: 'Numbers & Time', guj: 'નંબરો અને સમય', icon: '🔢' },
      { id: 'colors', label: 'Colors & Clothing', guj: 'રંગો અને કપડાં', icon: '🎨' },
      { id: 'home', label: 'My House', guj: 'મારું ઘર', icon: '🏠' },
      { id: 'food', label: 'Food & Drink', guj: 'ખોરાક', icon: '🍔' },
      { id: 'emotions', label: 'Feelings', guj: 'લાગણીઓ', icon: '😊' },
      { id: 'calendar', label: 'Days & Months', guj: 'દિવસો અને મહિના', icon: '📆' },
      { id: 'jobs', label: 'Jobs & Work', guj: 'નોકરી', icon: '👷' },
    ]
  },
  {
    id: 2,
    title: "Unit 2: Getting Around (મુસાફરી)",
    color: "bg-blue-500",
    topics: [
      { id: 'directions', label: 'Asking Directions', guj: 'રસ્તો પૂછવો', icon: '🗺️' },
      { id: 'market', label: 'Market Shopping', guj: 'બજારમાં', icon: '🛍️' },
      { id: 'restaurant', label: 'At the Restaurant', guj: 'રેસ્ટોરન્ટ', icon: '🍕' },
      { id: 'transport', label: 'Transport', guj: 'વાહનવ્યવહાર', icon: '🚌' },
      { id: 'hotel', label: 'Booking a Hotel', guj: 'હોટેલ બુકિંગ', icon: '🏨' },
      { id: 'weather', label: 'Weather Talk', guj: 'હવામાન', icon: '☀️' },
      { id: 'health', label: 'Health & Body', guj: 'સ્વાસ્થ્ય', icon: '🩺' },
      { id: 'bank', label: 'At the Bank', guj: 'બેંક', icon: '💰' },
      { id: 'post', label: 'Post Office', guj: 'પોસ્ટ ઓફિસ', icon: '📮' },
      { id: 'places', label: 'Sightseeing', guj: 'જોવાલાયક સ્થળો', icon: '📷' },
    ]
  },
  {
    id: 3,
    title: "Unit 3: Professional Life (વ્યાવસાયિક જીવન)",
    color: "bg-purple-500",
    topics: [
      { id: 'office', label: 'Office Talk', guj: 'ઓફિસની વાતચીત', icon: '💼' },
      { id: 'interview', label: 'Job Interview', guj: 'ઇન્ટરવ્યુ', icon: '👔' },
      { id: 'email', label: 'Emails', guj: 'ઈમેલ', icon: '📧' },
      { id: 'phone', label: 'Phone Calls', guj: 'ફોન પર વાત', icon: '📞' },
      { id: 'meeting', label: 'Meetings', guj: 'મીટિંગ', icon: '🤝' },
      { id: 'negotiation', label: 'Negotiation', guj: 'વાટાઘાટો', icon: '⚖️' },
      { id: 'presentation', label: 'Presentations', guj: 'પ્રસ્તુતિ', icon: '📊' },
      { id: 'problems', label: 'Problem Solving', guj: 'સમસ્યા નિવારણ', icon: '💡' },
      { id: 'socializing', label: 'Networking', guj: 'નેટવર્કિંગ', icon: '🥂' },
      { id: 'news', label: 'Current Events', guj: 'વર્તમાન બનાવો', icon: '📰' },
    ]
  }
];

// Helper to check locks sequentially
const allTopics = units.flatMap(u => u.topics);

// --- MAIN COMPONENT ---

const LessonMode: React.FC = () => {
  const [stats, setStats] = useState(loadUserStats());
  const [view, setView] = useState<'map' | 'lesson' | 'out_of_hearts'>('map');
  const [activeTopic, setActiveTopic] = useState<any>(null);
  const [lessonProgress, setLessonProgress] = useState(0); // 0 = Intro, 1 = Vocab, 2 = Grammar, 3 = Sentence
  
  // Lesson Data
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [drills, setDrills] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Drill State
  const [userAnswer, setUserAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [sentenceWords, setSentenceWords] = useState<string[]>([]);

  useEffect(() => {
    setStats(loadUserStats());
  }, [view]);

  // --- ACTIONS ---

  const handleNodeClick = async (topic: any) => {
    if (stats.hearts <= 0) {
        setView('out_of_hearts');
        return;
    }
    setActiveTopic(topic);
    setView('lesson');
    setLoading(true);
    setLessonProgress(0);
    setFeedback(null);
    setUserAnswer(null);
    setSentenceWords([]);

    // Parallel fetch for speed
    try {
        const [content, drillData] = await Promise.all([
            generateLessonContent(topic.label),
            generateScenarioDrills(topic.label)
        ]);
        setLessonContent(JSON.parse(content));
        setDrills(drillData);
    } catch (e) {
        console.error("Failed to load lesson", e);
    }
    setLoading(false);
  };

  const handleAnswer = (isCorrect: boolean) => {
      if (isCorrect) {
          setFeedback('correct');
          const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3'); 
          audio.volume = 0.5;
          audio.play().catch(() => {});
      } else {
          setFeedback('incorrect');
          updateHearts(-1);
          setStats(prev => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
          const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/assets/soundboard/explode.wav');
          audio.volume = 0.2;
          audio.play().catch(() => {});
      }
  };

  const nextStep = () => {
      setFeedback(null);
      setUserAnswer(null);
      setSentenceWords([]);
      
      if (lessonProgress < 3) {
          setLessonProgress(prev => prev + 1);
      } else {
          // Lesson Complete
          markTopicComplete(activeTopic.id);
          addXp(20);
          setView('map');
          const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/bonus.wav');
          audio.play().catch(() => {});
      }
  };

  const refillHearts = () => {
      updateHearts(5); // Reset to 5
      setStats(prev => ({ ...prev, hearts: 5 }));
      setView('map');
  };

  // --- RENDERERS ---

  return (
    <div className="relative min-h-[500px]">
        {/* MAP VIEW */}
        {view !== 'lesson' && (
            <div className={`max-w-md mx-auto pb-24 relative transition-all duration-300 ${view === 'out_of_hearts' ? 'blur-sm' : ''}`}>
                {/* Sticky Header */}
                <div className="sticky top-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-sm z-20 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center px-4 mb-8">
                    <div className="flex items-center gap-2">
                        <Heart className="text-rose-500 fill-rose-500" />
                        <span className="font-bold text-rose-500">{stats.hearts}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-yellow-500">{stats.xp}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-12 px-4 relative">
                    {/* Center Line for Path */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-slate-200 dark:bg-slate-800 -translate-x-1/2 z-0 rounded-full"></div>

                    {units.map((unit, unitIdx) => (
                        <div key={unit.id} className="relative z-10">
                            <div className={`mb-8 p-4 rounded-2xl ${unit.color} text-white shadow-lg shadow-black/10 flex items-center justify-between`}>
                                <div>
                                    <h3 className="font-extrabold text-lg">{unit.title}</h3>
                                    <p className="text-white/80 text-sm">{unit.topics.length} Lessons</p>
                                </div>
                                <Book className="opacity-50"/>
                            </div>
                            
                            <div className="flex flex-col gap-8">
                                {unit.topics.map((topic, topicIdx) => {
                                    // Calculate zig-zag position
                                    const globalIdx = (unitIdx * 10) + topicIdx;
                                    const pos = globalIdx % 4; // 0, 1, 2, 3
                                    
                                    let alignClass = "justify-center";
                                    if (pos === 1) alignClass = "justify-start pl-8";
                                    if (pos === 3) alignClass = "justify-end pr-8";
                                    
                                    // Sequential Locking Logic
                                    const currentTopicGlobalIndex = allTopics.findIndex(t => t.id === topic.id);
                                    const previousTopic = currentTopicGlobalIndex > 0 ? allTopics[currentTopicGlobalIndex - 1] : null;
                                    
                                    const isCompleted = stats.completedTopicIds && stats.completedTopicIds.includes(topic.id);
                                    
                                    // Locked if previous topic is NOT complete AND it's not the very first topic
                                    const isLocked = previousTopic && (!stats.completedTopicIds || !stats.completedTopicIds.includes(previousTopic.id));

                                    return (
                                        <div key={topic.id} className={`flex ${alignClass}`}>
                                            <div className="relative group">
                                                <button 
                                                    onClick={() => !isLocked && handleNodeClick(topic)}
                                                    className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-all border-b-[6px] active:border-b-0 active:translate-y-2 relative z-10 
                                                    ${isLocked 
                                                        ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 cursor-not-allowed' 
                                                        : isCompleted 
                                                            ? 'bg-yellow-400 border-yellow-600 text-white' // Gold for completed
                                                            : 'bg-green-500 border-green-700 text-white animate-bounce-subtle' // Green for active
                                                    }`}
                                                >
                                                    {isLocked ? <Lock size={24} /> : (isCompleted ? <Check size={32} /> : topic.icon)}
                                                </button>
                                                
                                                {/* Status Indicator Dot (Gold star if done) */}
                                                {isCompleted && (
                                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm z-20">
                                                        <Star size={12} fill="currentColor" />
                                                    </div>
                                                )}
                                                
                                                {/* Label Tooltip */}
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-500 shadow-sm border border-slate-100 dark:border-slate-700 z-20">
                                                    {topic.label}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {/* End of Path */}
                    <div className="flex justify-center pt-8 pb-16">
                        <div className="bg-slate-100 dark:bg-slate-900 px-8 py-4 rounded-3xl border-2 border-slate-200 dark:border-slate-800 text-center">
                            <p className="font-bold text-slate-400 mb-2">More units coming soon!</p>
                            <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                                <MapPin fill="currentColor" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* OUT OF HEARTS MODAL */}
        {view === 'out_of_hearts' && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-scale-in relative border border-slate-200 dark:border-slate-800">
                     <button onClick={() => setView('map')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><XCircle size={24}/></button>
                     <div className="text-8xl mb-6 animate-pulse">💔</div>
                     <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Out of Hearts!</h2>
                     <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">You need hearts to start a lesson. Take a break or refill them now.</p>
                     <button 
                       onClick={refillHearts}
                       className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-extrabold border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all w-full"
                     >
                         REFILL HEARTS (FREE)
                     </button>
                 </div>
             </div>
        )}

        {/* LESSON PAGE VIEW */}
        {view === 'lesson' && (
              <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[500px] h-[600px] relative animate-fade-in">
                  {/* Window Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10 h-16">
                      <button onClick={() => setView('map')} className="text-slate-400 hover:text-slate-600 transition p-1"><XCircle size={24}/></button>
                      <div className="flex-1 mx-4 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 transition-all duration-500 ease-out" style={{ width: `${(lessonProgress / 4) * 100}%` }}></div>
                      </div>
                      <div className="flex items-center gap-1 text-rose-500 font-black text-lg">
                          <Heart fill="currentColor" size={20} /> {stats.hearts}
                      </div>
                  </div>
                  
                  {/* Step Indicator */}
                  <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest py-1 bg-slate-50 dark:bg-slate-950/50">
                     Step {lessonProgress + 1} of 4
                  </div>

                  {loading ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                          <Loader2 size={32} className="animate-spin mb-2 text-green-500" />
                          <p className="font-bold text-sm">Loading...</p>
                      </div>
                  ) : !lessonContent || !drills ? (
                      <div className="flex-1 flex items-center justify-center text-rose-500 font-bold">Error loading data.</div>
                  ) : (
                      /* Content Body - Using flex to distribute space naturally without scrolling */
                      <div className="flex-1 p-4 flex flex-col justify-center relative">
                          {lessonProgress === 0 && (
                              <div className="space-y-4 text-center animate-fade-in-up">
                                  <h2 className="text-xl font-black text-slate-800 dark:text-white">Introduction</h2>
                                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-left">
                                      <p className="text-base leading-relaxed text-slate-700 dark:text-slate-300 mb-4 font-medium">{lessonContent.intro_gujarati.length > 200 ? lessonContent.intro_gujarati.substring(0, 200) + "..." : lessonContent.intro_gujarati}</p>
                                      <div className="space-y-2">
                                          {lessonContent.key_phrases?.slice(0,3).map((p:any, i:number) => (
                                              <div key={i} className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                                  <span className="font-bold text-sm text-slate-800 dark:text-white">{p.english}</span>
                                                  <span className="text-slate-500 text-xs">{p.gujarati}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* DRILL 1: VOCAB */}
                          {lessonProgress === 1 && drills.vocab_drills?.[0] && (
                              <div className="animate-fade-in-up w-full">
                                   <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Select the correct meaning</h2>
                                   <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                                       <p className="text-base font-bold text-slate-700 dark:text-slate-200">{drills.vocab_drills[0].question}</p>
                                   </div>
                                   <div className="grid gap-2">
                                       {drills.vocab_drills[0].options.map((opt:string, i:number) => (
                                           <button 
                                            key={i}
                                            disabled={feedback !== null}
                                            onClick={() => {
                                                const isCorrect = opt === drills.vocab_drills[0].correct;
                                                setUserAnswer(opt);
                                                handleAnswer(isCorrect);
                                            }}
                                            className={`p-3 rounded-xl border-2 border-b-4 text-left font-bold text-sm transition-all ${
                                                userAnswer === opt 
                                                ? feedback === 'correct' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-rose-100 border-rose-500 text-rose-700'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                           >
                                               {opt}
                                           </button>
                                       ))}
                                   </div>
                              </div>
                          )}

                          {/* DRILL 2: GRAMMAR */}
                          {lessonProgress === 2 && drills.grammar_drills?.[0] && (
                              <div className="animate-fade-in-up w-full">
                                   <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Fill in the blank</h2>
                                   <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 mb-6 text-center shadow-inner">
                                       <p className="text-xl font-bold mb-2 text-slate-800 dark:text-white">{drills.grammar_drills[0].sentence.replace('_____', '_______')}</p>
                                       <p className="text-slate-400 text-xs font-bold">{drills.grammar_drills[0].hint}</p>
                                   </div>
                                   {!feedback ? (
                                       <div className="flex flex-col gap-3">
                                           <input 
                                            type="text" 
                                            placeholder="Type answer here..."
                                            className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-900/30 font-bold text-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                           />
                                       </div>
                                   ) : (
                                       <div className={`p-3 rounded-xl font-bold text-center text-sm ${feedback === 'correct' ? 'text-green-700 bg-green-100 border border-green-200' : 'text-rose-700 bg-rose-100 border border-rose-200'}`}>
                                           {feedback === 'correct' ? "Correct!" : `Correct answer: ${drills.grammar_drills[0].correct}`}
                                       </div>
                                   )}
                              </div>
                          )}

                          {/* DRILL 3: SENTENCE */}
                          {lessonProgress === 3 && drills.sentence_builder?.[0] && (
                              <div className="animate-fade-in-up w-full">
                                   <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Translate this sentence</h2>
                                   <div className="mb-6">
                                        <p className="text-slate-500 dark:text-slate-400 font-medium text-base italic">"{drills.sentence_builder[0].gujarati || drills.sentence_builder[0].correct}"</p>
                                   </div>
                                   
                                   <div className="min-h-[60px] bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 mb-6 flex flex-wrap gap-2 p-2 items-center justify-center">
                                       {sentenceWords.length === 0 && <span className="text-slate-300 text-sm font-bold">Select words below</span>}
                                       {sentenceWords.map((word, i) => (
                                           <button key={i} onClick={() => setSentenceWords(prev => prev.filter((_, idx) => idx !== i))} className="bg-white dark:bg-slate-700 px-3 py-2 rounded-lg font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-600 shadow-sm text-xs hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition">{word}</button>
                                       ))}
                                   </div>

                                   <div className="flex flex-wrap gap-2 justify-center">
                                       {drills.sentence_builder[0].jumbled.map((word:string, i:number) => {
                                           const usedCount = sentenceWords.filter(w => w === word).length;
                                           const totalCount = drills.sentence_builder[0].jumbled.filter((w:string) => w === word).length;
                                           if(usedCount >= totalCount) return <div key={i} className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-transparent select-none border border-transparent text-sm">placeholder</div>;
                                           
                                           return (
                                            <button key={i} onClick={() => setSentenceWords(prev => [...prev, word])} className="bg-white dark:bg-slate-800 px-3 py-2 rounded-lg font-bold border border-slate-200 dark:border-slate-700 border-b-2 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-0 active:translate-y-1 transition text-slate-700 dark:text-slate-200 text-sm">{word}</button>
                                           )
                                       })}
                                   </div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Integrated Footer - Pinned to bottom of the card, visible always without scroll */}
                  <div className={`p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 ${feedback ? (feedback === 'correct' ? 'bg-green-50 dark:bg-green-900/10' : 'bg-rose-50 dark:bg-rose-900/10') : 'bg-white dark:bg-slate-900'}`}>
                        {feedback ? (
                           <div className="flex items-center justify-between gap-3 animate-fade-in-up">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white border shrink-0 ${feedback === 'correct' ? 'border-green-200 text-green-600' : 'border-rose-200 text-rose-600'}`}>
                                        {feedback === 'correct' ? <Check size={16} /> : <XCircle size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-extrabold text-sm ${feedback === 'correct' ? 'text-green-700' : 'text-rose-700'}`}>{feedback === 'correct' ? 'Nice!' : 'Solution:'}</h3>
                                        {feedback === 'incorrect' && (
                                            <p className="text-xs font-medium text-rose-600 truncate">
                                                {lessonProgress === 1 && drills.vocab_drills[0].correct}
                                                {lessonProgress === 2 && drills.grammar_drills[0].correct}
                                                {lessonProgress === 3 && drills.sentence_builder[0].correct}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={nextStep} className={`shrink-0 px-6 py-2.5 rounded-xl font-extrabold text-sm text-white border-b-4 active:border-b-0 active:translate-y-1 transition-all ${feedback === 'correct' ? 'bg-green-500 border-green-700 hover:bg-green-600' : 'bg-rose-500 border-rose-700 hover:bg-rose-600'}`}>
                                    CONTINUE
                                </button>
                           </div>
                        ) : (
                            /* Initial Action Button (Check/Continue) */
                             lessonProgress === 0 ? (
                                <button 
                                  onClick={() => setLessonProgress(1)} 
                                  className="w-full py-3 bg-green-500 text-white font-extrabold rounded-xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 hover:bg-green-600 transition text-sm"
                                >
                                    CONTINUE
                                </button>
                             ) : lessonProgress === 2 ? (
                                <button 
                                    onClick={() => handleAnswer(userAnswer?.toLowerCase().trim() === drills.grammar_drills[0].correct.toLowerCase().trim())}
                                    disabled={!userAnswer}
                                    className="w-full py-3 bg-green-500 text-white font-extrabold rounded-xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 hover:bg-green-600 transition text-sm"
                                >
                                    CHECK
                                </button>
                             ) : lessonProgress === 3 ? (
                                <button 
                                    onClick={() => {
                                        const correctText = drills.sentence_builder[0].correct;
                                        const tokensRegex = /[\w']+|[.,!?;]/g;
                                        const correctTokens = correctText.match(tokensRegex) || correctText.split(' ');
                                        
                                        let isCorrect = false;
                                        if (sentenceWords.length === correctTokens.length) {
                                            isCorrect = sentenceWords.every((w, i) => w === correctTokens[i]);
                                        }
                                        handleAnswer(isCorrect);
                                    }}
                                    disabled={sentenceWords.length === 0}
                                    className="w-full py-3 bg-green-500 text-white font-extrabold rounded-xl border-b-4 border-green-700 active:border-b-0 active:translate-y-1 disabled:opacity-50 hover:bg-green-600 transition text-sm"
                                >
                                    CHECK
                                </button>
                             ) : null
                        )}
                  </div>
              </div>
        )}
    </div>
  );
};

export default LessonMode;
