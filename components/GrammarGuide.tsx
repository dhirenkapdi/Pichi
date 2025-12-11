import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, AlertCircle, ChevronRight, Play, RotateCcw, Award, ArrowLeft, Sparkles, Send, BrainCircuit, Search, GraduationCap, Library, X, ArrowRight as ArrowRightIcon, PlusCircle, Loader2 } from 'lucide-react';
import { grammarCourseData, GrammarChapter, GrammarExercise } from './GrammarCourseData';
import { explainGrammarTopic, checkGrammarPractice, generateGrammarExercises } from '../services/geminiService';
import { addXp } from '../utils/progressUtils';

// --- SUB-COMPONENT: GRAMMAR REFERENCE (TENSE CARDS) ---
const GrammarReference: React.FC = () => {
    const [selectedTense, setSelectedTense] = useState<any | null>(null);
    
    // Practice Mode State
    const [isPracticing, setIsPracticing] = useState(false);
    const [loadingPractice, setLoadingPractice] = useState(false);
    const [exercises, setExercises] = useState<GrammarExercise[]>([]);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [results, setResults] = useState<Record<string, boolean>>({});
    const [showResults, setShowResults] = useState(false);

    const tenses = [
        // PRESENT
        {
            name: "Simple Present",
            category: "Present",
            usage: "Habits, facts, daily routines.",
            gujaratiExplanation: "આ કાળનો ઉપયોગ રોજિંદી ક્રિયાઓ, ટેવો, સનાતન સત્યો અને કાયમી પરિસ્થિતિઓ દર્શાવવા માટે થાય છે. તે સૂચવે છે કે કોઈ ક્રિયા નિયમિતપણે થાય છે અથવા સામાન્ય સત્ય છે.",
            explanation: "The Simple Present tense is used to describe habits, unchanging situations, general truths, and fixed arrangements. It tells us that an action happens regularly or is permanently true.",
            structure: "Subject + V1 (s/es)",
            examples: ["I play football.", "She drinks coffee.", "The sun rises in the east."],
            color: "from-blue-500 to-cyan-500"
        },
        {
            name: "Present Continuous",
            category: "Present",
            usage: "Actions happening right now.",
            gujaratiExplanation: "આ કાળનો ઉપયોગ બોલતી વખતે જે ક્રિયા ચાલુ હોય તે દર્શાવવા માટે થાય છે. તે હમણાં બની રહેલી અથવા કામચલાઉ પરિસ્થિતિઓનું વર્ણન કરે છે.",
            explanation: "The Present Continuous (or Progressive) tense is used to describe an action that is currently happening at the moment of speaking, or for temporary situations happening around now.",
            structure: "Subject + is/am/are + V-ing",
            examples: ["I am eating now.", "She is sleeping.", "They are running."],
            color: "from-emerald-500 to-teal-500"
        },
        {
            name: "Present Perfect",
            category: "Present",
            usage: "Action finished recently or experience.",
            gujaratiExplanation: "આ કાળ ભૂતકાળ અને વર્તમાનને જોડે છે. તે એવી ક્રિયા દર્શાવે છે જે હમણાં જ પૂરી થઈ છે અથવા ભૂતકાળમાં પૂરી થઈ ગઈ છે પણ તેની અસર વર્તમાનમાં હજુ વર્તાય છે.",
            explanation: "The Present Perfect tense connects the past with the present. It describes an action that happened at an unspecified time in the past, or an action that began in the past and continues to the present.",
            structure: "Subject + has/have + V3",
            examples: ["I have finished my work.", "She has visited London."],
            color: "from-orange-500 to-amber-500"
        },
        {
            name: "Present Perfect Continuous",
            category: "Present",
            usage: "Action started in past and continues to present.",
            gujaratiExplanation: "આ કાળ દર્શાવે છે કે કોઈ ક્રિયા ભૂતકાળમાં શરૂ થઈ હતી અને વર્તમાનમાં પણ ચાલુ છે. તે ક્રિયાના સમયગાળા પર ભાર મૂકે છે.",
            explanation: "The Present Perfect Continuous tense shows that something started in the past and is continuing at the present time. It emphasizes the duration of the action.",
            structure: "Subject + has/have + been + V-ing",
            examples: ["I have been waiting for 2 hours.", "It has been raining since morning."],
            color: "from-yellow-500 to-orange-600"
        },
        // PAST
        {
            name: "Simple Past",
            category: "Past",
            usage: "Actions finished in the past.",
            gujaratiExplanation: "આ કાળનો ઉપયોગ ભૂતકાળમાં ચોક્કસ સમયે પૂરી થયેલી ક્રિયાઓ દર્શાવવા માટે થાય છે. તે વીતી ગયેલા સમયની વાત કરે છે.",
            explanation: "The Simple Past tense is used to talk about a completed action in a time before now. The time of the action can be in the recent past or the distant past.",
            structure: "Subject + V2",
            examples: ["I played cricket yesterday.", "He bought a car."],
            color: "from-rose-500 to-pink-500"
        },
        {
            name: "Past Continuous",
            category: "Past",
            usage: "Action going on at a specific time in past.",
            gujaratiExplanation: "આ કાળ દર્શાવે છે કે ભૂતકાળમાં કોઈ ચોક્કસ સમયે અથવા જ્યારે બીજી કોઈ ઘટના બની ત્યારે કોઈ ક્રિયા ચાલુ હતી.",
            explanation: "The Past Continuous tense describes actions or events in a time before now, which began in the past and were still going on when another event occurred.",
            structure: "Subject + was/were + V-ing",
            examples: ["I was sleeping at 10 PM.", "They were watching TV."],
            color: "from-purple-500 to-indigo-500"
        },
        {
            name: "Past Perfect",
            category: "Past",
            usage: "Action finished before another past action.",
            gujaratiExplanation: "જ્યારે ભૂતકાળમાં બે ક્રિયાઓ બની હોય, ત્યારે જે ક્રિયા પહેલા પૂરી થઈ હતી તે દર્શાવવા માટે પૂર્ણ ભૂતકાળ વપરાય છે.",
            explanation: "The Past Perfect tense expresses an action that occurred before another action in the past. It helps to clarify which event happened first.",
            structure: "Subject + had + V3",
            examples: ["The train had left before I arrived.", "I had already eaten."],
            color: "from-red-600 to-rose-700"
        },
        {
            name: "Past Perfect Continuous",
            category: "Past",
            usage: "Action continuing up to a certain point in past.",
            gujaratiExplanation: "આ કાળ દર્શાવે છે કે ભૂતકાળમાં કોઈ ક્રિયા શરૂ થઈ હતી અને ભૂતકાળના જ કોઈ બીજા સમય સુધી સતત ચાલુ રહી હતી.",
            explanation: "The Past Perfect Continuous tense shows that an action that started in the past continued up until another time in the past.",
            structure: "Subject + had + been + V-ing",
            examples: ["He had been working there for 5 years when he quit.", "It had been snowing all night."],
            color: "from-pink-600 to-fuchsia-700"
        },
        // FUTURE
        {
            name: "Simple Future",
            category: "Future",
            usage: "Future plans or predictions.",
            gujaratiExplanation: "આ કાળનો ઉપયોગ ભવિષ્યમાં થનારી ક્રિયાઓ, આગાહીઓ અથવા બોલતી વખતે લીધેલા નિર્ણયો દર્શાવવા માટે થાય છે.",
            explanation: "The Simple Future tense is used to predict a future event or to express a spontaneous decision made at the moment of speaking.",
            structure: "Subject + will + V1",
            examples: ["I will call you.", "It will rain tomorrow."],
            color: "from-sky-500 to-blue-600"
        },
        {
            name: "Future Continuous",
            category: "Future",
            usage: "Action in progress at a time in future.",
            gujaratiExplanation: "આ કાળ દર્શાવે છે કે ભવિષ્યમાં કોઈ ચોક્કસ સમયે કોઈ ક્રિયા ચાલુ હશે.",
            explanation: "The Future Continuous tense indicates that something will occur in the future and continue for an expected length of time.",
            structure: "Subject + will + be + V-ing",
            examples: ["I will be sleeping at 10 PM.", "We will be traveling next week."],
            color: "from-cyan-500 to-sky-600"
        },
        {
            name: "Future Perfect",
            category: "Future",
            usage: "Action completed by a certain time in future.",
            gujaratiExplanation: "આ કાળ દર્શાવે છે કે ભવિષ્યમાં આપેલા કોઈ ચોક્કસ સમય સુધીમાં કોઈ ક્રિયા પૂરી થઈ ગઈ હશે.",
            explanation: "The Future Perfect tense is used for actions that will be completed before some other point in the future.",
            structure: "Subject + will + have + V3",
            examples: ["I will have finished by 5 PM.", "She will have left by then."],
            color: "from-indigo-500 to-violet-600"
        },
        {
            name: "Future Perfect Continuous",
            category: "Future",
            usage: "Action continuing up to a certain time in future.",
            gujaratiExplanation: "આ કાળ દર્શાવે છે કે ભવિષ્યમાં અમુક સમય સુધી કોઈ ક્રિયા ચાલુ રહેશે. તે ભવિષ્યમાં ક્રિયાના સમયગાળા પર ભાર મૂકે છે.",
            explanation: "The Future Perfect Continuous tense describes an action that will continue up until a point in the future.",
            structure: "Subject + will + have + been + V-ing",
            examples: ["By next year, I will have been working here for 10 years."],
            color: "from-violet-600 to-purple-700"
        }
    ];

    const presentTenses = tenses.filter(t => t.category === "Present");
    const pastTenses = tenses.filter(t => t.category === "Past");
    const futureTenses = tenses.filter(t => t.category === "Future");

    const resetPractice = () => {
        setIsPracticing(false);
        setExercises([]);
        setUserAnswers({});
        setResults({});
        setShowResults(false);
    };

    const handleStartPractice = async () => {
        if (!selectedTense) return;
        setLoadingPractice(true);
        setIsPracticing(true);
        try {
            const data = await generateGrammarExercises(selectedTense.name, selectedTense.usage);
            setExercises(data);
        } catch (error) {
            console.error(error);
        }
        setLoadingPractice(false);
    };

    const checkPracticeAnswers = () => {
        const newResults: Record<string, boolean> = {};
        let correctCount = 0;
        exercises.forEach(ex => {
            const userVal = (userAnswers[ex.id] || '').trim().toLowerCase();
            const isCorrect = ex.correctAnswers.some(ans => ans.toLowerCase() === userVal);
            newResults[ex.id] = isCorrect;
            if (isCorrect) correctCount++;
        });
        setResults(newResults);
        setShowResults(true);
        
        if (correctCount > 0) addXp(correctCount * 5);
        if (correctCount === exercises.length) {
            const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
            audio.play().catch(() => {});
        }
    };

    const handleMoreQuestions = async () => {
        setLoadingPractice(true);
        setExercises([]);
        setShowResults(false);
        setResults({});
        setUserAnswers({});
        try {
            const data = await generateGrammarExercises(selectedTense.name, selectedTense.usage);
            setExercises(data);
        } catch (error) {
            console.error(error);
        }
        setLoadingPractice(false);
    };

    const renderTenseCard = (tense: any) => (
        <button
            key={tense.name}
            onClick={() => { setSelectedTense(tense); resetPractice(); }}
            className="group relative bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 hover:-translate-y-1 hover:shadow-xl transition-all text-left overflow-hidden h-40 flex flex-col"
        >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tense.color} opacity-10 rounded-bl-[40px] group-hover:scale-125 transition-transform duration-500`}></div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">{tense.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-snug">{tense.usage}</p>
            <div className="mt-auto pt-2 flex items-center text-xs font-bold text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors uppercase tracking-wider">
                Learn Rule <ChevronRight size={14} className="ml-1" />
            </div>
        </button>
    );

    const isAllCorrect = exercises.length > 0 && Object.values(results).length === exercises.length && Object.values(results).every(Boolean);

    return (
        <div className="animate-fade-in-up">
            {selectedTense ? (
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden">
                    <div className={`p-8 bg-gradient-to-r ${selectedTense.color} text-white relative`}>
                        <button 
                            onClick={() => setSelectedTense(null)}
                            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                        <span className="inline-block px-3 py-1 rounded-full bg-black/20 text-xs font-bold uppercase tracking-widest mb-2 border border-white/20">
                            {selectedTense.category} Tense
                        </span>
                        <h3 className="text-3xl font-black">{selectedTense.name}</h3>
                        <p className="text-white/90 text-lg mt-2 font-medium">{selectedTense.usage}</p>
                    </div>
                    
                    {!isPracticing ? (
                        <div className="p-8 space-y-8">
                             <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <BookOpen size={16}/> Explanation
                                </h4>
                                <div className="space-y-4">
                                    <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {selectedTense.explanation}
                                    </p>
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                                        <h5 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-2">Gujarati Explanation</h5>
                                        <p className="text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                            {selectedTense.gujaratiExplanation}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Structure</h4>
                                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl font-mono text-lg font-bold text-slate-800 dark:text-slate-200 inline-block border border-slate-200 dark:border-slate-700 w-full text-center">
                                        {selectedTense.structure}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Examples</h4>
                                    <ul className="space-y-3">
                                        {selectedTense.examples.map((ex: string, i: number) => (
                                            <li key={i} className="flex items-center gap-3 text-lg text-slate-700 dark:text-slate-300">
                                                <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                                                {ex}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setSelectedTense(null)}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition"
                                >
                                    Back to All Tenses
                                </button>
                                <button 
                                    onClick={handleStartPractice}
                                    className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition flex items-center justify-center gap-2"
                                >
                                    <Play size={20} fill="currentColor" /> Practice this Tense
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-slate-800 dark:text-white text-xl">Practice Exercises</h3>
                                <button onClick={resetPractice} className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Cancel</button>
                            </div>
                            
                            {loadingPractice ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 size={40} className="animate-spin mb-4 text-purple-500" />
                                    <p>Generating exercises for {selectedTense.name}...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                     {exercises.map((ex, idx) => {
                                        const isCorrect = results[ex.id] === true;
                                        const isWrong = results[ex.id] === false;
                                        
                                        return (
                                            <div key={ex.id} className={`p-4 rounded-2xl border-2 transition-all ${
                                                isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/50' : 
                                                isWrong ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-500/50' : 
                                                'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                                            }`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-3 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        {ex.question && (
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                                {ex.question}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-wrap items-center gap-2 text-xl text-slate-800 dark:text-white font-medium">
                                                            {ex.beforeInput && <span>{ex.beforeInput}</span>}
                                                            <input 
                                                                type="text" 
                                                                value={userAnswers[ex.id] || ''}
                                                                onChange={(e) => {
                                                                    setUserAnswers(prev => ({...prev, [ex.id]: e.target.value}));
                                                                    if (results[ex.id] !== undefined) {
                                                                        const newRes = {...results};
                                                                        delete newRes[ex.id];
                                                                        setResults(newRes);
                                                                    }
                                                                }}
                                                                placeholder={ex.placeholder || "Answer"}
                                                                disabled={isCorrect}
                                                                className={`bg-white dark:bg-slate-900 border-b-2 px-3 py-1 outline-none min-w-[120px] text-center font-bold transition-colors ${
                                                                    isCorrect ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' :
                                                                    isWrong ? 'border-rose-500 text-rose-600 dark:text-rose-400' :
                                                                    'border-slate-300 dark:border-slate-600 focus:border-purple-500'
                                                                }`}
                                                            />
                                                            {ex.afterInput && <span>{ex.afterInput}</span>}
                                                            {isCorrect && <CheckCircle size={20} className="text-emerald-500 ml-2 animate-scale-in" />}
                                                            {isWrong && (
                                                                <div className="flex items-center gap-2 ml-2 animate-scale-in">
                                                                    <AlertCircle size={20} className="text-rose-500" />
                                                                    <span className="text-xs font-bold text-rose-500 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded">Ans: {ex.correctAnswers[0]}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {showResults && (isWrong || isCorrect) && ex.explanation && (
                                                            <div className={`mt-3 text-sm p-3 rounded-lg flex items-start gap-2 animate-fade-in ${
                                                                isCorrect 
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                                                                : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                            }`}>
                                                                <BrainCircuit size={16} className="mt-0.5 shrink-0" />
                                                                <span className="font-medium">{ex.explanation}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                     })}
                                     
                                     <div className="pt-4 flex flex-col items-center gap-4">
                                         {!showResults ? (
                                             <button 
                                                onClick={checkPracticeAnswers}
                                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition"
                                             >
                                                Check Answers
                                             </button>
                                         ) : (
                                            <>
                                                <div className="font-bold text-slate-600 dark:text-slate-300">
                                                    Score: {Object.values(results).filter(Boolean).length} / {exercises.length}
                                                </div>
                                                <div className="w-full flex gap-3">
                                                    {isAllCorrect ? (
                                                        <>
                                                             <button 
                                                                onClick={handleMoreQuestions}
                                                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
                                                             >
                                                                <PlusCircle size={20} /> More Questions
                                                             </button>
                                                             <button 
                                                                onClick={resetPractice}
                                                                className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-4 rounded-xl transition"
                                                             >
                                                                Finish Practice
                                                             </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={checkPracticeAnswers}
                                                            className="flex-1 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
                                                        >
                                                            <RotateCcw size={18} /> Re-check
                                                        </button>
                                                    )}
                                                </div>
                                                {!isAllCorrect && (
                                                     <button onClick={resetPractice} className="text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">Quit Practice</button>
                                                )}
                                            </>
                                         )}
                                     </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Present Tenses */}
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-gradient-to-b from-blue-500 to-teal-500"></span>
                            Present Tenses
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {presentTenses.map(renderTenseCard)}
                        </div>
                    </div>

                    {/* Past Tenses */}
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-gradient-to-b from-rose-500 to-purple-500"></span>
                            Past Tenses
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {pastTenses.map(renderTenseCard)}
                        </div>
                    </div>

                    {/* Future Tenses */}
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-8 rounded-full bg-gradient-to-b from-sky-500 to-indigo-500"></span>
                            Future Tenses
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {futureTenses.map(renderTenseCard)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: STRUCTURED COURSE (BOOK 1) ---
const StructuredCourse: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<GrammarChapter | null>(null);
  const [currentExercises, setCurrentExercises] = useState<GrammarExercise[]>([]);
  const [view, setView] = useState<'list' | 'learn' | 'practice'>('list');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset state when chapter changes
  useEffect(() => {
    if (activeChapter) {
      setUserAnswers({});
      setResults({});
      setShowResults(false);
      // Initialize with default exercises from the chapter
      setCurrentExercises(activeChapter.exercises);
    }
  }, [activeChapter]);

  const handleChapterClick = (chapter: GrammarChapter) => {
    setActiveChapter(chapter);
    setView('learn');
  };

  const handleInputChange = (id: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [id]: value }));
    if (results[id] !== undefined) {
        const newResults = {...results};
        delete newResults[id];
        setResults(newResults);
    }
  };

  const checkAnswers = () => {
    if (!activeChapter || currentExercises.length === 0) return;
    
    const newResults: Record<string, boolean> = {};
    let correctCount = 0;

    currentExercises.forEach(ex => {
      const userVal = (userAnswers[ex.id] || '').trim().toLowerCase();
      const isCorrect = ex.correctAnswers.some(ans => ans.toLowerCase() === userVal);
      newResults[ex.id] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setShowResults(true);

    if (correctCount === currentExercises.length) {
        addXp(50);
        const audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
        audio.play().catch(() => {});
    } else if (correctCount > 0) {
        addXp(10);
    }
  };

  const resetExercises = () => {
      setUserAnswers({});
      setResults({});
      setShowResults(false);
  };

  const handleNextLesson = () => {
      if (!activeChapter) return;
      const currentIndex = grammarCourseData.findIndex(c => c.id === activeChapter.id);
      if (currentIndex < grammarCourseData.length - 1) {
          const nextChapter = grammarCourseData[currentIndex + 1];
          setActiveChapter(nextChapter);
          setCurrentExercises(nextChapter.exercises); // Reset to default static exercises for next chapter
          setView('learn');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          setView('list');
          setActiveChapter(null);
      }
  };

  const handleMoreQuestions = async () => {
      if (!activeChapter) return;
      setLoadingMore(true);
      try {
          // Generate new questions based on current chapter title/description
          const newQuestions = await generateGrammarExercises(activeChapter.title, activeChapter.description);
          
          if (newQuestions && newQuestions.length > 0) {
              // Ensure IDs are unique in case of conflict, though likely safe
              const processedQuestions = newQuestions.map((q: any, idx: number) => ({
                  ...q,
                  id: `gen_${Date.now()}_${idx}`
              }));
              
              setCurrentExercises(processedQuestions);
              // Reset all progress states
              setUserAnswers({});
              setResults({});
              setShowResults(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }
      } catch (e) {
          console.error("Failed to generate more questions", e);
      }
      setLoadingMore(false);
  };

  const isAllCorrect = activeChapter && currentExercises.length > 0 && Object.values(results).length === currentExercises.length && Object.values(results).every(Boolean);

  if (view === 'list' || !activeChapter) {
    return (
      <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up">
            {grammarCourseData.map((chapter) => (
                <button 
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter)}
                    className="flex items-center justify-between bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-purple-500/50 hover:shadow-lg transition-all group text-left"
                >
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-purple-500 transition-colors">{chapter.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{chapter.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <ChevronRight size={20} />
                    </div>
                </button>
            ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => setView('list')} className="flex items-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition font-bold gap-2">
                <ArrowLeft size={20} /> Back to Course
            </button>
            <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
                <button 
                    onClick={() => setView('learn')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${view === 'learn' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                    <BookOpen size={16} /> Learn
                </button>
                <button 
                    onClick={() => setView('practice')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${view === 'practice' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                    <Play size={16} /> Practice
                </button>
            </div>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden min-h-[500px] flex flex-col relative">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/[0.02]">
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">{activeChapter.title}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">{activeChapter.description}</p>
            </div>

            {view === 'learn' ? (
                <div className="p-8 md:p-12 overflow-y-auto">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {typeof activeChapter.rules === 'string' ? (
                            activeChapter.rules.split('\n\n').map((block, i) => (
                                <div key={i} className="mb-6">
                                    {block.split('\n').map((line, j) => {
                                        if (line.startsWith('**')) {
                                            return <h4 key={j} className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">{line.replace(/\*\*/g, '')}</h4>
                                        }
                                        return <p key={j} className="text-slate-700 dark:text-slate-300 leading-relaxed">{line}</p>
                                    })}
                                </div>
                            ))
                        ) : (
                            activeChapter.rules
                        )}
                    </div>
                    <div className="mt-12 flex justify-center">
                        <button 
                            onClick={() => setView('practice')}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 transition flex items-center gap-2"
                        >
                            Start Exercises <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-8 md:p-12 flex flex-col h-full">
                    <div className="space-y-6">
                        {currentExercises.map((ex, idx) => {
                            const isCorrect = results[ex.id] === true;
                            const isWrong = results[ex.id] === false;
                            
                            return (
                                <div key={ex.id} className={`p-4 rounded-2xl border-2 transition-all ${
                                    isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500/50' : 
                                    isWrong ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-500/50' : 
                                    'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                                }`}>
                                    <div className="flex items-start gap-4">
                                        <div className="mt-3 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            {/* Display Question as an Instruction Label if exists */}
                                            {ex.question && (
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                                    {ex.question}
                                                </div>
                                            )}
                                            
                                            <div className="flex flex-wrap items-center gap-2 text-xl text-slate-800 dark:text-white font-medium">
                                                {ex.beforeInput && <span>{ex.beforeInput}</span>}
                                                <input 
                                                    type="text" 
                                                    value={userAnswers[ex.id] || ''}
                                                    onChange={(e) => handleInputChange(ex.id, e.target.value)}
                                                    placeholder={ex.placeholder || "Answer"}
                                                    disabled={isCorrect}
                                                    className={`bg-white dark:bg-slate-900 border-b-2 px-3 py-1 outline-none min-w-[120px] text-center font-bold transition-colors ${
                                                        isCorrect ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' :
                                                        isWrong ? 'border-rose-500 text-rose-600 dark:text-rose-400' :
                                                        'border-slate-300 dark:border-slate-600 focus:border-purple-500'
                                                    }`}
                                                />
                                                {ex.afterInput && <span>{ex.afterInput}</span>}
                                                
                                                {isCorrect && <CheckCircle size={20} className="text-emerald-500 ml-2 animate-scale-in" />}
                                                {isWrong && (
                                                    <div className="flex items-center gap-2 ml-2 animate-scale-in">
                                                        <AlertCircle size={20} className="text-rose-500" />
                                                        <span className="text-xs font-bold text-rose-500 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded">Ans: {ex.correctAnswers[0]}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Explanation Section - Enhanced */}
                                            {showResults && (isWrong || isCorrect) && ex.explanation && (
                                                <div className={`mt-3 text-sm p-3 rounded-lg flex items-start gap-2 animate-fade-in ${
                                                    isCorrect 
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' 
                                                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                                }`}>
                                                    <BrainCircuit size={16} className="mt-0.5 shrink-0" />
                                                    <span className="font-medium">{ex.explanation}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center sticky bottom-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 -mx-4 -mb-4 rounded-b-[32px]">
                        <button 
                            onClick={resetExercises}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold transition"
                        >
                            <RotateCcw size={18} /> Reset
                        </button>
                        
                        {!showResults ? (
                            <button 
                                onClick={checkAnswers}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
                            >
                                <CheckCircle size={20} /> Check Answers
                            </button>
                        ) : (
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-slate-800 dark:text-white hidden md:block">
                                    Score: {Object.values(results).filter(Boolean).length} / {currentExercises.length}
                                </span>
                                
                                {isAllCorrect ? (
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleMoreQuestions}
                                            disabled={loadingMore}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
                                        >
                                            {loadingMore ? <Loader2 className="animate-spin" size={20}/> : <PlusCircle size={20} />}
                                            More Questions
                                        </button>
                                        <button 
                                            onClick={handleNextLesson}
                                            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition flex items-center gap-2 animate-pulse"
                                        >
                                            Next Lesson <ArrowRightIcon size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={checkAnswers}
                                        className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                                    >
                                        <RotateCcw size={18} /> Re-check
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

// --- SUB-COMPONENT: AI GRAMMAR TUTOR ---
const AIGrammarTutor: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Practice
    const [practiceSentence, setPracticeSentence] = useState('');
    const [checkResult, setCheckResult] = useState<any>(null);
    const [checking, setChecking] = useState(false);

    const handleExplain = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setExplanation(null);
        setCheckResult(null);
        setPracticeSentence('');
        
        try {
            const result = await explainGrammarTopic(topic);
            setExplanation(result);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleCheck = async () => {
        if (!practiceSentence.trim()) return;
        setChecking(true);
        try {
            const result = await checkGrammarPractice(practiceSentence, topic);
            setCheckResult(result);
        } catch (error) {
            console.error(error);
        }
        setChecking(false);
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Left Col: Query */}
            <div className="space-y-6">
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl">
                    <div className="mb-6">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Ask the Tutor</h3>
                        <p className="text-slate-500 dark:text-slate-400">Enter any grammar topic (e.g., "Present Perfect", "Active Voice").</p>
                    </div>
                    
                    <div className="relative mb-6">
                        <input 
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
                            placeholder="e.g. Past Continuous Tense"
                            className="w-full p-4 pl-12 rounded-xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition text-slate-800 dark:text-white placeholder:text-slate-400"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                    
                    <button 
                        onClick={handleExplain}
                        disabled={loading || !topic.trim()}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : <>Explain Topic <Sparkles size={18} /></>}
                    </button>
                </div>

                {/* Explanation Output */}
                {explanation && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 animate-fade-in h-fit">
                        <h4 className="font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                            <BrainCircuit size={16}/> AI Explanation
                        </h4>
                        <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                            <p className="whitespace-pre-wrap">{explanation}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Col: Practice */}
            <div className={`transition-all duration-500 ${explanation ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-10 pointer-events-none grayscale'}`}>
                <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Practice</h3>
                        <p className="text-slate-500 dark:text-slate-400">Write a sentence using <strong>{topic || "this topic"}</strong>.</p>
                    </div>

                    <textarea 
                        value={practiceSentence}
                        onChange={(e) => setPracticeSentence(e.target.value)}
                        placeholder="Write your sentence here..."
                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none h-40 transition text-slate-800 dark:text-white placeholder:text-slate-400 text-lg mb-6"
                    />

                    <button 
                        onClick={handleCheck}
                        disabled={checking || !practiceSentence.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 mb-6"
                    >
                        {checking ? 'Checking...' : <>Check Grammar <Send size={18} /></>}
                    </button>

                    {checkResult && (
                        <div className={`p-6 rounded-2xl border-2 animate-scale-in mt-auto ${checkResult.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-500/30'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                {checkResult.isCorrect ? <CheckCircle className="text-emerald-500" /> : <AlertCircle className="text-rose-500" />}
                                <h4 className={`font-black text-lg ${checkResult.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                                    {checkResult.isCorrect ? 'Perfect!' : 'Needs Correction'}
                                </h4>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{checkResult.explanationGujarati}</p>
                            {!checkResult.isCorrect && (
                                <div className="mt-3 pt-3 border-t border-rose-200 dark:border-white/10">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Better Version:</p>
                                    <p className="text-slate-900 dark:text-white font-bold text-lg">{checkResult.correctedSentence}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const GrammarGuide: React.FC = () => {
  const [mode, setMode] = useState<'course' | 'reference' | 'ai'>('course');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
               <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 border border-purple-500/20">
                  <BookOpen size={24} />
               </div>
               Grammar Master
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Master English grammar with structured lessons or AI help.</p>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-white/5 inline-flex flex-wrap w-full md:w-auto gap-1">
            <button 
                onClick={() => setMode('course')}
                className={`flex-1 md:flex-none px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === 'course'
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md border border-slate-800 dark:border-white/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
                <GraduationCap size={18} /> Course
            </button>
            <button 
                onClick={() => setMode('reference')}
                className={`flex-1 md:flex-none px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === 'reference'
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md border border-slate-800 dark:border-white/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
                <Library size={18} /> Tenses
            </button>
            <button 
                onClick={() => setMode('ai')}
                className={`flex-1 md:flex-none px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === 'ai'
                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md border border-slate-800 dark:border-white/10' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
            >
                <Sparkles size={18} /> AI Tutor
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
          {mode === 'course' && <StructuredCourse />}
          {mode === 'reference' && <GrammarReference />}
          {mode === 'ai' && <AIGrammarTutor />}
      </div>
    </div>
  );
};

export default GrammarGuide;
