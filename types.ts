
export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  LIVE_TUTOR = 'LIVE_TUTOR',
  LESSONS = 'LESSONS',
  TOOLS = 'TOOLS',
  GRAMMAR = 'GRAMMAR',
  GAMES = 'GAMES'
}

export interface UserStats {
  wordsSpoken: number;
  streakDays: number;
  topicsMastered: number;
  fluencyScore: number;
  xp: number; // New: Experience Points
  hearts: number; // New: Lives (max 5)
  lastHeartRefill?: string; // New: Timestamp for refill
  lastActiveDate?: string;
  dailyWordCounts: Record<string, number>;
  completedTopicIds: string[]; // New: Track specific completed lessons
}

export interface Lesson {
  id: string;
  title: string;
  titleGujarati: string;
  description: string;
  category: 'Business' | 'Social' | 'Travel' | 'Cultural';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  translation?: string;
  isCorrection?: boolean;
}

export interface ExamProgress {
  unlockedLevelIdx: number;
  history: {
    levelId: string;
    score: number;
    date: string;
  }[];
}