import React, { useState, useRef, useEffect } from 'react';
import { translateText, explainDoubt, transcribeAudio, generateVocabulary, checkVocabularyUsage } from '../services/geminiService';
import { ArrowRightLeft, HelpCircle, Send, Loader2, Mic, Square, Book, RefreshCw, Volume2, ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Copy, Sparkles, Languages, Search, BrainCircuit } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                   <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                      <WrenchIcon size={24} />
                   </div>
                   Tools & Utilities
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">AI-powered assistants to help you practice smarter.</p>
            </div>
            
            {/* Custom Tab Switcher */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-2xl shadow-lg border border-slate-200 dark:border-white/5 inline-flex w-full md:w-auto">
                <TabButton active={activeTab === 'translate'} onClick={() => setActiveTab('translate')} icon={<Languages size={18} />} label="Translator" />
                <TabButton active={activeTab === 'doubt'} onClick={() => setActiveTab('doubt')} icon={<Search size={18} />} label="Clarify" />
                <TabButton active={activeTab === 'vocab'} onClick={() => setActiveTab('vocab')} icon={<BrainCircuit size={18} />} label="Vocabulary" />
            </div>
        </div>

      <div className="min-h-[500px]">
        {/* TRANSLATOR TAB */}
        {activeTab === 'translate' && (
          <div className="grid md:grid-cols-2 gap-6 h-full">
            {/* Input Side */}
            <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col relative h-[450px] group focus-within:border-indigo-500/30 transition-colors shadow-sm dark:shadow-none">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest px-3 py-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-white/5">{direction === 'toEng' ? 'GUJARATI' : 'ENGLISH'}</span>
                    <button 
                        onClick={() => setDirection(prev => prev === 'toEng' ? 'toGuj' : 'toEng')}
                        className="text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-2 rounded-xl transition border border-transparent hover:border-indigo-200 dark:hover:border-indigo-500/20"
                    >
                        <ArrowRightLeft size={18} />
                    </button>
                </div>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={direction === 'toEng' ? "તમારું વાક્ય અહીં લખો..." : "Type here..."}
                  className="w-full bg-transparent border-none focus:ring-0 resize-none text-xl text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 h-full p-0 leading-relaxed"
                />
                <div className="mt-auto flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                    <button
                        onClick={toggleRecording}
                        disabled={isTranscribing}
                        className={`p-3 rounded-xl transition-all ${
                            isRecording 
                            ? 'bg-red-500/20 text-red-500 dark:text-red-400 animate-pulse border border-red-500/50' 
                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5'
                        }`}
                    >
                        {isTranscribing ? <Loader2 size={20} className="animate-spin" /> : isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                    </button>
                    <button 
                        onClick={handleAction}
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 dark:shadow-indigo-900/20 flex items-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <>Translate <Send size={18} /></>}
                    </button>
                </div>
            </div>

            {/* Output Side */}
            <div className="bg-slate-100 dark:bg-slate-950/50 backdrop-blur-sm p-6 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col h-[450px] relative">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/5 w-fit">{direction === 'toEng' ? 'ENGLISH' : 'GUJARATI'}</span>
                {output ? (
                    <>
                        <p className="text-2xl text-slate-800 dark:text-white leading-relaxed font-medium">{output}</p>
                        <button className="absolute bottom-6 right-6 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition" onClick={() => navigator.clipboard.writeText(output)}>
                            <Copy size={20} />
                        </button>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                        <ArrowRightLeft size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">Translation will appear here</p>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* DOUBT TAB */}
        {activeTab === 'doubt' && (
          <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-200 dark:border-white/5 max-w-3xl mx-auto relative overflow-hidden">
             {/* Background decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             
             <div className="text-center mb-10 relative z-10">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                    <Sparkles size={32} />
                </div>
                <h3 className="font-black text-3xl text-slate-800 dark:text-white mb-2">Ask a Doubt</h3>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Ask grammar questions in Gujarati. We'll explain clearly.</p>
             </div>
            
            <div className="relative mb-8 z-10">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="દા.ત. 'to' અને 'for' વચ્ચે શું તફાવત છે?"
                  className="w-full p-6 pb-16 rounded-3xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none h-48 text-xl transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                <button
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                    className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-200 border ${
                        isRecording 
                        ? 'bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/50 animate-pulse' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                >
                    {isTranscribing ? <Loader2 size={20} className="animate-spin text-indigo-500" /> : isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
                </button>
            </div>
            
            <button 
              onClick={handleAction}
              disabled={loading || !input.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:to-indigo-400 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed z-10 relative"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              Explain to Me (મને સમજાવો)
            </button>

            {output && (
              <div className="mt-10 p-8 bg-indigo-50 dark:bg-indigo-950/30 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BrainCircuit size={16}/> Explanation
                </h4>
                <p className="text-slate-800 dark:text-indigo-100 text-lg leading-relaxed whitespace-pre-wrap">{output}</p>
              </div>
            )}
          </div>
        )}

        {/* VOCABULARY TAB */}
        {activeTab === 'vocab' && (
           <div className="animate-fade-in max-w-3xl mx-auto">
               {vocabList.length === 0 ? (
                   <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-12 rounded-[40px] border border-slate-200 dark:border-white/5 text-center space-y-8 shadow-2xl">
                       <div className="bg-emerald-100 dark:bg-emerald-500/10 p-8 rounded-full inline-block border border-emerald-200 dark:border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                           <Book className="w-16 h-16 text-emerald-500 dark:text-emerald-400" />
                       </div>
                       <div className="space-y-3">
                           <h3 className="text-3xl font-black text-slate-800 dark:text-white">Expand Your Vocabulary</h3>
                           <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto leading-relaxed">Get 5 new intermediate words with definitions and examples generated by AI.</p>
                       </div>
                       <button 
                         onClick={loadVocabulary}
                         disabled={loadingVocab}
                         className="bg-emerald-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-emerald-900/30 hover:bg-emerald-500 transition flex items-center gap-3 mx-auto active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {loadingVocab ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
                         Generate Words
                       </button>
                   </div>
               ) : (
                   <div className="space-y-8">
                       {/* Premium Flashcard */}
                       <div className="bg-white dark:bg-slate-950 rounded-[40px] shadow-2xl overflow-hidden relative border border-slate-200 dark:border-white/10 group min-h-[450px] flex flex-col">
                           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
                           
                           {/* Header */}
                           <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full">
                                   Word {vocabIndex + 1} of {vocabList.length}
                               </span>
                               <button onClick={loadVocabulary} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5" title="Refresh list">
                                   <RefreshCw size={20} />
                               </button>
                           </div>
                           
                           <div className="p-8 md:p-12 text-center flex-1 flex flex-col justify-center relative z-10">
                               <h2 className="text-6xl font-black text-slate-800 dark:text-white mb-4 tracking-tight drop-shadow-sm">{vocabList[vocabIndex].word}</h2>
                               <div className="flex items-center justify-center gap-3 mb-10">
                                  <span className="text-indigo-500 dark:text-indigo-400 font-medium text-2xl font-serif italic">/{vocabList[vocabIndex].pronunciation}/</span>
                                  <button className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 transition border border-indigo-100 dark:border-indigo-500/20" title="Pronounce">
                                     <Volume2 size={20} />
                                  </button>
                               </div>

                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-left">
                                   <div className="bg-slate-50 dark:bg-[#020617]/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Gujarati Meaning</span>
                                       <p className="text-slate-800 dark:text-white font-bold text-2xl">{vocabList[vocabIndex].gujaratiMeaning}</p>
                                   </div>
                                   <div className="bg-slate-50 dark:bg-[#020617]/50 p-6 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-white/10 transition-colors">
                                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Definition</span>
                                       <p className="text-slate-600 dark:text-slate-300 font-medium leading-snug">{vocabList[vocabIndex].englishDefinition}</p>
                                   </div>
                               </div>
                               
                               <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/10 text-indigo-700 dark:text-indigo-200 font-medium italic text-lg leading-relaxed relative mx-auto w-full max-w-lg">
                                   "{vocabList[vocabIndex].exampleSentence}"
                               </div>
                           </div>

                           {/* Navigation */}
                           <div className="bg-slate-50 dark:bg-slate-950 p-4 flex justify-between items-center border-t border-slate-200 dark:border-white/5">
                               <button 
                                 onClick={prevWord} 
                                 disabled={vocabIndex === 0}
                                 className="p-4 rounded-2xl hover:bg-white dark:hover:bg-white/5 disabled:opacity-30 transition text-slate-400 hover:text-slate-900 dark:hover:text-white"
                               >
                                   <ChevronLeft size={28} />
                               </button>
                               <div className="flex gap-2">
                                  {vocabList.map((_, idx) => (
                                      <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === vocabIndex ? 'bg-indigo-500 w-6' : 'bg-slate-300 dark:bg-slate-800'}`}></div>
                                  ))}
                               </div>
                               <button 
                                 onClick={nextWord} 
                                 disabled={vocabIndex === vocabList.length - 1}
                                 className="p-4 rounded-2xl hover:bg-white dark:hover:bg-white/5 disabled:opacity-30 transition text-slate-400 hover:text-slate-900 dark:hover:text-white"
                               >
                                   <ChevronRight size={28} />
                               </button>
                           </div>
                       </div>

                       {/* Practice Section */}
                       <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-lg">
                           <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-6 flex items-center gap-2 text-lg"><Sparkles size={20} className="text-indigo-500"/> Practice this word</h4>
                           <div className="relative mb-6">
                                <input 
                                    type="text"
                                    value={vocabPracticeInput}
                                    onChange={(e) => setVocabPracticeInput(e.target.value)}
                                    placeholder={`Write a sentence using "${vocabList[vocabIndex].word}"...`}
                                    className="w-full p-5 pr-14 rounded-2xl bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-700 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none transition text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-lg"
                                />
                                <button
                                    onClick={toggleRecording}
                                    disabled={isTranscribing}
                                    className={`absolute top-3 right-3 p-2.5 rounded-xl transition-all border ${
                                        isRecording 
                                        ? 'bg-red-500/20 text-red-500 dark:text-red-400 border-red-500/50 animate-pulse' 
                                        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    {isTranscribing ? <Loader2 size={18} className="animate-spin" /> : isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                                </button>
                           </div>
                           
                           {!vocabFeedback ? (
                               <button 
                                 onClick={handleCheckVocab}
                                 disabled={checkingVocab || !vocabPracticeInput}
                                 className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                               >
                                 {checkingVocab ? <Loader2 size={20} className="animate-spin" /> : "Check Usage"}
                               </button>
                           ) : (
                               <div className={`p-6 rounded-2xl flex gap-5 animate-fade-in-up border ${vocabFeedback.isCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/30'}`}>
                                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${vocabFeedback.isCorrect ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                                     {vocabFeedback.isCorrect ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                   </div>
                                   <div>
                                       <p className={`font-black text-xl mb-1 ${vocabFeedback.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                           {vocabFeedback.isCorrect ? 'Correct Usage!' : 'Needs Correction'}
                                       </p>
                                       <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">{vocabFeedback.feedback}</p>
                                       <button onClick={() => {setVocabFeedback(null); setVocabPracticeInput('');}} className="text-sm font-bold mt-4 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-slate-900 dark:text-white transition">Try Again</button>
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

// Helper Components
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 ${
        active 
        ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md border border-slate-800 dark:border-white/10' 
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
    }`}
  >
    <span className={`${active ? 'text-indigo-400' : ''}`}>{icon}</span> {label}
  </button>
);

const WrenchIcon = ({ size }: {size: number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);

export default Tools;