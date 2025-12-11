import React, { useState } from 'react';
import { ArrowRight, CheckCircle, Mic, Globe, Shield, Clock, ChevronDown, ChevronUp, Play, Sparkles, MessageSquare, X } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] opacity-40"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] opacity-40"></div>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#020617]/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tight">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-emerald-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <span className="text-white text-xs">SM</span>
            </div>
            SpeakMate
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#testimonials" className="hover:text-white transition">Stories</a>
          </nav>
          <button onClick={onStart} className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-sm font-bold transition-all">
            Login
          </button>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Your Everyday <br/> English Speaking <span className="text-indigo-400">Partner</span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                Practice real-life conversations with a friendly AI tutor that listens, corrects, and guides you—perfect for learners who hesitate to speak.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={onStart}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-lg shadow-xl shadow-indigo-900/40 hover:scale-105 transition-all flex items-center gap-2"
                >
                  Start Speaking Free <ArrowRight size={20}/>
                </button>
                <button className="px-8 py-4 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold transition-all flex items-center gap-2">
                  <Play size={18} fill="currentColor" /> Watch Demo
                </button>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500"/> No Judgement</span>
                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500"/> Safe Space</span>
                <span className="flex items-center gap-1"><CheckCircle size={14} className="text-emerald-500"/> 24/7 Practice</span>
              </div>
            </div>

            {/* Visual */}
            <div className="relative flex justify-center">
               <div className="relative w-full max-w-sm bg-slate-900/90 border border-slate-800 p-6 rounded-[32px] shadow-2xl backdrop-blur-sm">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-[34px] opacity-20 blur-lg -z-10"></div>
                  
                  {/* Chat Bubbles */}
                  <div className="space-y-4 mb-6">
                      <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tr-none text-sm text-slate-300">
                         “I understand English, but I get stuck while speaking.”
                      </div>
                      <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-2xl rounded-tl-none text-sm text-indigo-200">
                         “Let’s practice together! Start by telling me about your day.”
                      </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                      <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Streak</p>
                          <p className="text-xl font-black text-white flex items-center gap-1">🔥 7 Days</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
                          <Mic className="text-white" size={20} />
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* PROBLEM / SOLUTION */}
        <section className="py-24 bg-slate-950 border-t border-slate-900">
           <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Made for Learners Who Hesitate</h2>
                  <p className="text-slate-400 text-lg">
                      SpeakMate is designed for people who know English in their mind but struggle to speak it out loud.
                  </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                  {[
                      {
                          icon: <Globe className="text-blue-500" size={32} />,
                          title: "Indian Learners",
                          desc: "Situations inspired by real Indian life—office meetings, interviews, and family."
                      },
                      {
                          icon: <Shield className="text-emerald-500" size={32} />,
                          title: "Zero Judgement",
                          desc: "Make mistakes freely. SpeakMate never laughs, never gets tired, and never judges."
                      },
                      {
                          icon: <Clock className="text-orange-500" size={32} />,
                          title: "Daily Micro-Habits",
                          desc: "Just 10–15 minutes a day can dramatically improve your confidence over time."
                      }
                  ].map((feature, i) => (
                      <div key={i} className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-colors">
                          <div className="mb-6 bg-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-800">
                              {feature.icon}
                          </div>
                          <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                          <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                      </div>
                  ))}
              </div>
           </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">How SpeakMate Works</h2>
                
                <div className="grid md:grid-cols-4 gap-6">
                    {[
                        { step: "1", title: "Choose Topic", desc: "Pick a situation like 'Job Interview' or 'Ordering Food'." },
                        { step: "2", title: "Start Talking", desc: "Tap the mic and speak naturally. The AI responds like a real person." },
                        { step: "3", title: "Get Feedback", desc: "See corrections and better ways to say your sentences." },
                        { step: "4", title: "Improve", desc: "Track your fluency score and build a daily streak." }
                    ].map((item, i) => (
                        <div key={i} className="relative pt-8">
                             <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-600 flex items-center justify-center font-bold text-sm shadow-lg z-10">
                                 {item.step}
                             </div>
                             <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 h-full hover:bg-slate-900 transition-colors">
                                 <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                 <p className="text-slate-400 text-sm">{item.desc}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* COMPARISON */}
        <section className="py-24 bg-slate-950 border-t border-slate-900">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 opacity-70">
                        <h3 className="text-xl font-bold text-slate-400 mb-6">Traditional Classes</h3>
                        <ul className="space-y-4 text-slate-500">
                            <li className="flex gap-3"><X size={20}/> Fixed timings & batches</li>
                            <li className="flex gap-3"><X size={20}/> Teacher talks, you listen</li>
                            <li className="flex gap-3"><X size={20}/> Fear of public mistakes</li>
                            <li className="flex gap-3"><X size={20}/> Expensive fees</li>
                        </ul>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-900/20 to-emerald-900/20 p-8 rounded-3xl border border-indigo-500/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={100} /></div>
                        <h3 className="text-xl font-bold text-white mb-6">With SpeakMate</h3>
                        <ul className="space-y-4 text-slate-200 font-medium">
                            <li className="flex gap-3"><CheckCircle size={20} className="text-emerald-500"/> Practice anytime, anywhere</li>
                            <li className="flex gap-3"><CheckCircle size={20} className="text-emerald-500"/> You speak 80% of the time</li>
                            <li className="flex gap-3"><CheckCircle size={20} className="text-emerald-500"/> Private & Safe environment</li>
                            <li className="flex gap-3"><CheckCircle size={20} className="text-emerald-500"/> Start for free</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                    Ready to speak confidently?
                </h2>
                <p className="text-xl text-slate-400">
                    Join thousands of learners turning their hesitation into fluency.
                </p>
                <button 
                  onClick={onStart}
                  className="px-10 py-5 rounded-full bg-white text-slate-900 font-black text-xl shadow-2xl shadow-white/10 hover:scale-105 transition-all"
                >
                    Start Speaking Now
                </button>
                <p className="text-sm text-slate-600">No credit card required • Free forever plan available</p>
            </div>
        </section>

        <footer className="border-t border-slate-900 py-12 bg-[#020617]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div className="flex items-center gap-2 font-bold text-slate-500">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                       <span className="text-slate-400 text-[10px]">SM</span>
                    </div>
                    SpeakMate
                 </div>
                 <p className="text-slate-600 text-sm">© {new Date().getFullYear()} SpeakMate. All rights reserved.</p>
            </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;