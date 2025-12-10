import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { incrementWordsSpoken } from '../utils/progressUtils';
import { Mic, MicOff, Volume2, XCircle, MessageSquare, Play, Loader2, WifiOff, AlertCircle } from 'lucide-react';

interface LiveTutorProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const LiveTutor: React.FC<LiveTutorProps> = ({ onClose }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Refs for audio handling to avoid re-renders
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);
  
  // Refs for transcription accumulation
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing. Check configuration.");
      }

      if (!navigator.onLine) {
          throw new Error("No internet connection. Please check your network.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Ensure context is running (fixes some browser autoplay blocks)
      if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
      if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();

      inputAudioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;

      setStatus('Connecting to Pichi...');

      // Connection with Robust Retry Logic
      const connectWithRetry = async (retries = 5, delay = 1000): Promise<any> => {
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
                      
                      // Only send if session is established
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

                     // Handle Audio Output
                     const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                     if (base64EncodedAudioString) {
                        const ctx = outputAudioContextRef.current;
                        if (ctx) {
                            // Simulate "Thinking" delay for realism if this is the start of a turn
                            const isNewTurn = !isAiSpeaking; 
                            if (isNewTurn) {
                                // Small buffer for realism
                                await new Promise(r => setTimeout(r, 800)); 
                            }

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

                     // Handle Transcription
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

                         if (userText) {
                             // Calculate words spoken and update stats
                             const wordCount = userText.split(/\s+/).filter(w => w.length > 0).length;
                             incrementWordsSpoken(wordCount);
                         }

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

                     const interrupted = message.serverContent?.interrupted;
                     if (interrupted) {
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
                         // Handle 503 or Network errors during active session
                         if (msg.includes('503') || msg.includes('Network') || msg.includes('unavailable')) {
                             setStatus('Connection unstable. Attempting to recover...');
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
                  systemInstruction: `
                    You are "Pichi", a friendly and patient English tutor for Gujarati speakers.
                    Your goal is to help the user practice spoken English.
                    
                    Guidelines:
                    1. Speak clearly and slightly slower than normal.
                    2. Primarily speak in English.
                    3. If the user makes a significant grammar or pronunciation mistake, gently correct them.
                    4. IMPORTANT: When explaining a mistake or giving a complex instruction, use Gujarati to ensure they understand.
                    5. Keep the conversation engaging. Ask questions about their day, work, or hobbies.
                    6. Be encouraging!
                  `,
                },
              });
          } catch (err: any) {
              const isNetworkError = 
                err.message?.includes('Network') || 
                err.message?.includes('fetch') || 
                err.message?.includes('503') || 
                err.message?.includes('unavailable') ||
                err.name === 'TypeError'; // fetch failures often throw TypeError

              if (retries > 0 && isNetworkError) {
                  setStatus(`Connection busy. Retrying... (${retries})`);
                  await new Promise(r => setTimeout(r, delay));
                  // Exponential backoff
                  return connectWithRetry(retries - 1, delay * 1.5);
              }
              throw err;
          }
      };

      const sessionPromise = connectWithRetry(5, 1000); // 5 retries, starting at 1s
      sessionPromiseRef.current = sessionPromise;
      await sessionPromise;

    } catch (err: any) {
      console.error("Start Session Error:", err);
      let errMsg = 'Could not connect.';
      if (err.name === 'NotAllowedError') errMsg = 'Microphone access denied. Please enable permissions.';
      if (err.name === 'NotFoundError') errMsg = 'No microphone found.';
      if (!navigator.onLine) errMsg = 'No internet connection.';
      if (err.message && err.message.includes("API Key")) errMsg = "API Key Invalid or Missing.";
      if (err.message && (err.message.includes("503") || err.message.includes("Network"))) errMsg = "Service busy or network error. Please try again.";
      
      setError(errMsg);
      setHasStarted(false);
      setIsActive(false);
      setStatus('');
      
      // Cleanup partially initialized contexts
      try { inputAudioContextRef.current?.close(); } catch {}
      try { outputAudioContextRef.current?.close(); } catch {}
      try { streamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-95 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col h-[85vh]">
        {/* Header */}
        <div className="bg-orange-500 p-4 text-white flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Volume2 className="h-6 w-6" /> Pichi (AI Tutor)
          </h2>
          <button onClick={onClose} className="hover:bg-orange-600 p-1 rounded-full transition">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {!hasStarted ? (
            /* START SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-slate-950 space-y-6">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-full shadow-lg shadow-orange-100 dark:shadow-none animate-pulse">
                    <Mic className="w-16 h-16 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Ready to practice?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Pichi is ready to have a conversation with you.</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900 flex items-center gap-2 text-sm font-bold animate-shake">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <button 
                    onClick={startSession}
                    className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition flex items-center gap-3 active:scale-95"
                >
                    <Play fill="currentColor" size={20} />
                    Start Conversation (શરૂ કરો)
                </button>
                <p className="text-xs text-gray-400">Microphone permission required</p>
            </div>
        ) : (
            /* ACTIVE SESSION UI */
            <>
                {/* Chat History */}
                <div className="flex-1 bg-gray-50 dark:bg-slate-950 p-4 overflow-y-auto" ref={scrollRef}>
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                            {status.includes('Connecting') || status.includes('Initializing') || status.includes('Retrying') ? (
                                <Loader2 size={48} className="animate-spin text-orange-400 mb-2"/>
                            ) : (
                                <MessageSquare size={48} className="mb-2" />
                            )}
                            <p className="font-medium animate-pulse">{status.includes('Connecting') || status.includes('Retrying') ? status : "Start speaking..."}</p>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-2">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm md:text-base ${
                                        msg.role === 'user' 
                                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-200 rounded-tr-none' 
                                        : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white rounded-tl-none shadow-sm'
                                    }`}>
                                        <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                                            {msg.role === 'user' ? 'You' : 'Pichi'}
                                        </span>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status & Mic */}
                <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className={`relative rounded-full h-24 w-24 flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? isAiSpeaking 
                                ? 'bg-orange-50 dark:bg-orange-900/20 ring-4 ring-orange-200 dark:ring-orange-900/50 scale-105' // AI Speaking style
                                : 'bg-green-50 dark:bg-green-900/20 ring-4 ring-green-200 dark:ring-green-900/50' // User Listening style
                              : 'bg-gray-100 dark:bg-slate-800'
                        }`}>
                            {isActive ? (
                                isAiSpeaking ? (
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        {/* Waveform Animation for AI */}
                                        <div className="absolute inset-0 rounded-full border-4 border-orange-400 opacity-20 animate-ping"></div>
                                        <div className="absolute inset-0 rounded-full border-4 border-orange-400 opacity-20 animate-ping" style={{animationDelay: '0.3s'}}></div>
                                        <Volume2 className="h-10 w-10 text-orange-600 dark:text-orange-400 relative z-10" />
                                    </div>
                                ) : (
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        {/* Pulse for Mic Listening */}
                                        <div className="absolute inset-0 rounded-full bg-green-400 opacity-10 animate-pulse"></div>
                                        <Mic className="h-10 w-10 text-green-600 dark:text-green-400 relative z-10" />
                                    </div>
                                )
                            ) : (
                                <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
                            )}
                        </div>
                        <div className="text-center transition-all duration-300">
                            <h3 className={`font-bold text-xl ${isAiSpeaking ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                                {isActive 
                                    ? isAiSpeaking ? "Pichi is Speaking..." : "Your Turn (તમારો વારો)" 
                                    : status || "Connecting..."}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
                                {isAiSpeaking ? "Listening..." : "Pichi is listening to you..."}
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 text-center text-xs text-gray-400">
                      Speak freely. Pichi will correct you in Gujarati if needed.
                      <br/>
                      (બોલો, હું તમારી ભૂલ સુધારીશ)
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default LiveTutor;