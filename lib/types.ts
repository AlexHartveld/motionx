export interface Routine {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  frequency: string;
  targetCount: number;
  targetTime: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  logs: RoutineLog[];
  focusSessions: FocusSession[];
}

export interface RoutineLog {
  id: string;
  routineId: string;
  userId: string;
  note: string | null;
  completedAt: Date;
}

export interface FocusSession {
  id: string;
  routineId: string;
  userId: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  isPaused: boolean;
  pausedAt: Date | null;
  totalPaused: number;
  routine: Routine;
}

export interface Stats {
  totalRoutines: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}

export type UserSettings = {
  id: string;
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  sessionReminders: boolean;
  goalNotifications: boolean;
  focusDuration: number;
  breakDuration: number;
};

export type UserStats = {
  // General Stats
  totalFocusTime: number;
  totalSessions: number;
  completedRoutines: number;
  activeRoutines: number;
  currentStreak: number;
  longestStreak: number;
  productivityScore: number;
  focusTimeChange: number;

  // Detailed Stats
  weeklyStats: {
    date: string;
    focusTime: number;
    completedRoutines: number;
    productivity: number;
  }[];
  routinePerformance: {
    routineId: string;
    routineName: string;
    completionRate: number;
    totalFocusTime: number;
    averageSessionLength: number;
    lastCompleted: string;
  }[];
  productiveHours: {
    hour: number;
    sessions: number;
    averageFocusTime: number;
    completionRate: number;
  }[];
  completionRates: {
    date: string;
    rate: number;
    totalTasks: number;
  }[];
  focusDistribution: {
    duration: string;
    count: number;
    effectiveness: number;
  }[];
  streakData: {
    currentStreak: number;
    longestStreak: number;
    totalDaysActive: number;
    averageCompletionsPerDay: number;
    streakHistory: {
      date: string;
      completed: number;
      streak: number;
    }[];
  };
  completedGoals: number;
  activeGoals: number;
}; 