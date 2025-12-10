
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { UserStats } from '../types';
import { Trophy, Flame, BookOpen, Activity, ArrowRight, Star, Heart, Zap } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Your Profile</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Keep your streak alive!</p>
        </div>
      </div>

      {/* Gamified Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap gap-6 items-center justify-around">
          {/* XP */}
          <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl text-yellow-600 dark:text-yellow-400">
                  <Zap size={28} fill="currentColor" />
              </div>
              <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.xp}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total XP</div>
              </div>
          </div>

          <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>

          {/* Streak */}
          <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl text-orange-600 dark:text-orange-400">
                  <Flame size={28} fill="currentColor" />
              </div>
              <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.streakDays}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Day Streak</div>
              </div>
          </div>

          <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>

          {/* Hearts */}
          <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl text-rose-500 dark:text-rose-400">
                  <Heart size={28} fill="currentColor" />
              </div>
              <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.hearts}/5</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hearts</div>
              </div>
          </div>
          
           <div className="w-px h-12 bg-slate-100 dark:bg-slate-800 hidden md:block"></div>

           {/* Fluency */}
          <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <Trophy size={28} fill="currentColor" />
              </div>
              <div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white">{stats.fluencyScore}%</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fluency</div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Activity Graph</h3>
            <div className="bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 rounded-lg px-3 py-1.5 uppercase tracking-wide">
                7 Days
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 12, fill: '#94a3b8', fontWeight: 'bold'}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10}
                />
                <YAxis 
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip 
                  cursor={{fill: 'rgba(0,0,0,0.02)'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', backgroundColor: '#1e293b', color: '#fff' }}
                />
                <Bar dataKey="words" radius={[6, 6, 6, 6]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 6 ? '#f97316' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Side Panel: Daily Goal & Phrase */}
        <div className="space-y-6">
             {/* Phrase of the Day */}
            <div className="bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 p-1 rounded-3xl shadow-lg shadow-indigo-200 dark:shadow-none">
                <div className="bg-indigo-500 dark:bg-indigo-700 p-6 rounded-[22px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-white">
                        <Star size={80} fill="currentColor"/>
                    </div>
                    <div className="relative z-10 text-white">
                        <h3 className="font-bold text-indigo-200 uppercase text-xs tracking-wider mb-2">Phrase of the Day</h3>
                        <p className="text-2xl font-black mb-1 leading-tight tracking-tight">"{phrase.phrase}"</p>
                        <p className="text-indigo-200 text-sm mb-6 italic opacity-80">{phrase.pronunciation}</p>
                        
                        <div className="bg-black/10 backdrop-blur-md p-4 rounded-xl border border-white/10 mb-4">
                            <p className="text-sm font-bold">{phrase.gujaratiMeaning}</p>
                        </div>

                        <button 
                            onClick={speakPhrase}
                            className="w-full flex items-center justify-center gap-2 bg-white text-indigo-600 px-4 py-3 rounded-xl text-sm font-extrabold hover:bg-indigo-50 transition shadow-sm border-b-4 border-indigo-100"
                        >
                            <Activity size={18} /> LISTEN
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Action */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white mb-2">Pichi is waiting!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    Earn 20 XP by having a 2 minute conversation.
                </p>
                <button 
                    onClick={onStartTutor}
                    className="w-full py-3 rounded-xl bg-orange-500 text-white font-extrabold border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                    START CONVERSATION
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
