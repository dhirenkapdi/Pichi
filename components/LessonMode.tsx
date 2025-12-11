import React, { useState, useEffect } from 'react';
import { generateLessonContent, generateScenarioDrills } from '../services/geminiService';
import { Book, Loader2, CheckCircle, XCircle, Lock, Star, Heart, Check, Zap, MapPin, Volume2 } from 'lucide-react';
import { loadUserStats, updateHearts, addXp, markTopicComplete } from '../utils/progressUtils';

// --- DATA STRUCTURES ---

const units = [
  {
    id: 1,
    title: "Unit 1: The Basics (શરૂઆત)",
    color: "from-emerald-600 to-teal-600",
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
    color: "from-blue-600 to-indigo-600",
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
    color: "from-purple-600 to-pink-600",
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
        setLessonContent(content);
        setDrills(drillData);
    } catch (e) {
        console.error("Failed to load lesson", e);
    }
    setLoading(false);
  };

  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'en-US';
          window.speechSynthesis.speak(utterance);
      }
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
    <div className="relative min-h-[500px] animate-fade-in">
        {/* MAP VIEW */}
        {view !== 'lesson' && (
            <div className={`max-w-md mx-auto pb-24 relative transition-all duration-300 ${view === 'out_of_hearts' ? 'blur-sm grayscale' : ''}`}>
                
                {/* Header Stats Bar */}
                <div className="sticky top-0 z-30 mb-8 pt-2">
                    <div className="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200 dark:border-white/10 flex justify-between items-center px-6">
                        <div className="flex items-center gap-2">
                            <Heart className="text-rose-500 fill-rose-500 animate-pulse" />
                            <span className="font-black text-rose-500 text-lg">{stats.hearts}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-yellow-400" />
                            <span className="font-black text-yellow-500 text-lg">{stats.xp}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-16 px-4 relative">
                    {/* Path Line */}
                    <svg className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none" style={{overflow: 'visible'}}>
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="12" strokeLinecap="round" />
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" className="text-slate-300 dark:text-slate-700/50" strokeWidth="4" strokeDasharray="20 20" strokeLinecap="round" />
                    </svg>

                    {units.map((unit, unitIdx) => (
                        <div key={unit.id} className="relative z-10">
                            <div className={`mb-10 p-6 rounded-3xl bg-gradient-to-br ${unit.color} text-white shadow-xl flex items-center justify-between border border-white/10`}>
                                <div>
                                    <h3 className="font-extrabold text-xl">{unit.title}</h3>
                                    <p className="text-white/80 text-sm font-medium mt-1">{unit.topics.length} Lessons</p>
                                </div>
                                <Book className="opacity-40 w-8 h-8"/>
                            </div>
                            
                            <div className="flex flex-col gap-10">
                                {unit.topics.map((topic, topicIdx) => {
                                    // Calculate zig-zag position
                                    const globalIdx = (unitIdx * 10) + topicIdx;
                                    const pos = globalIdx % 4; // 0, 1, 2, 3
                                    
                                    let alignClass = "justify-center";
                                    if (pos === 1) alignClass = "justify-start pl-10";
                                    if (pos === 3) alignClass = "justify-end pr-10";
                                    
                                    // Sequential Locking Logic
                                    const currentTopicGlobalIndex = allTopics.findIndex(t => t.id === topic.id);
                                    const previousTopic = currentTopicGlobalIndex > 0 ? allTopics[currentTopicGlobalIndex - 1] : null;
                                    
                                    const isCompleted = stats.completedTopicIds && stats.completedTopicIds.includes(topic.id);
                                    const isLocked = previousTopic && (!stats.completedTopicIds || !stats.completedTopicIds.includes(previousTopic.id));

                                    return (
                                        <div key={topic.id} className={`flex ${alignClass}`}>
                                            <div className="relative group">
                                                <button 
                                                    onClick={() => !isLocked && handleNodeClick(topic)}
                                                    className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-3xl shadow-xl transition-all relative z-10 duration-300
                                                    ${isLocked 
                                                        ? 'bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
                                                        : isCompleted 
                                                            ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-yellow-300 text-white shadow-yellow-900/50' 
                                                            : 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-emerald-300 text-white shadow-emerald-900/50 animate-bounce-subtle hover:scale-110' 
                                                    }`}
                                                >
                                                    {isLocked ? <Lock size={24} /> : (isCompleted ? <Check size={32} strokeWidth={4} /> : topic.icon)}
                                                </button>
                                                
                                                {isCompleted && (
                                                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-white p-1.5 rounded-full border-2 border-white dark:border-[#020617] shadow-sm z-20 animate-pulse">
                                                        <Star size={14} fill="currentColor" />
                                                    </div>
                                                )}
                                                
                                                {/* Label Tooltip */}
                                                {!isLocked && (
                                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-lg border border-slate-200 dark:border-slate-700 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {topic.label}
                                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-t border-l border-slate-200 dark:border-slate-700"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                    
                    {/* End of Path */}
                    <div className="flex justify-center pt-8 pb-16">
                        <div className="bg-slate-100 dark:bg-slate-900 px-8 py-4 rounded-3xl border border-slate-200 dark:border-slate-800 text-center opacity-70">
                            <p className="font-bold text-slate-500 mb-2">More units coming soon!</p>
                            <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                                <MapPin fill="currentColor" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* OUT OF HEARTS MODAL */}
        {view === 'out_of_hearts' && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                <div className="bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center animate-scale-in relative border border-slate-200 dark:border-slate-800">
                     <button onClick={() => setView('map')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white"><XCircle size={24}/></button>
                     <div className="text-8xl mb-6 animate-pulse">💔</div>
                     <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Out of Hearts!</h2>
                     <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">You need hearts to start a lesson. Take a break or refill them now.</p>
                     <button 
                       onClick={refillHearts}
                       className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-extrabold border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all w-full shadow-lg shadow-blue-900/50"
                     >
                         REFILL HEARTS (FREE)
                     </button>
                 </div>
             </div>
        )}

        {/* LESSON PAGE VIEW */}
        {view === 'lesson' && (
              <div className="w-full max-w-2xl mx-auto bg-white dark:bg-[#0f172a] rounded-[32px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[calc(100vh-180px)] min-h-[450px] relative animate-fade-in">
                  {/* Window Header */}
                  <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#0f172a] z-10 h-20">
                      <button onClick={() => setView('map')} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5"><XCircle size={28}/></button>
                      
                      {/* Progress Bar */}
                      <div className="flex-1 mx-6 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(16,185,129,0.5)]" style={{ width: `${(lessonProgress / 4) * 100}%` }}></div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-rose-500 font-black text-xl">
                          <Heart fill="currentColor" size={24} className="animate-pulse" /> {stats.hearts}
                      </div>
                  </div>
                  
                  {/* Step Indicator */}
                  <div className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest py-1.5 bg-slate-50 dark:bg-[#020617]/50">
                     Step {lessonProgress + 1} of 4
                  </div>

                  {loading ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                          <Loader2 size={48} className="animate-spin mb-4 text-emerald-500" />
                          <p className="font-bold text-lg animate-pulse">Generating Lesson...</p>
                      </div>
                  ) : !lessonContent || !drills ? (
                      <div className="flex-1 flex items-center justify-center text-rose-500 font-bold">Error loading data.</div>
                  ) : (
                      /* Content Body - Scalable with scroll */
                      <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar relative">
                          {lessonProgress === 0 && (
                              <div className="space-y-6 animate-fade-in-up my-auto">
                                  <h2 className="text-2xl font-black text-slate-800 dark:text-white">Introduction</h2>
                                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-left">
                                      <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6 font-medium">{lessonContent.intro_gujarati}</p>
                                      <div className="space-y-3">
                                          {lessonContent.key_phrases?.slice(0,3).map((p:any, i:number) => (
                                              <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-[#020617] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors">
                                                  <div className="flex items-center gap-3">
                                                     <button onClick={() => speakText(p.english)} className="p-2 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition"><Volume2 size={18}/></button>
                                                     <span className="font-bold text-base text-slate-800 dark:text-white">{p.english}</span>
                                                  </div>
                                                  <span className="text-slate-500 text-sm font-medium">{p.gujarati}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* DRILL 1: VOCAB */}
                          {lessonProgress === 1 && drills.vocab_drills?.[0] && (
                              <div className="animate-fade-in-up w-full my-auto">
                                   <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Select the correct meaning</h2>
                                   <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 mb-6 flex items-center gap-4 shadow-sm">
                                       <button onClick={() => speakText(drills.vocab_drills[0].question)} className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:scale-110 transition"><Volume2 size={24}/></button>
                                       <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{drills.vocab_drills[0].question}</p>
                                   </div>
                                   <div className="grid gap-3">
                                       {drills.vocab_drills[0].options.map((opt:string, i:number) => (
                                           <button 
                                            key={i}
                                            disabled={feedback !== null}
                                            onClick={() => {
                                                const isCorrect = opt === drills.vocab_drills[0].correct;
                                                setUserAnswer(opt);
                                                handleAnswer(isCorrect);
                                            }}
                                            className={`p-4 rounded-2xl border-2 border-b-4 text-left font-bold text-base transition-all ${
                                                userAnswer === opt 
                                                ? feedback === 'correct' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/30 border-rose-500 text-rose-600 dark:text-rose-400'
                                                : 'bg-white dark:bg-[#020617] border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
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
                              <div className="animate-fade-in-up w-full my-auto">
                                   <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Fill in the blank</h2>
                                   <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border-2 border-slate-100 dark:border-slate-800 mb-8 text-center relative">
                                       <button onClick={() => speakText(drills.grammar_drills[0].sentence.replace('_____', 'blank'))} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-500"><Volume2 size={20}/></button>
                                       <p className="text-2xl font-black mb-4 text-slate-800 dark:text-white leading-relaxed">{drills.grammar_drills[0].sentence.replace('_____', '_______')}</p>
                                       <div className="inline-block bg-white dark:bg-[#020617] px-4 py-1 rounded-full text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800">{drills.grammar_drills[0].hint}</div>
                                   </div>
                                   {!feedback ? (
                                       <div className="flex flex-col gap-3">
                                           <input 
                                            type="text" 
                                            placeholder="Type answer here..."
                                            className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 font-bold text-xl bg-white dark:bg-[#020617] text-slate-800 dark:text-white text-center transition-all"
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleAnswer(userAnswer?.toLowerCase().trim() === drills.grammar_drills[0].correct.toLowerCase().trim());
                                            }}
                                           />
                                       </div>
                                   ) : (
                                       <div className={`p-4 rounded-2xl font-bold text-center text-base border-2 ${feedback === 'correct' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-800' : 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/20 border-rose-500 dark:border-rose-800'}`}>
                                           {feedback === 'correct' ? "Correct!" : `Correct answer: ${drills.grammar_drills[0].correct}`}
                                       </div>
                                   )}
                              </div>
                          )}

                          {/* DRILL 3: SENTENCE */}
                          {lessonProgress === 3 && drills.sentence_builder?.[0] && (
                              <div className="animate-fade-in-up w-full my-auto">
                                   <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Translate this sentence</h2>
                                   <div className="mb-8 flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <button onClick={() => speakText(drills.sentence_builder[0].correct)} className="p-3 bg-white dark:bg-slate-800 rounded-full text-indigo-500 dark:text-indigo-400 shadow-sm hover:scale-105 transition shrink-0"><Volume2 size={24}/></button>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium text-lg leading-relaxed pt-1">"{drills.sentence_builder[0].gujarati || drills.sentence_builder[0].correct}"</p>
                                   </div>
                                   
                                   <div className="min-h-[80px] bg-slate-100 dark:bg-[#020617] rounded-2xl border-2 border-slate-200 dark:border-slate-800 mb-8 flex flex-wrap gap-2 p-4 items-center justify-start content-start shadow-inner">
                                       {sentenceWords.length === 0 && <span className="text-slate-400 dark:text-slate-600 text-base font-bold w-full text-center py-4">Tap words below to build</span>}
                                       {sentenceWords.map((word, i) => (
                                           <button key={i} onClick={() => setSentenceWords(prev => prev.filter((_, idx) => idx !== i))} className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl font-bold text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900/50 transition animate-scale-in">{word}</button>
                                       ))}
                                   </div>

                                   <div className="flex flex-wrap gap-3 justify-center">
                                       {drills.sentence_builder[0].jumbled.map((word:string, i:number) => {
                                           const usedCount = sentenceWords.filter(w => w === word).length;
                                           const totalCount = drills.sentence_builder[0].jumbled.filter((w:string) => w === word).length;
                                           if(usedCount >= totalCount) return <div key={i} className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl text-transparent select-none border border-transparent text-sm h-[42px] w-[60px] opacity-50"></div>;
                                           
                                           return (
                                            <button key={i} onClick={() => setSentenceWords(prev => [...prev, word])} className="bg-white px-4 py-2 rounded-xl font-bold border border-slate-200 border-b-4 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition text-slate-900 text-sm shadow-sm">{word}</button>
                                           )
                                       })}
                                   </div>
                              </div>
                          )}
                      </div>
                  )}

                  {/* Integrated Footer - Pinned to bottom of the card */}
                  <div className={`p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 ${feedback ? (feedback === 'correct' ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-rose-50 dark:bg-rose-900/10') : 'bg-white dark:bg-[#0f172a]'}`}>
                        {feedback ? (
                           <div className="flex items-center justify-between gap-4 animate-fade-in-up">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${feedback === 'correct' ? 'border-emerald-500 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'border-rose-500 dark:border-rose-800 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}>
                                        {feedback === 'correct' ? <Check size={20} strokeWidth={3} /> : <XCircle size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-black text-base ${feedback === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{feedback === 'correct' ? 'Nicely done!' : 'Correct Solution:'}</h3>
                                        {feedback === 'incorrect' && (
                                            <p className="text-sm font-bold text-rose-500 dark:text-rose-300 truncate">
                                                {lessonProgress === 1 && drills.vocab_drills[0].correct}
                                                {lessonProgress === 2 && drills.grammar_drills[0].correct}
                                                {lessonProgress === 3 && drills.sentence_builder[0].correct}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={nextStep} className={`shrink-0 px-8 py-3 rounded-xl font-extrabold text-sm text-white border-b-4 active:border-b-0 active:translate-y-1 transition-all shadow-lg ${feedback === 'correct' ? 'bg-emerald-600 border-emerald-800 hover:bg-emerald-500 shadow-emerald-900/50' : 'bg-rose-600 border-rose-800 hover:bg-rose-500 shadow-rose-900/50'}`}>
                                    CONTINUE
                                </button>
                           </div>
                        ) : (
                            /* Initial Action Button (Check/Continue) */
                             lessonProgress === 0 ? (
                                <button 
                                  onClick={() => setLessonProgress(1)} 
                                  className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-xl border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 hover:bg-emerald-500 transition text-base shadow-lg shadow-emerald-900/30"
                                >
                                    CONTINUE
                                </button>
                             ) : lessonProgress === 2 ? (
                                <button 
                                    onClick={() => handleAnswer(userAnswer?.toLowerCase().trim() === drills.grammar_drills[0].correct.toLowerCase().trim())}
                                    disabled={!userAnswer}
                                    className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-xl border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:border-b-0 hover:bg-emerald-500 transition text-base shadow-lg shadow-emerald-900/30"
                                >
                                    CHECK
                                </button>
                             ) : lessonProgress === 3 ? (
                                <button 
                                    onClick={() => {
                                        const correctText = drills.sentence_builder[0].correct;
                                        // Improved token matching that handles punctuation better
                                        const tokensRegex = /[\w']+|[.,!?;]/g;
                                        const correctTokens = correctText.match(tokensRegex) || correctText.split(' ');
                                        
                                        let isCorrect = false;
                                        if (sentenceWords.length === correctTokens.length) {
                                            isCorrect = sentenceWords.every((w, i) => w === correctTokens[i]);
                                        }
                                        handleAnswer(isCorrect);
                                    }}
                                    disabled={sentenceWords.length === 0}
                                    className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-xl border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:border-b-0 hover:bg-emerald-500 transition text-base shadow-lg shadow-emerald-900/30"
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