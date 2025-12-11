import React, { useState, useRef, useEffect } from 'react';
import { explainGrammarTopic, checkGrammarPractice, transcribeAudio } from '../services/geminiService';
import { BookOpen, ArrowLeft, Loader2, ChevronRight, Mic, CheckCircle, AlertCircle, Square, PenTool, X, RotateCcw, Play, Library } from 'lucide-react';

const grammarSections = [
  {
    title: "Simple / Indefinite Tenses",
    guj: "સાદો કાળ",
    color: "blue",
    topics: [
      { id: 'simple_present', label: 'Simple Present Tense', guj: 'સાદો વર્તમાનકાળ' },
      { id: 'simple_past', label: 'Simple Past Tense', guj: 'સાદો ભૂતકાળ' },
      { id: 'simple_future', label: 'Simple Future Tense', guj: 'સાદો ભવિષ્યકાળ' },
    ]
  },
  {
    title: "Continuous Tenses",
    guj: "ચાલુ કાળ",
    color: "emerald",
    topics: [
      { id: 'present_continuous', label: 'Present Continuous Tense', guj: 'ચાલુ વર્તમાનકાળ' },
      { id: 'past_continuous', label: 'Past Continuous Tense', guj: 'ચાલુ ભૂતકાળ' },
      { id: 'future_continuous', label: 'Future Continuous Tense', guj: 'ચાલુ ભવિષ્યકાળ' },
    ]
  },
  {
    title: "Perfect Tenses",
    guj: "પૂર્ણ કાળ",
    color: "purple",
    topics: [
      { id: 'present_perfect', label: 'Present Perfect Tense', guj: 'પૂર્ણ વર્તમાનકાળ' },
      { id: 'past_perfect', label: 'Past Perfect Tense', guj: 'પૂર્ણ ભૂતકાળ' },
      { id: 'future_perfect', label: 'Future Perfect Tense', guj: 'પૂર્ણ ભવિષ્યકાળ' },
    ]
  },
  {
    title: "Perfect Continuous Tenses",
    guj: "ચાલુ પૂર્ણ કાળ",
    color: "orange",
    topics: [
      { id: 'present_perfect_continuous', label: 'Present Perfect Continuous Tense', guj: 'ચાલુ પૂર્ણ વર્તમાનકાળ' },
      { id: 'past_perfect_continuous', label: 'Past Perfect Continuous Tense', guj: 'ચાલુ પૂર્ણ ભૂતકાળ' },
      { id: 'future_perfect_continuous', label: 'Future Perfect Continuous Tense', guj: 'ચાલુ પૂર્ણ ભવિષ્યકાળ' },
    ]
  },
  {
    title: "Other Topics",
    guj: "અન્ય",
    color: "slate",
    topics: [
      { id: 'articles', label: 'Articles (A, An, The)', guj: 'આર્ટિકલ્સ' },
      { id: 'prepositions', label: 'Prepositions (In, On, At)', guj: 'નામયોગી અવ્યય' },
      { id: 'pronouns', label: 'Pronouns', guj: 'સર્વનામ' },
      { id: 'active_passive', label: 'Active & Passive Voice', guj: 'કર્તરી અને કર્મણી પ્રયોગ' },
      { id: 'wh_questions', label: 'Wh- Questions', guj: 'પ્રશ્ન પૂછવાની રીત' },
      { id: 'direct_indirect', label: 'Direct & Indirect Speech', guj: 'પ્રત્યક્ષ અને પરોક્ષ રચના' },
    ]
  }
];

const allTopics = grammarSections.flatMap(section => section.topics);

interface PracticeFeedback {
  isCorrect: boolean;
  correctedSentence: string;
  explanationGujarati: string;
}

