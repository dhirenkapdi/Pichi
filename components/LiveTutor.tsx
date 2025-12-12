import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { incrementWordsSpoken } from '../utils/progressUtils';
import { Mic, MicOff, Volume2, X, MessageSquare, Play, Loader2, WifiOff, AlertCircle, StopCircle, User, Briefcase, Utensils, MapPin, GraduationCap, Sparkles, Coffee } from 'lucide-react';

interface LiveTutorProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const TOPICS = [
  { id: 'free', label: 'Free Chat', icon: <MessageSquare size={18}/>, prompt: "Just chat casually about anything the user wants. Be friendly, curious, and keep the conversation going." },
  { id: 'interview', label: 'Job Interview', icon: <Briefcase size={18}/>, prompt: "Roleplay a job interview. You are the interviewer for a generic corporate role. Ask standard interview questions one by one. Keep it professional but encouraging." },
  { id: 'restaurant', label: 'Ordering Food', icon: <Utensils size={18}/>, prompt: "Roleplay a restaurant waiter. The user is a customer. Ask for their order, suggest special items, and handle the bill interactions." },
  { id: 'travel', label: 'Travel Help', icon: <MapPin size={18}/>, prompt: "Roleplay a local stranger on the street. The user is a tourist asking for directions or recommendations. Be helpful and give clear directions." },
];

