import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { UserStats } from '../types';
import { Trophy, Flame, Activity, ArrowRight, Star, Heart, Zap, Loader2, PlayCircle, BarChart3 } from 'lucide-react';
import { loadUserStats, loadDailyPhrase } from '../utils/progressUtils';

// Placeholder for phrase of the day if API fails or to show initially
const initialPhrase = {
    phrase: "Practice makes perfect",
    gujaratiMeaning: "મહાવરો માણસને સંપૂર્ણ બનાવે છે",
    pronunciation: "પ્રેક્ટિસ મેક્સ પરફેક્ટ"
};

interface DashboardProps {
    onStartTutor: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartTutor }) => {
  const [stats, setStats] = useState<UserStats>({
      wordsSpoken: 0,
      streakDays: 0,
      topicsMastered: 0,
      fluencyScore: 0,
      xp: 0,
      hearts: 5,
      dailyWordCounts: {},
      completedTopicIds: []
  });

  const [phrase, setPhrase] = useState(initialPhrase);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingPhrase, setLoadingPhrase] = useState(true);

  useEffect(() => {
    // Load Stats
    const loadedStats = loadUserStats();
    setStats(loadedStats);
    
    // Generate Chart Data for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = days[d.getDay()];
        const count = loadedStats.dailyWordCounts && loadedStats.dailyWordCounts[dateStr] 
            ? loadedStats.dailyWordCounts[dateStr] 
            : 0;
        data.push({ name: dayName, words: count });
    }
    setChartData(data);

    // Load Daily Phrase
    const fetchPhrase = async () => {
        const daily = await loadDailyPhrase();
        if (daily) setPhrase(daily);
        setLoadingPhrase(false);
    };
    fetchPhrase();
  }, []);

  const speakPhrase = () => {
     if ('speechSynthesis' in window) {
         const utterance = new SpeechSynthesisUtterance(phrase.phrase);
         utterance.lang = 'en-US';
         window.speechSynthesis.speak(utterance);
     }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 relative z-10">
        <div>
            <h2 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">Welcome back!</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium text-lg">Ready to continue your English journey?</p>
        </div>
      </div>

      {/* Gamified Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={<Zap size={20} fill="currentColor" />} 
            label="Total XP" 
            value={stats.xp || 0} 
            color="yellow" 
          />
          <StatCard 
            icon={<Flame size={20} fill="currentColor" />} 
            label="Day Streak" 
            value={stats.streakDays} 
            suffix="days"
            color="orange" 
          />
          <StatCard 
            icon={<Heart size={20} fill="currentColor" />} 
            label="Hearts" 
            value={`${stats.hearts}/5`} 
            color="rose" 
          />
          <StatCard 
            icon={<Trophy size={20} fill="currentColor" />} 
            label="Fluency" 
            value={`${stats.fluencyScore}%`} 
            color="emerald" 
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] p-8 rounded-[32px] border border-slate-200 dark:border-slate-800/50 shadow-xl shadow-slate-200/50 dark:shadow-black/20 min-h-[350px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <BarChart3 size={120} className="text-slate-900 dark:text-white" />
          </div>
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Learning Activity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Words spoken this week</p>
            </div>
          </div>
          <div className="h-64 w-full relative z-10">
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b833" />
                    <XAxis 
                        dataKey="name" 
                        tick={{fontSize: 12, fill: '#64748b', fontWeight: 'bold'}} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                    />
                    <YAxis 
                        tick={{fontSize: 12, fill: '#64748b'}} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <Tooltip 
                    cursor={{fill: 'rgba(99, 102, 241, 0.1)', radius: 8}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px 16px', backgroundColor: '#1e293b', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                    />
                    <Bar dataKey="words" radius={[6, 6, 6, 6]} barSize={40}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#6366f1' : '#cbd5e1'} className="transition-all duration-300 hover:opacity-80 dark:fill-opacity-100" />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-slate-600" />
                </div>
            )}
          </div>
        </div>
        
        {/* Side Panel: Daily Goal & Phrase */}
        <div className="space-y-6 flex flex-col">
             {/* Phrase of the Day */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] shadow-2xl shadow-indigo-900/30 dark:shadow-black/30 min-h-[260px] relative overflow-hidden flex flex-col text-white group border border-white/10">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <Star size={120} fill="currentColor" className="rotate-12"/>
                </div>
                
                <div className="p-8 flex-1 flex flex-col relative z-10">
                    {loadingPhrase ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-indigo-200">
                             <Loader2 className="animate-spin mb-2" />
                             <span className="text-xs uppercase font-bold tracking-widest">Loading Phrase...</span>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-indigo-100 uppercase text-[10px] tracking-widest border border-white/20 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-sm">Phrase of the Day</h3>
                            </div>
                            
                            <p className="text-3xl font-black mb-2 leading-tight tracking-tight">"{phrase.phrase}"</p>
                            <p className="text-indigo-200 text-sm italic opacity-80 mb-6 font-medium">/{phrase.pronunciation}/</p>
                            
                            <div className="mt-auto">
                                <p className="text-base font-bold mb-4 opacity-90">{phrase.gujaratiMeaning}</p>
                                <button 
                                    onClick={speakPhrase}
                                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-4 py-3 rounded-xl text-sm font-extrabold transition border border-white/10 hover:border-white/30"
                                >
                                    <Activity size={18} /> Listen Pronunciation
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Quick Action */}
            <button 
                onClick={onStartTutor}
                className="group w-full bg-white dark:bg-[#0f172a] p-6 rounded-[32px] border border-slate-200 dark:border-slate-800/50 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all text-left relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                             <PlayCircle fill="currentColor" size={24} />
                         </div>
                         <h3 className="font-bold text-slate-800 dark:text-white text-lg">Pichi is waiting!</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed max-w-[80%]">
                        Earn <span className="text-indigo-600 dark:text-indigo-400 font-bold">20 XP</span> by having a 2 minute conversation.
                    </p>
                    <div className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                        START CONVERSATION <ArrowRight size={16} />
                    </div>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, suffix, color }: any) => {
    const colorClasses: any = {
        yellow: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500',
        orange: 'bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500',
        rose: 'bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-500',
        emerald: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
    };

    return (
        <div className="bg-white dark:bg-[#0f172a] rounded-[28px] p-5 border border-slate-200 dark:border-slate-800/50 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 shadow-sm dark:shadow-none">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-20 dark:opacity-20 ${colorClasses[color].split(' ')[0].replace('100', '200')}`}></div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-2xl ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</span>
                </div>
                <div className="text-3xl font-black text-slate-800 dark:text-white">
                    {value} {suffix && <span className="text-sm text-slate-400 font-bold">{suffix}</span>}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;