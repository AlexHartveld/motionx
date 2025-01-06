export interface Routine {
  id: string;
  name: string;
  targetTime: string | number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FocusSession {
  id: string;
  routineId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  isPaused?: boolean;
  pausedAt?: string;
  totalPaused: number;
  routine?: Routine;
} 