const LiveTutor: React.FC<LiveTutorProps> = ({ onClose }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Settings State
  const [selectedTopic, setSelectedTopic] = useState(TOPICS[0]);
  const [strictMode, setStrictMode] = useState(false);
  
  // Refs for audio handling
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);
  
  // Refs for transcription
  const currentUserTextRef = useRef('');
  const currentModelTextRef = useRef('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const cleanup = useCallback(() => {
    mountedRef.current = false;
    
    // Stop all audio sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    // Close contexts
    try { inputAudioContextRef.current?.close(); } catch(e) {}
    try { outputAudioContextRef.current?.close(); } catch(e) {}
    
    // Stop mic stream
    streamRef.current?.getTracks().forEach(track => track.stop());
    
    setIsActive(false);
    setIsAiSpeaking(false);
    setHasStarted(false);
  }, []);

  useEffect(() => {
    // Load chat history if available
    const saved = localStorage.getItem('talksmart_chat_history');
    if (saved) {
        try {
            setMessages(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load chat history", e);
        }
    }

    return () => cleanup();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('talksmart_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
  }, [messages]);

  const startSession = async () => {
    setError(null);
    setHasStarted(true);
    setStatus('Initializing Audio...');
    
    try {
      // The API key must be obtained exclusively from the environment variable process.env.API_KEY
      const apiKey = process.env.API_KEY;

      if (!apiKey) {
        throw new Error("API Key is missing. Check configuration.");
      }

      if (!navigator.onLine) {
          throw new Error("No internet connection. Please check your network.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
      if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();

      inputAudioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;

      setStatus('Connecting to Pichi...');

      // --- IMPROVED SYSTEM INSTRUCTION ---
      const baseInstruction = `You are Pichi, a patient and encouraging English tutor for a Gujarati speaker. Your goal is to get the user speaking as much as possible.`;

      const modeInstruction = strictMode
        ? `MODE: STRICT CORRECTION (Teacher Style)
           - Listen carefully for grammar, tense, and vocabulary errors.
           - When an error is detected: STOP the flow politely.
           - Explicitly point out the mistake.
           - Provide the correct sentence clearly.
           - Ask the user to repeat the corrected sentence before moving on.
           - You may use simple Gujarati to explain grammatical concepts if the user is struggling.`
        : `MODE: CASUAL CONVERSATION (Friend Style)
           - Focus entirely on the *meaning* and *flow* of the conversation.
           - IGNORE minor grammar mistakes to build confidence.
           - Only correct the user if what they said is unintelligible or has a critical error.
           - If you correct, do it subtly by repeating their idea back to them correctly (recasting).
           - Be enthusiastic and fun.`;

      const scenarioInstruction = `CURRENT SCENARIO: ${selectedTopic.prompt}`;

      const generalRules = `
        RULES:
        1. CRITICAL: Keep your responses SHORT (max 1-2 sentences unless explaining a concept). Do not monologue.
        2. Always end with a simple follow-up question to prompt the user to speak.
        3. If the user speaks in Gujarati, understand them, but gently encourage them to say it in English, or translate it for them and ask them to repeat the English version.
        4. Speak clearly and at a moderate pace.
      `;

      const systemInstruction = `${baseInstruction}\n\n${modeInstruction}\n\n${scenarioInstruction}\n\n${generalRules}`;

      const connectWithRetry = async (retries = 3, delay = 1000): Promise<any> => {
          try {
              return await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                  onopen: () => {
                    if (!mountedRef.current) return;
                    setStatus('Connected');
                    setIsActive(true);

                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                      if (!mountedRef.current) return;
                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                      const pcmBlob = createBlob(inputData);
                      
                      if (sessionPromiseRef.current) {
                          sessionPromiseRef.current.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                          }).catch(() => {});
                      }
                    };

                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                  },
                  onmessage: async (message: LiveServerMessage) => {
                     if (!mountedRef.current) return;

                     // Audio Output
                     const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                     if (base64EncodedAudioString) {
                        const ctx = outputAudioContextRef.current;
                        if (ctx) {
                            const isNewTurn = !isAiSpeaking; 
                            if (isNewTurn) await new Promise(r => setTimeout(r, 600)); 

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            try {
                                const audioBuffer = await decodeAudioData(
                                    decode(base64EncodedAudioString),
                                    ctx,
                                    24000,
                                    1
                                );
                                
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(ctx.destination);
                                
                                source.addEventListener('ended', () => {
                                    sourcesRef.current.delete(source);
                                    if (sourcesRef.current.size === 0) {
                                        setIsAiSpeaking(false);
                                    }
                                });

                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(source);
                                setIsAiSpeaking(true);
                            } catch (e) {
                                console.error("Error decoding audio", e);
                            }
                        }
                     }

                     // Transcription
                     const serverContent = message.serverContent;
                     if (serverContent?.outputTranscription?.text) {
                         currentModelTextRef.current += serverContent.outputTranscription.text;
                     }
                     if (serverContent?.inputTranscription?.text) {
                         currentUserTextRef.current += serverContent.inputTranscription.text;
                     }

                     if (serverContent?.turnComplete) {
                         const userText = currentUserTextRef.current.trim();
                         const modelText = currentModelTextRef.current.trim();

                         if (userText) incrementWordsSpoken(userText.split(/\s+/).filter(w => w.length > 0).length);

                         if (userText || modelText) {
                             setMessages(prev => {
                                 const newMsgs = [...prev];
                                 if (userText) newMsgs.push({ id: Date.now() + 'u', role: 'user', text: userText });
                                 if (modelText) newMsgs.push({ id: Date.now() + 'm', role: 'model', text: modelText });
                                 return newMsgs;
                             });
                             currentUserTextRef.current = '';
                             currentModelTextRef.current = '';
                         }
                     }

                     if (message.serverContent?.interrupted) {
                        sourcesRef.current.forEach(s => s.stop());
                        sourcesRef.current.clear();
                        nextStartTimeRef.current = 0;
                        setIsAiSpeaking(false);
                     }
                  },
                  onclose: () => {
                     if (mountedRef.current) {
                         setStatus('Disconnected');
                         setIsActive(false);
                     }
                  },
                  onerror: (e: any) => {
                     console.error("Session Error:", e);
                     if (mountedRef.current) {
                         const msg = e.message || e.toString() || 'Unknown Error';
                         if (msg.includes('503') || msg.includes('Network') || msg.includes('unavailable')) {
                             setStatus('Connection unstable...');
                         } else {
                             setStatus('Connection Interrupted');
                         }
                     }
                  }
                },
                config: {
                  responseModalities: [Modality.AUDIO],
                  inputAudioTranscription: {},
                  outputAudioTranscription: {},
                  speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                  },
                  systemInstruction: systemInstruction,
                },
              });
          } catch (err: any) {
              if (retries > 0 && (err.message?.includes('Network') || err.message?.includes('503') || err.name === 'TypeError')) {
                  setStatus(`Retrying connection... (${retries})`);
                  await new Promise(r => setTimeout(r, delay));
                  return connectWithRetry(retries - 1, delay * 1.5);
              }
              throw err;
          }
      };

      const sessionPromise = connectWithRetry(3, 1000);
      sessionPromiseRef.current = sessionPromise;
      await sessionPromise;

    } catch (err: any) {
      console.error("Start Session Error:", err);
      let errMsg = 'Could not connect.';
      if (err.name === 'NotAllowedError') errMsg = 'Microphone access denied.';
      if (!navigator.onLine) errMsg = 'No internet connection.';
      if (err.message && err.message.includes("API Key")) errMsg = "API Key Invalid or Missing.";
      
      setError(errMsg);
      setHasStarted(false);
      setIsActive(false);
      setStatus('');
      
      try { inputAudioContextRef.current?.close(); } catch {}
      try { outputAudioContextRef.current?.close(); } catch {}
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col h-[85dvh] border border-white/10 ring-1 ring-white/5">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20 pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/50 text-orange-400">
                    <Volume2 size={20} />
                </div>
                <div>
                    <h2 className="text-white font-bold text-lg leading-none">Pichi</h2>
                    <p className="text-slate-400 text-xs font-medium mt-1">AI Language Tutor</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition pointer-events-auto">
                <X size={20} />
            </button>
        </div>

        {!hasStarted ? (
            /* START SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

                <div className="relative z-10 w-full flex flex-col items-center">
                    <h3 className="text-3xl font-black text-white tracking-tight mb-6 mt-8">Start Session</h3>
                    
                    {/* Scenario Selection */}
                    <div className="w-full mb-6">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block text-left pl-1">Choose Scenario</label>
                        <div className="grid grid-cols-2 gap-3">
                            {TOPICS.map(t => (
                                <button 
                                    key={t.id}
                                    onClick={() => setSelectedTopic(t)}
                                    className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                                        selectedTopic.id === t.id 
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30' 
                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                                    }`}
                                >
                                    {t.icon}
                                    <span className="text-xs font-bold">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Strict Mode Toggle */}
                    <div className="w-full bg-slate-800/50 rounded-2xl p-1.5 flex mb-8 border border-slate-700/50">
                        <button 
                            onClick={() => setStrictMode(false)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${!strictMode ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Sparkles size={14} /> Casual
                        </button>
                        <button 
                            onClick={() => setStrictMode(true)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${strictMode ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <GraduationCap size={14} /> Strict
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 px-4 py-3 rounded-2xl border border-red-500/20 flex items-center gap-2 text-sm font-bold animate-shake mb-4 w-full">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <button 
                        onClick={startSession}
                        className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
                    >
                        <Play fill="currentColor" size={20} />
                        Start Speaking
                    </button>
                    <p className="text-xs text-slate-600 mt-4 font-medium">Headphones recommended for best experience</p>
                </div>
            </div>
        ) : (
            /* ACTIVE SESSION UI */
            <div className="flex-1 flex flex-col relative">
                
                {/* Chat Stream (Overlay on top) */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 pt-24 mask-linear-fade" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50 gap-4">
                             {status.includes('Connecting') && <Loader2 className="animate-spin text-orange-500" size={32} />}
                             <div className="text-center">
                                 <p className="font-bold text-sm uppercase tracking-widest mb-1">{status}</p>
                                 {isActive && !isAiSpeaking && <p className="text-xs">Topic: {selectedTopic.label} ({strictMode ? 'Strict' : 'Casual'})</p>}
                             </div>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                            <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-orange-600 text-white rounded-tr-sm' 
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Interactive Footer */}
                <div className="p-6 bg-slate-900/50 backdrop-blur-lg border-t border-white/5 shrink-0 z-20">
                    <div className="flex flex-col items-center gap-6">
                        
                        {/* THE ORB VISUALIZER */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Outer Rings */}
                            {isActive && (
                                <>
                                    <div className={`absolute inset-0 rounded-full border border-white/10 ${isAiSpeaking ? 'animate-ping duration-1000' : 'animate-pulse duration-2000'}`}></div>
                                    <div className={`absolute -inset-4 rounded-full border border-white/5 ${isAiSpeaking ? 'animate-ping duration-1500 delay-100' : 'animate-pulse duration-2000 delay-300'}`}></div>
                                </>
                            )}
                            
                            {/* Core Orb */}
                            <div className={`w-20 h-20 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all duration-500 relative overflow-hidden ${
                                isActive 
                                    ? isAiSpeaking 
                                        ? 'bg-gradient-to-tr from-orange-500 to-pink-500 scale-110 shadow-[0_0_50px_rgba(249,115,22,0.6)]' 
                                        : 'bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]' 
                                    : 'bg-slate-700'
                            }`}>
                                {isActive ? (
                                    isAiSpeaking ? (
                                        <div className="space-x-1 flex items-center h-4">
                                            <div className="w-1 bg-white rounded-full h-3 animate-bounce"></div>
                                            <div className="w-1 bg-white rounded-full h-5 animate-bounce delay-100"></div>
                                            <div className="w-1 bg-white rounded-full h-3 animate-bounce delay-200"></div>
                                        </div>
                                    ) : (
                                        <Mic className="w-8 h-8 text-white animate-pulse" />
                                    )
                                ) : (
                                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        {/* Status Text */}
                        <div className="text-center space-y-1">
                            <h3 className="font-bold text-white text-lg tracking-tight">
                                {isActive 
                                    ? isAiSpeaking ? "Pichi is speaking..." : "Listening..." 
                                    : status}
                            </h3>
                            <p className="text-slate-400 text-xs font-medium">
                                {isActive && !isAiSpeaking ? "Go ahead, say something." : ""}
                            </p>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 hover:border-red-500/50"
                        >
                            <StopCircle size={14} /> End Session
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default LiveTutor;