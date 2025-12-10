
import { UserStats, ExamProgress } from '../types';
import { generatePhraseOfTheDay } from '../services/geminiService';

const STATS_KEY = 'talksmart_user_stats';
const EXAM_PROGRESS_KEY = 'talksmart_exam_progress';
const DAILY_PHRASE_KEY = 'talksmart_daily_phrase';

const defaultStats: UserStats = {
  wordsSpoken: 0,
  streakDays: 0,
  topicsMastered: 0,
  fluencyScore: 0,
  xp: 0,
  hearts: 5,
  dailyWordCounts: {},
  completedTopicIds: []
};

export const loadUserStats = (): UserStats => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaultStats to ensure new fields exist for old users
        return { ...defaultStats, ...parsed };
    }
    return defaultStats;
  } catch (e) {
    console.error("Failed to load stats", e);
    return defaultStats;
  }
};

export const saveUserStats = (stats: UserStats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Failed to save stats", e);
  }
};

export const updateHearts = (change: number): number => {
    const stats = loadUserStats();
    let newHearts = stats.hearts + change;
    if (newHearts > 5) newHearts = 5;
    if (newHearts < 0) newHearts = 0;
    
    stats.hearts = newHearts;
    saveUserStats(stats);
    return newHearts;
};

export const addXp = (amount: number): number => {
    const stats = loadUserStats();
    stats.xp = (stats.xp || 0) + amount;
    saveUserStats(stats);
    return stats.xp;
};

export const markTopicComplete = (topicId: string) => {
    const stats = loadUserStats();
    if (!stats.completedTopicIds) stats.completedTopicIds = [];
    
    if (!stats.completedTopicIds.includes(topicId)) {
        stats.completedTopicIds.push(topicId);
        stats.topicsMastered = stats.completedTopicIds.length;
        // Bonus XP for new topic completion
        stats.xp = (stats.xp || 0) + 50;
        saveUserStats(stats);
    }
};

export const incrementWordsSpoken = (count: number) => {
    const stats = loadUserStats();
    stats.wordsSpoken += count;

    const today = new Date().toISOString().split('T')[0];
    
    // Update daily count
    stats.dailyWordCounts = stats.dailyWordCounts || {};
    stats.dailyWordCounts[today] = (stats.dailyWordCounts[today] || 0) + count;
    
    // Streak Logic
    if (stats.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (stats.lastActiveDate === yesterdayStr) {
            stats.streakDays += 1;
        } else {
            stats.streakDays = 1;
        }
        stats.lastActiveDate = today;
    }

    saveUserStats(stats);
};

export const loadExamProgress = (): ExamProgress => {
  try {
    const stored = localStorage.getItem(EXAM_PROGRESS_KEY);
    if (stored) {
        return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load exam progress", e);
  }
  return { unlockedLevelIdx: 0, history: [] };
};

export const saveExamProgress = (levelIdx: number, levelId: string, score: number) => {
  try {
    const current = loadExamProgress();
    const updated: ExamProgress = {
        unlockedLevelIdx: Math.max(current.unlockedLevelIdx, levelIdx),
        history: [...current.history, { levelId, score, date: new Date().toISOString() }]
    };
    localStorage.setItem(EXAM_PROGRESS_KEY, JSON.stringify(updated));
    
    // Update main stats
    const stats = loadUserStats();
    stats.topicsMastered += 1; 
    stats.fluencyScore = Math.min(100, stats.fluencyScore + 5);
    stats.xp = (stats.xp || 0) + 100; // Big XP boost for exams
    saveUserStats(stats);
  } catch (e) {
    console.error("Failed to save exam progress", e);
  }
};

export const loadDailyPhrase = async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem(DAILY_PHRASE_KEY);
        
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.date === today) {
                return parsed.phraseData;
            }
        }
        
        // If no phrase for today, generate new one
        const newPhrase = await generatePhraseOfTheDay();
        if (newPhrase) {
            saveDailyPhrase(newPhrase);
            return newPhrase;
        }
        return null;
    } catch (e) {
        console.error("Error loading daily phrase", e);
        return null;
    }
};

export const saveDailyPhrase = (phraseData: any) => {
    const today = new Date().toISOString().split('T')[0];
    const data = { date: today, phraseData };
    localStorage.setItem(DAILY_PHRASE_KEY, JSON.stringify(data));
};