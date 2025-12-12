import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import Dashboard from './components/Dashboard';
import LessonMode from './components/LessonMode';
import LiveTutor from './components/LiveTutor';
import Tools from './components/Tools';
import GrammarGuide from './components/GrammarGuide';
import GameArena from './components/GameArena';
import LandingPage from './components/LandingPage';
import { LayoutDashboard, GraduationCap, Mic, Wrench, Menu, ScrollText, X, Gamepad2, Sparkles, LogOut, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  // Check if user has "onboarded" (clicked start before)
  const [currentView, setCurrentView] = useState<AppView>(() => {
      const hasVisited = localStorage.getItem('talksmart_has_visited');
      return hasVisited ? AppView.DASHBOARD : AppView.ONBOARDING;
  });

  const [showLiveTutor, setShowLiveTutor] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
      const saved = localStorage.getItem('talksmart_theme');
      if (saved) return saved as 'dark' | 'light';
      return 'dark'; // Default to dark
  });

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('talksmart_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleStart = () => {
      localStorage.setItem('talksmart_has_visited', 'true');
      setCurrentView(AppView.DASHBOARD);
  };
  
  const handleLogout = () => {
      localStorage.removeItem('talksmart_has_visited');
      setCurrentView(AppView.ONBOARDING);
  }

  // Onboarding / Landing View
  if (currentView === AppView.ONBOARDING) {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans pb-24 md:pb-0 md:pl-[280px] overflow-x-hidden selection:bg-indigo-500/30 transition-colors duration-300">
      
      {/* Background Gradients (Dark Mode only or adjusted opacity for light) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/5 dark:bg-emerald-600/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden glass-panel bg-white/80 dark:bg-[#0f172a]/60 px-5 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-slate-200 dark:border-white/5 backdrop-blur-md">
        <span className="font-black text-slate-800 dark:text-white text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white text-xs shadow-lg shadow-indigo-500/20">SM</div>
            SpeakMate
        </span>
        <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition">
                <Menu size={24} />
            </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-sm md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-white/10 shadow-2xl p-6 flex flex-col animate-slide-in-right" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-8">
                      <span className="font-bold text-xl text-slate-800 dark:text-white">Menu</span>
                      <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white"><X /></button>
                  </div>
                  <div className="space-y-2 flex-1">
                    <MobileMenuButton active={currentView === AppView.DASHBOARD} onClick={() => {setCurrentView(AppView.DASHBOARD); setMobileMenuOpen(false);}} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
                    
                    <button 
                      onClick={() => {setShowLiveTutor(true); setMobileMenuOpen(false);}}
                      className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition text-white font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 shadow-lg shadow-indigo-900/50 my-4"
                    >
                      <Mic size={20}/>
                      <span>Live Tutor</span>
                    </button>

                    <MobileMenuButton active={currentView === AppView.LESSONS} onClick={() => {setCurrentView(AppView.LESSONS); setMobileMenuOpen(false);}} icon={<GraduationCap size={20}/>} label="Lessons" />
                    <MobileMenuButton active={currentView === AppView.GRAMMAR} onClick={() => {setCurrentView(AppView.GRAMMAR); setMobileMenuOpen(false);}} icon={<ScrollText size={20}/>} label="Grammar" />
                    <MobileMenuButton active={currentView === AppView.GAMES} onClick={() => {setCurrentView(AppView.GAMES); setMobileMenuOpen(false);}} icon={<Gamepad2 size={20}/>} label="Game Arena" />
                    <MobileMenuButton active={currentView === AppView.TOOLS} onClick={() => {setCurrentView(AppView.TOOLS); setMobileMenuOpen(false);}} icon={<Wrench size={20}/>} label="Tools" />
                  </div>
                  
                  <button onClick={toggleTheme} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition mt-auto px-4 py-3 mb-2 font-medium">
                      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition px-4 py-3 font-medium">
                      <LogOut size={18} /> Logout
                  </button>
              </div>
          </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-[280px] h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#020617]/50 backdrop-blur-xl z-30 transition-colors duration-300">
         <div className="p-8 pb-6">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-white text-xs shadow-lg shadow-indigo-500/20">
                    <Sparkles size={16} fill="currentColor" />
                </div>
                SpeakMate
            </h1>
         </div>
         
         <div className="flex-1 px-4 space-y-1 overflow-y-auto py-2 custom-scrollbar">
            <NavButton 
                active={currentView === AppView.DASHBOARD} 
                onClick={() => setCurrentView(AppView.DASHBOARD)} 
                icon={<LayoutDashboard size={20} />} 
                label="Dashboard" 
            />
            
            <button 
                onClick={() => setShowLiveTutor(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group text-white font-bold bg-gradient-to-r from-indigo-600 to-emerald-600 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] my-6"
            >
                <Mic size={20} className="animate-pulse" />
                <span>Live Tutor</span>
            </button>

            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 py-2 mt-2">Learn</div>
            <NavButton 
                active={currentView === AppView.LESSONS} 
                onClick={() => setCurrentView(AppView.LESSONS)} 
                icon={<GraduationCap size={20} />} 
                label="Lessons" 
            />
            <NavButton 
                active={currentView === AppView.GRAMMAR} 
                onClick={() => setCurrentView(AppView.GRAMMAR)} 
                icon={<ScrollText size={20} />} 
                label="Grammar" 
            />
            <NavButton 
                active={currentView === AppView.GAMES} 
                onClick={() => setCurrentView(AppView.GAMES)} 
                icon={<Gamepad2 size={20} />} 
                label="Game Arena" 
            />
            
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4 py-2 mt-4">Practice</div>
            <NavButton 
                active={currentView === AppView.TOOLS} 
                onClick={() => setCurrentView(AppView.TOOLS)} 
                icon={<Wrench size={20} />} 
                label="Tools" 
            />
         </div>
         
         <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-2">
             <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition text-sm font-medium">
                 {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />} {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
             </button>
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-white hover:bg-red-50 dark:hover:bg-white/5 transition text-sm font-medium">
                 <LogOut size={18} /> Sign Out
             </button>
         </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen relative z-10">
        {currentView === AppView.DASHBOARD && <Dashboard onStartTutor={() => setShowLiveTutor(true)} />}
        {currentView === AppView.LESSONS && <LessonMode />}
        {currentView === AppView.GRAMMAR && <GrammarGuide />}
        {currentView === AppView.GAMES && <GameArena />}
        {currentView === AppView.TOOLS && <Tools />}
      </main>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-24 right-6 md:hidden z-30">
        <button 
            onClick={() => setShowLiveTutor(true)}
            className="bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-500/40 hover:scale-110 transition-transform active:scale-95 flex items-center justify-center border border-white/10"
        >
            <Mic className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 flex justify-around p-3 z-30 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <MobileNavButton active={currentView === AppView.DASHBOARD} onClick={() => setCurrentView(AppView.DASHBOARD)} icon={<LayoutDashboard size={24}/>} />
        <MobileNavButton active={currentView === AppView.LESSONS} onClick={() => setCurrentView(AppView.LESSONS)} icon={<GraduationCap size={24}/>} />
        <MobileNavButton active={currentView === AppView.GAMES} onClick={() => setCurrentView(AppView.GAMES)} icon={<Gamepad2 size={24}/>} />
        <MobileNavButton active={currentView === AppView.TOOLS} onClick={() => setCurrentView(AppView.TOOLS)} icon={<Wrench size={24}/>} />
      </div>

      {/* Live Tutor Overlay */}
      {showLiveTutor && (
        <LiveTutor 
          onClose={() => setShowLiveTutor(false)} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        active 
        ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white font-bold shadow-sm border border-indigo-100 dark:border-white/5' 
        : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"></div>}
    <span className={`relative z-10 transition-transform duration-200 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{icon}</span>
    <span className="relative z-10">{label}</span>
  </button>
);

const MobileNavButton = ({ active, onClick, icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl transition-all ${
        active 
        ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 translate-y-[-4px] shadow-lg shadow-indigo-900/10 dark:shadow-indigo-900/20 border border-indigo-100 dark:border-white/5' 
        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
    }`}
  >
    {icon}
  </button>
);

const MobileMenuButton = ({ active, onClick, icon, label }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition font-medium ${
          active 
          ? 'bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-white/5' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
);

export default App;