import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import LessonMode from './components/LessonMode';
import LiveTutor from './components/LiveTutor';
import Tools from './components/Tools';
import GrammarGuide from './components/GrammarGuide';
import GameArena from './components/GameArena';
import { LayoutDashboard, GraduationCap, Mic, Wrench, Menu, ScrollText, X, Moon, Sun, Gamepad2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [showLiveTutor, setShowLiveTutor] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        return (localStorage.getItem('talksmart_theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('talksmart_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Simple Onboarding view
  if (currentView === AppView.ONBOARDING) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-10 animate-fade-in-up">
            <div className="space-y-2">
                <h1 className="text-5xl font-extrabold text-orange-600 tracking-tight">TalkSmart <span className="text-gray-800 dark:text-gray-200">Gujarat</span></h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
                અંગ્રેજી બોલતા શીખો, આત્મવિશ્વાસ સાથે!
                </p>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/50 dark:border-slate-700/50 text-left space-y-6">
              <div className="flex items-start gap-4">
                 <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl shrink-0"><Mic className="text-orange-600 dark:text-orange-400 w-6 h-6"/></div>
                 <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">24/7 Shikshak Bot</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unlimited speaking practice with AI feedback.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl shrink-0"><GraduationCap className="text-blue-600 dark:text-blue-400 w-6 h-6"/></div>
                 <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">Structured Lessons</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">From basics to business conversation.</p>
                 </div>
              </div>
            </div>

            <button 
              onClick={() => setCurrentView(AppView.DASHBOARD)}
              className="w-full bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none hover:bg-orange-700 hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Start Learning (શરૂ કરો)
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-24 md:pb-0 md:pl-72 selection:bg-orange-100 selection:text-orange-800">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 shadow-sm flex justify-between items-center sticky top-0 z-30 border-b border-slate-100 dark:border-slate-800">
        <span className="font-extrabold text-orange-600 text-xl tracking-tight">TalkSmart</span>
        <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                <Menu size={24} />
            </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 shadow-2xl p-6 border-l dark:border-slate-800 flex flex-col" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                      <span className="font-bold text-xl text-slate-800 dark:text-white">Menu</span>
                      <button onClick={() => setMobileMenuOpen(false)}><X className="text-slate-500 dark:text-slate-400" /></button>
                  </div>
                  <div className="space-y-2 flex-1">
                    <MobileMenuButton active={currentView === AppView.DASHBOARD} onClick={() => {setCurrentView(AppView.DASHBOARD); setMobileMenuOpen(false);}} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                    <MobileMenuButton active={currentView === AppView.LESSONS} onClick={() => {setCurrentView(AppView.LESSONS); setMobileMenuOpen(false);}} icon={<GraduationCap size={20}/>} label="Lessons" />
                    <MobileMenuButton active={currentView === AppView.GRAMMAR} onClick={() => {setCurrentView(AppView.GRAMMAR); setMobileMenuOpen(false);}} icon={<ScrollText size={20}/>} label="Grammar" />
                    <MobileMenuButton active={currentView === AppView.GAMES} onClick={() => {setCurrentView(AppView.GAMES); setMobileMenuOpen(false);}} icon={<Gamepad2 size={20}/>} label="Game Arena" />
                    <MobileMenuButton active={currentView === AppView.TOOLS} onClick={() => {setCurrentView(AppView.TOOLS); setMobileMenuOpen(false);}} icon={<Wrench size={20}/>} label="Tools" />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <button 
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                   </div>
              </div>
          </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 h-screen fixed left-0 top-0 border-r border-slate-100 dark:border-slate-800 z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
         <div className="p-8">
            <h1 className="text-3xl font-extrabold text-orange-600 tracking-tight">TalkSmart</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Gujarat Edition</p>
         </div>
         <div className="flex-1 px-6 space-y-2">
            <NavButton 
                active={currentView === AppView.DASHBOARD} 
                onClick={() => setCurrentView(AppView.DASHBOARD)} 
                icon={<LayoutDashboard size={22} />} 
                label="Dashboard" 
            />
            <NavButton 
                active={currentView === AppView.LESSONS} 
                onClick={() => setCurrentView(AppView.LESSONS)} 
                icon={<GraduationCap size={22} />} 
                label="Lessons (પાઠ)" 
            />
            <NavButton 
                active={currentView === AppView.GRAMMAR} 
                onClick={() => setCurrentView(AppView.GRAMMAR)} 
                icon={<ScrollText size={22} />} 
                label="Grammar (વ્યાકરણ)" 
            />
            <NavButton 
                active={currentView === AppView.GAMES} 
                onClick={() => setCurrentView(AppView.GAMES)} 
                icon={<Gamepad2 size={22} />} 
                label="Game Arena (રમત)" 
            />
            <NavButton 
                active={currentView === AppView.TOOLS} 
                onClick={() => setCurrentView(AppView.TOOLS)} 
                icon={<Wrench size={22} />} 
                label="Tools (સાધનો)" 
            />
         </div>
         <div className="px-6 pb-4 space-y-2">
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
                {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
         </div>
         <div className="p-6 pt-0">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-center text-white shadow-lg shadow-orange-200 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                <h3 className="font-bold text-lg mb-2 relative z-10">Start Speaking</h3>
                <p className="text-orange-100 text-sm mb-4 relative z-10">Practice with Pichi</p>
                <button 
                    onClick={() => setShowLiveTutor(true)}
                    className="w-full bg-white text-orange-600 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-50 transition relative z-10 flex items-center justify-center gap-2"
                >
                    <Mic size={16} /> Open Tutor
                </button>
            </div>
         </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 md:p-10 max-w-6xl mx-auto min-h-screen">
        {currentView === AppView.DASHBOARD && <Dashboard onStartTutor={() => setShowLiveTutor(true)} />}
        {currentView === AppView.LESSONS && <LessonMode />}
        {currentView === AppView.GRAMMAR && <GrammarGuide />}
        {currentView === AppView.GAMES && <GameArena />}
        {currentView === AppView.TOOLS && <Tools />}
      </main>

      {/* Mobile Floating Action Button for Live Tutor */}
      <div className="fixed bottom-24 right-6 md:hidden z-30">
        <button 
            onClick={() => setShowLiveTutor(true)}
            className="bg-orange-600 text-white p-4 rounded-full shadow-xl shadow-orange-200 dark:shadow-none hover:bg-orange-700 transition active:scale-95"
        >
            <Mic className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-around p-3 z-30 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <MobileNavButton active={currentView === AppView.DASHBOARD} onClick={() => setCurrentView(AppView.DASHBOARD)} icon={<LayoutDashboard size={24}/>} />
        <MobileNavButton active={currentView === AppView.LESSONS} onClick={() => setCurrentView(AppView.LESSONS)} icon={<GraduationCap size={24}/>} />
        <MobileNavButton active={currentView === AppView.GAMES} onClick={() => setCurrentView(AppView.GAMES)} icon={<Gamepad2 size={24}/>} />
        <MobileNavButton active={currentView === AppView.TOOLS} onClick={() => setCurrentView(AppView.TOOLS)} icon={<Wrench size={24}/>} />
      </div>

      {/* Live Tutor Overlay */}
      {showLiveTutor && (
        <LiveTutor onClose={() => setShowLiveTutor(false)} />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 group ${
        active 
        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-bold shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
    }`}
  >
    <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
    <span>{label}</span>
  </button>
);

const MobileNavButton = ({ active, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all ${
        active 
        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 translate-y-[-4px] shadow-sm' 
        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    {icon}
  </button>
);

const MobileMenuButton = ({ active, onClick, icon, label }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
          active ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
);

export default App;