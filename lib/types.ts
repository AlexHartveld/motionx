export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
  logs: HabitLog[];
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  note?: string;
  completedAt: Date;
}

export interface Stats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
} 