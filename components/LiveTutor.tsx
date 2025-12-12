import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { incrementWordsSpoken } from '../utils/progressUtils';
import { Mic, X, Sparkles, Play, Sun, Moon, GraduationCap } from 'lucide-react';

interface LiveTutorProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

type TutorMode = 'casual' | 'strict';

const LiveTutor: React.FC<LiveTutorProps> = ({ onClose, theme, toggleTheme }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tutorMode, setTutorMode] = useState<TutorMode>('casual');
  
  // Refs for audio handling
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const activeSessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const mountedRef = useRef(true);
  
  // Refs for Analysis (Visualizer)
  const inputAnalyserRef = useRef<AnalyserNode | null>(null);
  const outputAnalyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Refs for transcription
  const currentUserTextRef = useRef('');
  const currentModelTextRef = useRef('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const cleanup = useCallback(() => {
    // Close active session
    if (activeSessionRef.current) {
        try {
            activeSessionRef.current.close();
        } catch (e) {
            console.error("Error closing session:", e);
        }
        activeSessionRef.current = null;
    }

    // Stop all audio sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    // Close contexts
    try { inputAudioContextRef.current?.close(); } catch(e) {}
    try { outputAudioContextRef.current?.close(); } catch(e) {}
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    
    // Stop mic stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    
    setIsActive(false);
    setIsAiSpeaking(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
        cleanup();
        mountedRef.current = false;
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [cleanup]);

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

  // --- VISUALIZER LOGIC ---
  useEffect(() => {
      if (!isActive || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size for retina displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      let phase = 0;
      let currentAmp = 0; 
      let currentPitch = 0.5; // Normalized pitch/centroid
      
      const render = () => {
          if (!mountedRef.current) return;
          
          const width = rect.width;
          const height = rect.height;
          const centerY = height / 2;
          
          ctx.clearRect(0, 0, width, height);

          // Determine which analyser to use
          let analyser = isAiSpeaking ? outputAnalyserRef.current : inputAnalyserRef.current;
          
          // Get Frequency Data
          let rms = 0; 
          let centroid = 0;

          if (analyser) {
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(dataArray);
              
              let sumSquares = 0;
              let weightedSum = 0;
              let totalWeight = 0;
              // Focus on human voice frequency range (roughly first 50-60% of bins @ 24k rate)
              const relevantBins = Math.floor(dataArray.length * 0.6); 

              for (let i = 0; i < relevantBins; i++) {
                  const val = dataArray[i] / 255;
                  sumSquares += val * val;
                  
                  weightedSum += i * dataArray[i];
                  totalWeight += dataArray[i];
              }
              
              if (relevantBins > 0) {
                  rms = Math.sqrt(sumSquares / relevantBins);
                  // Dynamic Boost: Low volumes get bumped slightly, high volumes compressed
                  rms = Math.pow(rms, 1.2) * 3; 
                  rms = Math.min(1.0, rms); 
                  
                  if (totalWeight > 0) {
                      // Normalize centroid to 0-1 range roughly corresponding to bass -> treble
                      centroid = (weightedSum / totalWeight) / (relevantBins * 0.5); 
                  }
              }
          }

          // Smooth Amplitude: Fast attack, moderate decay for natural feel
          if (rms > currentAmp) {
              currentAmp += (rms - currentAmp) * 0.3; 
          } else {
              currentAmp += (rms - currentAmp) * 0.1; 
          }
          
          // Smooth Pitch
          currentPitch += (centroid - currentPitch) * 0.1;
          
          // Breathing Idle: Very subtle movement when silent
          const breathing = Math.sin(phase * 0.05) * 0.02;
          const effectiveAmp = Math.max(currentAmp, 0.05 + breathing); 

          // Visual Config
          const isDark = theme === 'dark';
          // Use 'screen' for additive neon blending in dark mode, standard for light
          ctx.globalCompositeOperation = isDark ? 'screen' : 'source-over'; 
          
          // Colors based on state
          const colors = isAiSpeaking 
              ? [ // AI: Blue/Cyan/Purple
                  isDark ? {r: 0, g: 200, b: 255} : {r: 0, g: 100, b: 200}, 
                  isDark ? {r: 100, g: 100, b: 255} : {r: 60, g: 60, b: 200},
                  isDark ? {r: 180, g: 50, b: 255} : {r: 120, g: 0, b: 180} 
                ]
              : [ // User: Emerald/Teal
                  isDark ? {r: 0, g: 255, b: 150} : {r: 0, g: 180, b: 100},
                  isDark ? {r: 50, g: 220, b: 200} : {r: 0, g: 150, b: 150},
                  isDark ? {r: 100, g: 255, b: 100} : {r: 50, g: 180, b: 50}
                ];

          // Draw waves
          colors.forEach((col, i) => {
              ctx.beginPath();
              
              // Wave Parameters
              // Pitch affects frequency slightly (higher pitch = more ripples)
              const pitchMod = Math.min(0.01, currentPitch * 0.01);
              const freq = 0.015 + (i * 0.005) + pitchMod;

              // Speed varies by layer
              const speed = 0.08 + (i * 0.02) + (effectiveAmp * 0.1);
              const basePhase = phase * speed + (i * (Math.PI / 1.5)); 
              
              // Max height constraint - kept compact (20% of container height max)
              const maxH = (height * 0.2) * effectiveAmp; 

              let isFirst = true;
              
              // Draw
              for (let x = 0; x <= width; x += 4) {
                  const nx = x / width; // Normalized x (0 to 1)
                  
                  // Taper function: Sine window to pin edges smoothly
                  // pow(sin, 2) creates a nice bell curve taper
                  const taper = Math.pow(Math.sin(nx * Math.PI), 2); 
                  
                  // Primary Sine
                  const y1 = Math.sin(x * freq + basePhase);
                  // Secondary Sine (Harmonic) for liquidity
                  const y2 = Math.sin(x * (freq * 2.2) - basePhase * 1.5);
                  
                  // Combine
                  const combinedY = y1 + (y2 * 0.5);
                  
                  const y = centerY + (combinedY * maxH * taper);
                  
                  if (isFirst) {
                      ctx.moveTo(x, y);
                      isFirst = false;
                  } else {
                      ctx.lineTo(x, y);
                  }
              }
              
              // Styling
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              
              // Thickness grows slightly with volume
              ctx.lineWidth = 1.5 + (effectiveAmp * 2); 
              
              // Gradient Stroke for "Glowing" Core
              const gradient = ctx.createLinearGradient(0, 0, width, 0);
              // Opacity logic: Fade out at edges
              const alphaBase = isDark ? 0.8 : 0.6;
              const alphaBoost = effectiveAmp * 0.2;
              const alpha = alphaBase + alphaBoost;

              gradient.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
              gradient.addColorStop(0.2, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha * 0.5})`);
              gradient.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`);
              gradient.addColorStop(0.8, `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha * 0.5})`);
              gradient.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`);
              
              ctx.strokeStyle = gradient;

              // Shadow Blur for Glow
              // Only heavy blur in dark mode for neon effect. 
              // Light mode gets minimal blur to stay sharp.
              ctx.shadowColor = `rgba(${col.r}, ${col.g}, ${col.b}, ${isDark ? 0.8 : 0.4})`;
              ctx.shadowBlur = isDark ? 10 + (effectiveAmp * 15) : 2 + (effectiveAmp * 5);
              
              ctx.stroke();
          });

          // Restore normal blending for next frame
          ctx.globalCompositeOperation = 'source-over';
          ctx.shadowBlur = 0;

          phase += 1;
          animationFrameRef.current = requestAnimationFrame(render);
      };

      render();

      return () => {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
  }, [isActive, isAiSpeaking, theme]);


  const getCurrentTime = () => {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const startSession = async () => {
    cleanup();
    await new Promise(resolve => setTimeout(resolve, 100));

    setError(null);
    setHasStarted(true);
    setStatus('Connecting...');
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key is missing.");
      if (!navigator.onLine) throw new Error("No internet connection.");

      const ai = new GoogleGenAI({ apiKey });
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
          } 
      });
      streamRef.current = stream;

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
      if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();

      const inputAnalyser = inputAudioContext.createAnalyser();
      inputAnalyser.fftSize = 512; 
      inputAnalyser.smoothingTimeConstant = 0.3; // More responsive
      inputAnalyserRef.current = inputAnalyser;

      const outputAnalyser = outputAudioContext.createAnalyser();
      outputAnalyser.fftSize = 512;
      outputAnalyser.smoothingTimeConstant = 0.3;
      outputAnalyserRef.current = outputAnalyser;

      inputAudioContextRef.current = inputAudioContext;
      outputAudioContextRef.current = outputAudioContext;

      const baseInstruction = `You are Pichi, a friendly AI English tutor for a Gujarati speaker. Engage in a natural, spoken conversation. If the user speaks Gujarati, understand it but reply primarily in English.`;
      const modeInstruction = tutorMode === 'casual' ? ` MODE: CASUAL. Keep conversation fun. Be encouraging.` : ` MODE: STRICT TEACHER. Correct mistakes immediately.`;

      const connectWithRetry = async (retries = 3, delay = 1000): Promise<any> => {
          try {
              const session = await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                  onopen: () => {
                    if (!mountedRef.current) return;
                    setStatus('Connected');
                    setIsActive(true);

                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                      if (!mountedRef.current || !activeSessionRef.current) return;
                      
                      const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                      const pcmBlob = createBlob(inputData);
                      try {
                          activeSessionRef.current.sendRealtimeInput({ media: pcmBlob });
                      } catch (e) {
                          console.error("Error sending input", e);
                      }
                    };

                    source.connect(inputAnalyser);
                    inputAnalyser.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                  },
                  onmessage: async (message: LiveServerMessage) => {
                     if (!mountedRef.current) return;

                     const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                     if (base64EncodedAudioString) {
                        const ctx = outputAudioContextRef.current;
                        const analyser = outputAnalyserRef.current;

                        if (ctx && analyser) {
                            const isNewTurn = !isAiSpeaking; 
                            if (isNewTurn) await new Promise(r => setTimeout(r, 200)); 

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            try {
                                const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(analyser);
                                analyser.connect(ctx.destination);
                                source.addEventListener('ended', () => {
                                    sourcesRef.current.delete(source);
                                    if (sourcesRef.current.size === 0) setIsAiSpeaking(false);
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

                     const serverContent = message.serverContent;
                     if (serverContent?.outputTranscription?.text) currentModelTextRef.current += serverContent.outputTranscription.text;
                     if (serverContent?.inputTranscription?.text) currentUserTextRef.current += serverContent.inputTranscription.text;

                     if (serverContent?.turnComplete) {
                         const userText = currentUserTextRef.current.trim();
                         const modelText = currentModelTextRef.current.trim();
                         if (userText) incrementWordsSpoken(userText.split(/\s+/).filter(w => w.length > 0).length);
                         if (userText || modelText) {
                             const timestamp = getCurrentTime();
                             setMessages(prev => {
                                 const newMsgs = [...prev];
                                 if (userText) newMsgs.push({ id: Date.now() + 'u', role: 'user', text: userText, timestamp });
                                 if (modelText) newMsgs.push({ id: Date.now() + 'm', role: 'model', text: modelText, timestamp });
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
                      console.log("Session closed");
                      setStatus('Disconnected');
                  },
                  onerror: (e: any) => { 
                      console.error("Session Error:", e); 
                      // Only set error if not retrying immediately
                      setStatus('Connection Error'); 
                  }
                },
                config: {
                  responseModalities: [Modality.AUDIO],
                  inputAudioTranscription: {},
                  outputAudioTranscription: {},
                  speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                  // Use robust object format for instruction
                  systemInstruction: { parts: [{ text: baseInstruction + modeInstruction }] },
                },
              });
              activeSessionRef.current = session;
              return session;
          } catch (err: any) {
              console.error("Connect Attempt Error:", err);
              if (retries > 0) {
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
      let errMsg = "Connection failed. Please try again.";
      if (err.message && err.message.includes('403')) errMsg = "API Key invalid or quota exceeded.";
      if (err.message && err.message.includes('Network')) errMsg = "Network error. Check your connection.";
      setError(errMsg);
      setHasStarted(false);
      setIsActive(false);
    }
  };

  const bgClass = theme === 'dark' ? 'bg-[#0f172a]' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const borderClass = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const subTextClass = theme === 'dark' ? 'text-white/60' : 'text-slate-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className={`relative w-full max-w-lg h-[85vh] max-h-[750px] flex flex-col rounded-[32px] overflow-hidden shadow-2xl border ${bgClass} ${borderClass} transition-colors duration-500`}>
            
            {/* Header */}
            <div className={`absolute top-0 left-0 right-0 p-5 flex flex-col gap-4 z-20 backdrop-blur-sm border-b ${theme === 'dark' ? 'bg-[#0f172a]/80 border-white/5' : 'bg-white/80 border-slate-100'}`}>
                <div className="flex justify-between items-center">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${theme === 'dark' ? 'bg-white/10 border-white/5 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                        <Sparkles size={14} className={`${theme === 'dark' ? 'text-white fill-white' : 'text-slate-800 fill-slate-800'}`} />
                        <span className="font-bold tracking-wide text-xs">Live Pichi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleTheme} className={`p-2 rounded-full transition ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'}`}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button onClick={onClose} className={`p-2 rounded-full transition ${theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-800'}`}>
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {!hasStarted ? (
                <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden p-6 mt-16">
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-1000 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="w-64 h-64 bg-indigo-600/20 rounded-full blur-[80px] animate-pulse"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-center gap-6 text-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl mb-2 transition-transform hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 shadow-indigo-500/30' : 'bg-white shadow-xl border border-slate-100'}`}>
                            <Mic size={40} className={theme === 'dark' ? 'text-white' : 'text-indigo-600'} />
                        </div>
                        <div className="space-y-2">
                            <h2 className={`text-3xl font-black tracking-tight ${textClass}`}>Speak with Pichi</h2>
                            <p className={`text-base font-medium ${subTextClass} max-w-xs mx-auto`}>Practice English naturally with your personal AI tutor</p>
                        </div>
                        <div className={`flex p-1 rounded-xl border mt-2 ${theme === 'dark' ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                            <button onClick={() => setTutorMode('casual')} className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${tutorMode === 'casual' ? (theme === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                <Sparkles size={16} /> Casual
                            </button>
                            <button onClick={() => setTutorMode('strict')} className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${tutorMode === 'strict' ? (theme === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-sm') : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                <GraduationCap size={16} /> Strict
                            </button>
                        </div>
                        {error && <div className="text-red-500 bg-red-100 dark:bg-red-900/20 px-4 py-2 rounded-lg text-sm font-bold animate-shake">{error}</div>}
                        <button onClick={startSession} className={`px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3 mt-2 ${theme === 'dark' ? 'bg-white text-black hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                            <Play fill="currentColor" size={20} /> Start Conversation
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Chat Transcript Area - Added spacer at bottom instead of large padding-bottom */}
                    <div className={`flex-1 overflow-y-auto p-4 sm:p-6 pt-24 pb-4 flex flex-col gap-6 custom-scrollbar ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`} ref={scrollRef}>
                        {messages.length === 0 && isActive && (
                            <div className={`flex flex-col items-center justify-center h-full opacity-50`}>
                                <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-4 animate-pulse">
                                    <Sparkles size={32} className="text-indigo-500" />
                                </div>
                                <p className={`text-center font-medium ${subTextClass}`}>Listening to you...</p>
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full animate-scale-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md mr-3 mt-auto shrink-0">
                                        <Sparkles size={14} fill="currentColor" />
                                    </div>
                                )}
                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                    <div className={`px-5 py-3 text-[15px] sm:text-base leading-relaxed shadow-sm transition-colors duration-300 ${msg.role === 'user' ? `rounded-2xl rounded-tr-none ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'bg-indigo-500 text-white'}` : `rounded-2xl rounded-tl-none ${theme === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white text-slate-800 border border-slate-200'}`}`}>
                                        {msg.text}
                                    </div>
                                    <span className={`text-[10px] font-bold mt-1.5 opacity-60 px-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}
                        {/* Invisible spacer to push content above the absolute positioned waves */}
                        <div className="h-40 shrink-0 w-full" aria-hidden="true" />
                    </div>

                    {/* Wave Visualization - Floating & Centered with Glow */}
                    <div className={`absolute bottom-0 left-0 right-0 h-32 flex items-center justify-center z-10 pointer-events-none bg-gradient-to-t ${theme === 'dark' ? 'from-[#0f172a] via-[#0f172a]/95 to-transparent' : 'from-slate-50 via-slate-50/95 to-transparent'}`}>
                        <canvas ref={canvasRef} className="w-full h-full object-cover opacity-90" />
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default LiveTutor;