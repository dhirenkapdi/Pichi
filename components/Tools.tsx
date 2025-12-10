import React, { useState, useRef, useEffect } from 'react';
import { translateText, explainDoubt, transcribeAudio, generateVocabulary, checkVocabularyUsage } from '../services/geminiService';
import { ArrowRightLeft, HelpCircle, Send, Loader2, Mic, Square, Book, RefreshCw, Volume2, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Copy, Sparkles } from 'lucide-react';

const Tools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'translate' | 'doubt' | 'vocab'>('translate');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState<'toEng' | 'toGuj'>('toEng');
  
  // Audio Recording
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Vocabulary
  const [vocabList, setVocabList] = useState<any[]>([]);
  const [vocabIndex, setVocabIndex] = useState(0);
  const [loadingVocab, setLoadingVocab] = useState(false);
  const [vocabPracticeInput, setVocabPracticeInput] = useState('');
  const [vocabFeedback, setVocabFeedback] = useState<any | null>(null);
  const [checkingVocab, setCheckingVocab] = useState(false);

  useEffect(() => {
    setInput('');
    setOutput('');
    setDirection('toEng');
  }, [activeTab]);

  const handleAction = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput('');
    
    try {
      if (activeTab === 'translate') {
        const result = await translateText(input, direction === 'toEng');
        setOutput(result);
      } else {
        const result = await explainDoubt(input);
        setOutput(result);
      }
    } catch (e) {
      setOutput("Error processing request.");
    } finally {
      setLoading(false);
    }
  };

  const loadVocabulary = async () => {
    setLoadingVocab(true);
    const words = await generateVocabulary();
    setVocabList(words);
    setVocabIndex(0);
    setVocabFeedback(null);
    setVocabPracticeInput('');
    setLoadingVocab(false);
  };

  const handleCheckVocab = async () => {
     if (!vocabPracticeInput.trim() || vocabList.length === 0) return;
     setCheckingVocab(true);
     setVocabFeedback(null);
     try {
        const currentWord = vocabList[vocabIndex].word;
        const result = await checkVocabularyUsage(currentWord, vocabPracticeInput);
        setVocabFeedback(result);
     } catch(e) {
        console.error(e);
     } finally {
        setCheckingVocab(false);
     }
  };

  const nextWord = () => {
     if (vocabIndex < vocabList.length - 1) {
         setVocabIndex(prev => prev + 1);
         setVocabPracticeInput('');
         setVocabFeedback(null);
     }
  };

  const prevWord = () => {
     if (vocabIndex > 0) {
         setVocabIndex(prev => prev - 1);
         setVocabPracticeInput('');
         setVocabFeedback(null);
     }
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
                        let lang = 'English';
                        if (activeTab === 'translate' && direction === 'toEng') lang = 'Gujarati';
                        if (activeTab === 'doubt') lang = 'Gujarati';
                        if (activeTab === 'vocab') lang = 'English';

                        const text = await transcribeAudio(base64String, mimeType, lang);
                        if (text) {
                            if (activeTab === 'vocab') {
                                setVocabPracticeInput(prev => (prev + ' ' + text).trim());
                            } else {
                                setInput(prev => (prev + ' ' + text).trim());
                            }
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
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Tools & Utilities</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Translate, clarify doubts, and build vocabulary.</p>
        </div>

      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 inline-flex w-full md:w-auto overflow-x-auto">
        <button 
          onClick={() => setActiveTab('translate')}
          className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'translate' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <ArrowRightLeft size={18} /> Translator
        </button>
        <button 
          onClick={() => setActiveTab('doubt')}
          className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'doubt' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <HelpCircle size={18} /> Doubts
        </button>
        <button 
          onClick={() => setActiveTab('vocab')}
          className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'vocab' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <Book size={18} /> Vocabulary
        </button>
      </div>

      <div className="min-h-[500px]">
        {/* TRANSLATOR TAB */}
        {activeTab === 'translate' && (
          <div className="grid md:grid-cols-2 gap-6 h-full">
            {/* Input Side */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col relative h-full">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{direction === 'toEng' ? 'GUJARATI' : 'ENGLISH'}</span>
                    <button 
                        onClick={() => setDirection(prev => prev === 'toEng' ? 'toGuj' : 'toEng')}
                        className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 p-2 rounded-lg transition"
                    >
                        <ArrowRightLeft size={18} />
                    </button>
                </div>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={direction === 'toEng' ? "તમારું વાક્ય અહીં લખો..." : "Type here..."}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-lg text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 h-64 p-0"
                />
                <div className="mt-auto flex justify-between items-center">
                    <button
                        onClick={toggleRecording}
                        disabled={isTranscribing}
                        className={`p-3 rounded-full shadow-sm transition-all ${
                            isRecording 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400'
                        }`}
                    >
                        {isTranscribing ? <Loader2 size={20} className="animate-spin" /> : isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                    </button>
                    <button 
                        onClick={handleAction}
                        disabled={loading || !input.trim()}
                        className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>

            {/* Output Side */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col h-full relative">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{direction === 'toEng' ? 'ENGLISH' : 'GUJARATI'}</span>
                {output ? (
                    <>
                        <p className="text-xl text-slate-800 dark:text-white leading-relaxed font-medium">{output}</p>
                        <button className="absolute bottom-6 right-6 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition" onClick={() => navigator.clipboard.writeText(output)}>
                            <Copy size={20} />
                        </button>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                        <ArrowRightLeft size={48} className="mb-2 opacity-20" />
                        <p>Translation will appear here</p>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* DOUBT TAB */}
        {activeTab === 'doubt' && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">
             <div className="text-center mb-8">
                <div className="bg-orange-100 dark:bg-orange-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600 dark:text-orange-400">
                    <HelpCircle size={32} />
                </div>
                <h3 className="font-bold text-2xl text-slate-800 dark:text-white">Ask a Doubt</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Ask grammar questions in Gujarati. We'll explain clearly.</p>
             </div>
            
            <div className="relative mb-6">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="દા.ત. 'to' અને 'for' વચ્ચે શું તફાવત છે?"
                  className="w-full p-6 pb-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 focus:border-orange-400 outline-none resize-none h-40 text-lg transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
                />
                <button
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                    className={`absolute bottom-4 right-4 p-2.5 rounded-xl shadow-sm transition-all duration-200 ${
                        isRecording 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                    {isTranscribing ? <Loader2 size={20} className="animate-spin text-orange-500" /> : isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                </button>
            </div>
            
            <button 
              onClick={handleAction}
              disabled={loading || !input.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
              Explain to Me (મને સમજાવો)
            </button>

            {output && (
              <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl border border-indigo-100 dark:border-indigo-800 animate-fade-in-up">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Explanation</h4>
                <p className="text-indigo-900 dark:text-indigo-100 text-lg leading-relaxed whitespace-pre-wrap">{output}</p>
              </div>
            )}
          </div>
        )}

        {/* VOCABULARY TAB */}
        {activeTab === 'vocab' && (
           <div className="animate-fade-in max-w-2xl mx-auto">
               {vocabList.length === 0 ? (
                   <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center space-y-6">
                       <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-full inline-block">
                           <Book className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                       </div>
                       <div className="space-y-2">
                           <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Expand Your Vocabulary</h3>
                           <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">Get 5 new intermediate words with definitions and examples daily.</p>
                       </div>
                       <button 
                         onClick={loadVocabulary}
                         disabled={loadingVocab}
                         className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition flex items-center gap-2 mx-auto active:scale-95"
                       >
                         {loadingVocab ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                         Generate Words
                       </button>
                   </div>
               ) : (
                   <div className="space-y-8">
                       {/* Flashcard */}
                       <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none overflow-hidden relative border border-slate-100 dark:border-slate-800 group">
                           <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                           <button onClick={loadVocabulary} className="absolute top-6 right-6 text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition" title="Refresh list">
                               <RefreshCw size={20} />
                           </button>
                           
                           <div className="p-10 text-center">
                               <h2 className="text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{vocabList[vocabIndex].word}</h2>
                               <p className="text-indigo-500 dark:text-indigo-400 font-medium text-xl flex items-center justify-center gap-2 mb-8">
                                  /{vocabList[vocabIndex].pronunciation}/
                                  <button className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-400 transition" title="Pronounce">
                                     <Volume2 size={18} />
                                  </button>
                               </p>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
                                   <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Gujarati</span>
                                       <p className="text-slate-800 dark:text-white font-bold text-xl">{vocabList[vocabIndex].gujaratiMeaning}</p>
                                   </div>
                                   <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Definition</span>
                                       <p className="text-slate-700 dark:text-slate-300 font-medium leading-snug">{vocabList[vocabIndex].englishDefinition}</p>
                                   </div>
                               </div>
                               
                               <div className="bg-indigo-50 dark:bg-indigo-900/30 p-5 rounded-2xl text-indigo-900 dark:text-indigo-200 font-medium italic text-lg leading-relaxed relative">
                                   <span className="absolute top-2 left-3 text-4xl text-indigo-200 dark:text-indigo-800 opacity-50 font-serif">"</span>
                                   {vocabList[vocabIndex].exampleSentence}
                                   <span className="absolute bottom-[-10px] right-4 text-4xl text-indigo-200 dark:text-indigo-800 opacity-50 font-serif">"</span>
                               </div>
                           </div>

                           {/* Navigation */}
                           <div className="bg-slate-50 dark:bg-slate-800 p-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-700">
                               <button 
                                 onClick={prevWord} 
                                 disabled={vocabIndex === 0}
                                 className="p-3 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-30 transition text-slate-600 dark:text-slate-400"
                               >
                                   <ChevronLeft size={24} />
                               </button>
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                   {vocabIndex + 1} / {vocabList.length}
                               </span>
                               <button 
                                 onClick={nextWord} 
                                 disabled={vocabIndex === vocabList.length - 1}
                                 className="p-3 rounded-xl hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-30 transition text-slate-600 dark:text-slate-400"
                               >
                                   <ChevronRight size={24} />
                               </button>
                           </div>
                       </div>

                       {/* Practice Section */}
                       <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                           <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Sparkles size={16} className="text-indigo-500"/> Practice this word</h4>
                           <div className="relative mb-4">
                                <input 
                                    type="text"
                                    value={vocabPracticeInput}
                                    onChange={(e) => setVocabPracticeInput(e.target.value)}
                                    placeholder={`Write a sentence using "${vocabList[vocabIndex].word}"...`}
                                    className="w-full p-4 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 focus:border-indigo-500 outline-none transition text-slate-800 dark:text-white placeholder:text-slate-400"
                                />
                                <button
                                    onClick={toggleRecording}
                                    disabled={isTranscribing}
                                    className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
                                        isRecording 
                                        ? 'bg-red-500 text-white animate-pulse' 
                                        : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600 border border-slate-200 dark:border-slate-700'
                                    }`}
                                >
                                    {isTranscribing ? <Loader2 size={16} className="animate-spin" /> : isRecording ? <Square size={16} fill="currentColor" /> : <Mic size={16} />}
                                </button>
                           </div>
                           
                           {!vocabFeedback ? (
                               <button 
                                 onClick={handleCheckVocab}
                                 disabled={checkingVocab || !vocabPracticeInput}
                                 className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold py-3 rounded-xl hover:bg-black dark:hover:bg-slate-200 transition flex items-center justify-center gap-2"
                               >
                                 {checkingVocab ? <Loader2 size={18} className="animate-spin" /> : "Check Usage"}
                               </button>
                           ) : (
                               <div className={`p-5 rounded-2xl flex gap-4 animate-fade-in-up ${vocabFeedback.isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800'}`}>
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${vocabFeedback.isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'}`}>
                                     {vocabFeedback.isCorrect ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                   </div>
                                   <div>
                                       <p className={`font-bold text-lg ${vocabFeedback.isCorrect ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
                                           {vocabFeedback.isCorrect ? 'Correct Usage!' : 'Needs Correction'}
                                       </p>
                                       <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">{vocabFeedback.feedback}</p>
                                       <button onClick={() => {setVocabFeedback(null); setVocabPracticeInput('');}} className="text-xs font-bold underline mt-2 opacity-60 hover:opacity-100 dark:text-slate-300">Try Again</button>
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>
               )}
           </div>
        )}
      </div>
    </div>
  );
};

export default Tools;