import React, { useState, useRef, useEffect } from 'react';
import { explainGrammarTopic, checkGrammarPractice, transcribeAudio } from '../services/geminiService';
import { BookOpen, ArrowLeft, Loader2, ChevronRight, Mic, CheckCircle, AlertCircle, Square, PenTool, X, RotateCcw, Play } from 'lucide-react';

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
    color: "green",
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
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {!selectedTopic ? (
        <>
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Grammar Guide</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Master English rules with clear Gujarati explanations.</p>
          </div>
          
          <div className="space-y-12">
            {grammarSections.map((section) => {
              const headerColor = section.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : section.color === 'green' ? 'text-emerald-600 dark:text-emerald-400' : section.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : section.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400';
              const borderColor = section.color === 'blue' ? 'border-blue-200' : section.color === 'green' ? 'border-emerald-200' : section.color === 'purple' ? 'border-purple-200' : section.color === 'orange' ? 'border-orange-200' : 'border-slate-200';
              
              return (
                <div key={section.title}>
                  <div className="flex items-baseline gap-3 mb-5 border-b pb-2 border-slate-100 dark:border-slate-800">
                      <h3 className={`text-xl font-extrabold ${headerColor}`}>{section.title}</h3>
                      <span className="text-slate-400 font-medium">({section.guj})</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {section.topics.map((topic) => (
                      <div key={topic.id} className="relative group">
                          <button
                            onClick={() => handleTopicClick(topic)}
                            className={`w-full bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left h-full flex flex-col justify-between group-hover:border-${section.color}-200`}
                          >
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-white text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">{topic.label}</h4>
                              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{topic.guj}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest group-hover:text-orange-400 transition">View Lesson</span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-orange-600 group-hover:text-white transition">
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                          </button>
                          {/* Quick Practice Button overlay */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleTopicClick(topic, true); setActiveTab('practice'); }}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition opacity-0 group-hover:opacity-100"
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
            className="flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 mb-6 transition"
          >
            <ArrowLeft size={18} className="mr-2" /> Back to All Topics
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px] flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{selectedTopic.label}</h2>
                <p className="text-orange-600 dark:text-orange-400 font-medium">AI Grammar Tutor</p>
              </div>
              <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setActiveTab('learn')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'learn' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <BookOpen size={16} /> Learn (શીખો)
                </button>
                <button 
                  onClick={() => setActiveTab('practice')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'practice' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <PenTool size={16} /> Practice (મહાવરો)
                </button>
              </div>
            </div>
            
            <div className="p-8 md:p-10 flex-1">
              {activeTab === 'learn' ? (
                loading ? (
                  <div className="flex flex-col items-center justify-center h-64 space-y-6">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Creating your personalized lesson...</p>
                  </div>
                ) : (
                  <div className="prose prose-lg prose-slate dark:prose-invert max-w-none">
                    {content.split('\n').map((line, i) => {
                      if (line.match(/^#+\s/) || line.match(/^\d+\.\s+\*\*/) || line.startsWith('**') || line.startsWith('##')) {
                         const cleanLine = line.replace(/^#+\s/, '').replace(/^\d+\.\s+\*\*/, '').replace(/\*\*$/, '').replace(/\*\*/g, '').replace(/##/g, '');
                         return <h3 key={i} className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4 flex items-center gap-2"><div className="w-2 h-6 bg-orange-500 rounded-full"></div>{cleanLine}</h3>;
                      } else if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                         return <li key={i} className="ml-6 text-slate-700 dark:text-slate-300 mb-2 list-disc marker:text-orange-400">{line.replace(/^[-*]\s*/, '')}</li>;
                      } else if (line.trim() === '') {
                         return <div key={i} className="h-4"></div>;
                      }
                      return <p key={i} className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{line}</p>;
                    })}
                  </div>
                )
              ) : (
                /* PRACTICE MODE */
                <div className="space-y-8 max-w-3xl mx-auto">
                   {/* Topic Switcher inside Practice Mode */}
                   <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Current Topic</span>
                      <select 
                        value={selectedTopic.id}
                        onChange={(e) => {
                          const newTopic = allTopics.find(t => t.id === e.target.value);
                          if (newTopic) handleTopicClick(newTopic, true);
                        }}
                        className="text-sm border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-white focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 outline-none cursor-pointer font-semibold shadow-sm min-w-[200px]"
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

                   <div className="text-center space-y-2 py-4">
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Use "{selectedTopic.label}" in a sentence</h3>
                      <p className="text-slate-500 dark:text-slate-400">Speak or type a sentence to check your understanding.</p>
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
                        className={`w-full p-6 pr-14 rounded-3xl bg-white dark:bg-slate-900 border-2 focus:ring-4 outline-none transition-all text-xl text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 h-48 resize-none shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-600 ${
                            isRecording 
                            ? 'border-rose-400 ring-rose-100 dark:ring-rose-900/30 focus:border-rose-500 focus:ring-rose-100' 
                            : 'border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-50 dark:focus:ring-orange-900/30'
                        }`}
                      />
                      
                      {practiceInput && (
                         <button
                           onClick={() => setPracticeInput('')}
                           className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 transition"
                           title="Clear text"
                         >
                           <X size={20} />
                         </button>
                      )}

                      <div className="absolute bottom-4 right-4 flex items-center gap-3">
                        {isRecording && <span className="text-xs text-rose-500 font-bold animate-pulse px-2">Recording...</span>}
                        <button
                            onClick={toggleRecording}
                            disabled={isTranscribing}
                            className={`p-3 rounded-xl shadow-sm transition-all duration-200 ${
                                isRecording 
                                ? 'bg-rose-500 text-white animate-pulse' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400'
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
                         className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-lg hover:bg-black dark:hover:bg-slate-200 transition disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                       >
                         {isAnalyzing ? <Loader2 className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                         Check Grammar
                       </button>
                   ) : (
                       <button
                         onClick={handleResetPractice}
                         className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2 text-lg"
                       >
                         <RotateCcw size={20} />
                         Try Another Sentence
                       </button>
                   )}

                   {feedback && (
                     <div className={`rounded-3xl p-8 border animate-fade-in-up shadow-lg ${feedback.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 shadow-emerald-100 dark:shadow-none' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 shadow-rose-100 dark:shadow-none'}`}>
                        <div className="flex gap-5">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${feedback.isCorrect ? 'bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'}`}>
                               {feedback.isCorrect ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                           </div>
                           <div className="space-y-2">
                              <h4 className={`font-black text-2xl ${feedback.isCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                                {feedback.isCorrect ? 'Perfect!' : 'Needs Improvement'}
                              </h4>
                              <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                                {feedback.explanationGujarati}
                              </p>
                              {!feedback.isCorrect && (
                                <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-rose-100 dark:border-rose-800 shadow-sm">
                                   <span className="text-xs font-bold text-rose-400 uppercase tracking-widest block mb-1">Correction</span>
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