const GrammarGuide: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<{ id: string, label: string } | null>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Practice Mode State
  const [activeTab, setActiveTab] = useState<'learn' | 'practice'>('learn');
  const [practiceInput, setPracticeInput] = useState('');
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeTab === 'practice' && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [activeTab]);

  const handleTopicClick = async (topic: { id: string, label: string }, stayOnTab = false) => {
    setSelectedTopic(topic);
    if (!stayOnTab) setActiveTab('learn');
    setPracticeInput('');
    setFeedback(null);
    setLoading(true);
    setContent('');
    try {
      const result = await explainGrammarTopic(topic.label);
      setContent(result);
    } catch (e) {
      setContent('Sorry, detailed explanation could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedTopic(null);
    setContent('');
    setPracticeInput('');
    setFeedback(null);
  };

  const handleCheckGrammar = async () => {
    if (!practiceInput.trim() || !selectedTopic) return;
    setIsAnalyzing(true);
    setFeedback(null);
    try {
      const result = await checkGrammarPractice(practiceInput, selectedTopic.label);
      setFeedback(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetPractice = () => {
      setPracticeInput('');
      setFeedback(null);
      if (textareaRef.current) textareaRef.current.focus();
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const mimeType = mediaRecorder.mimeType || 'audio/webm';
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                if (reader.result) {
                    const base64String = (reader.result as string).split(',')[1];
                    setIsTranscribing(true);
                    try {
                        const text = await transcribeAudio(base64String, mimeType, 'English');
                        if (text) {
                            setPracticeInput(prev => {
                                const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
                                return prev + separator + text;
                            });
                        }
                    } catch (e) {
                        console.error("Transcription failed", e);
                    } finally {
                        setIsTranscribing(false);
                        stream.getTracks().forEach(track => track.stop());
                    }
                }
            };
        };

        mediaRecorder.start();
        setIsRecording(true);
        setFeedback(null); 
    } catch (err) {
        console.error("Error accessing mic", err);
        alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const toggleRecording = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      {!selectedTopic ? (
        <>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-600 dark:text-purple-400">
               <Library size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Grammar Guide</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Master English rules with clear Gujarati explanations.</p>
            </div>
          </div>
          
          <div className="space-y-12">
            {grammarSections.map((section) => {
              // Color mapping for gradients
              const colors: Record<string, string> = {
                  blue: 'from-blue-500/10 to-blue-600/5 hover:border-blue-500/50',
                  emerald: 'from-emerald-500/10 to-emerald-600/5 hover:border-emerald-500/50',
                  purple: 'from-purple-500/10 to-purple-600/5 hover:border-purple-500/50',
                  orange: 'from-orange-500/10 to-orange-600/5 hover:border-orange-500/50',
                  slate: 'from-slate-700/10 to-slate-800/5 hover:border-slate-500/50'
              };
              const textColors: Record<string, string> = {
                  blue: 'text-blue-600 dark:text-blue-400',
                  emerald: 'text-emerald-600 dark:text-emerald-400',
                  purple: 'text-purple-600 dark:text-purple-400',
                  orange: 'text-orange-600 dark:text-orange-400',
                  slate: 'text-slate-600 dark:text-slate-400'
              };
              
              const bgClass = colors[section.color] || colors.slate;
              const textClass = textColors[section.color] || textColors.slate;

              return (
                <div key={section.title}>
                  <div className="flex items-baseline gap-3 mb-6 border-b border-slate-200 dark:border-white/5 pb-3">
                      <h3 className={`text-xl font-extrabold ${textClass}`}>{section.title}</h3>
                      <span className="text-slate-500 font-medium">({section.guj})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {section.topics.map((topic) => (
                      <div key={topic.id} className="relative group">
                          <button
                            onClick={() => handleTopicClick(topic)}
                            className={`w-full bg-white dark:bg-slate-900/40 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 transition-all duration-300 text-left h-full flex flex-col justify-between group-hover:scale-[1.02] group-hover:bg-gradient-to-br ${bgClass} group-hover:shadow-xl`}
                          >
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">{topic.label}</h4>
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{topic.guj}</p>
                            </div>
                            <div className="mt-6 flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition">Start Lesson</span>
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-slate-900 transition shadow-lg">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                          </button>
                          {/* Quick Practice Button overlay */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleTopicClick(topic, true); setActiveTab('practice'); }}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-950 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                            title="Quick Practice"
                          >
                            <PenTool size={16} />
                          </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="animate-fade-in">
          <button 
            onClick={clearSelection}
            className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 transition"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to All Topics
          </button>

          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/5 overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-slate-50/50 dark:bg-white/[0.02] p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">{selectedTopic.label}</h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">AI Grammar Tutor</p>
              </div>
              <div className="flex bg-slate-200 dark:bg-slate-950 p-1 rounded-xl border border-slate-300 dark:border-white/5">
                <button 
                  onClick={() => setActiveTab('learn')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'learn' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <BookOpen size={16} /> Learn (શીખો)
                </button>
                <button 
                  onClick={() => setActiveTab('practice')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'practice' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}
                >
                  <PenTool size={16} /> Practice (મહાવરો)
                </button>
              </div>
            </div>
            
            <div className="p-8 md:p-12 flex-1">
              {activeTab === 'learn' ? (
                loading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-6">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Creating your personalized lesson...</p>
                  </div>
                ) : (
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    {content.split('\n').map((line, i) => {
                      if (line.match(/^#+\s/) || line.match(/^\d+\.\s+\*\*/) || line.startsWith('**') || line.startsWith('##')) {
                         const cleanLine = line.replace(/^#+\s/, '').replace(/^\d+\.\s+\*\*/, '').replace(/\*\*$/, '').replace(/\*\*/g, '').replace(/##/g, '');
                         return <h3 key={i} className="text-xl font-bold text-slate-800 dark:text-white mt-10 mb-4 flex items-center gap-3"><div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>{cleanLine}</h3>;
                      } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                         return <li key={i} className="ml-6 text-slate-600 dark:text-slate-300 mb-2 list-disc marker:text-indigo-500 pl-2">{line.replace(/^[-*]\s*/, '')}</li>;
                      } else if (line.trim() === '') {
                         return <div key={i} className="h-4"></div>;
                      }
                      return <p key={i} className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{line}</p>;
                    })}
                  </div>
                )
              ) : (
                /* PRACTICE MODE */
                <div className="space-y-8 max-w-3xl mx-auto">
                   {/* Topic Switcher */}
                   <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Topic</span>
                      <select 
                        value={selectedTopic.id}
                        onChange={(e) => {
                          const newTopic = allTopics.find(t => t.id === e.target.value);
                          if (newTopic) handleTopicClick(newTopic, true);
                        }}
                        className="text-sm border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer font-semibold shadow-sm min-w-[200px]"
                      >
                         {grammarSections.map((section) => (
                           <optgroup key={section.title} label={section.title}>
                             {section.topics.map((t) => (
                               <option key={t.id} value={t.id}>{t.label}</option>
                             ))}
                           </optgroup>
                         ))}
                      </select>
                   </div>

                   <div className="text-center space-y-2 py-6">
                      <h3 className="text-3xl font-bold text-slate-800 dark:text-white">Use "{selectedTopic.label}" in a sentence</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-lg">Speak or type a sentence to check your understanding.</p>
                   </div>

                   <div className="relative group">
                      <textarea
                        ref={textareaRef}
                        value={practiceInput}
                        onChange={(e) => setPracticeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCheckGrammar();
                          }
                        }}
                        placeholder={`Start typing...`}
                        className={`w-full p-6 pr-14 rounded-3xl bg-slate-50 dark:bg-[#020617] border-2 focus:ring-4 outline-none transition-all text-xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 h-48 resize-none shadow-inner ${
                            isRecording 
                            ? 'border-red-500/50 ring-red-500/10 focus:border-red-500' 
                            : 'border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-indigo-500/10'
                        }`}
                      />
                      
                      {practiceInput && (
                         <button
                           onClick={() => setPracticeInput('')}
                           className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition"
                           title="Clear text"
                         >
                           <X size={20} />
                         </button>
                      )}

                      <div className="absolute bottom-4 right-4 flex items-center gap-3">
                        {isRecording && <span className="text-xs text-red-500 font-bold animate-pulse px-2">Recording...</span>}
                        <button
                            onClick={toggleRecording}
                            disabled={isTranscribing}
                            className={`p-3 rounded-xl shadow-sm transition-all duration-200 border ${
                                isRecording 
                                ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' 
                                : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            {isTranscribing ? <Loader2 size={24} className="animate-spin" /> : isRecording ? <Square size={24} fill="currentColor"/> : <Mic size={24} />}
                        </button>
                      </div>
                   </div>

                   {!feedback ? (
                       <button
                         onClick={handleCheckGrammar}
                         disabled={isAnalyzing || !practiceInput.trim()}
                         className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                       >
                         {isAnalyzing ? <Loader2 className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                         Check Grammar
                       </button>
                   ) : (
                       <button
                         onClick={handleResetPractice}
                         className="w-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 text-lg border border-slate-200 dark:border-white/5"
                       >
                         <RotateCcw size={20} />
                         Try Another Sentence
                       </button>
                   )}

                   {feedback && (
                     <div className={`rounded-3xl p-8 border animate-fade-in-up shadow-xl ${feedback.isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30'}`}>
                        <div className="flex gap-5">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${feedback.isCorrect ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                               {feedback.isCorrect ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                           </div>
                           <div className="space-y-2">
                              <h4 className={`font-black text-2xl ${feedback.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {feedback.isCorrect ? 'Perfect!' : 'Needs Improvement'}
                              </h4>
                              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                                {feedback.explanationGujarati}
                              </p>
                              {!feedback.isCorrect && (
                                <div className="mt-4 p-4 bg-white dark:bg-[#020617] rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-inner">
                                   <span className="text-xs font-bold text-rose-500 uppercase tracking-widest block mb-1">Correction</span>
                                   <p className="text-xl font-bold text-slate-800 dark:text-white">{feedback.correctedSentence}</p>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarGuide;