'use client';

import { useState, useEffect } from 'react';
import { Routine } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Timer } from 'lucide-react';

interface FocusSessionProps {
  routine: Routine;
  onComplete: () => void;
}

export default function FocusSession({ routine, onComplete }: FocusSessionProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(Number(routine.targetTime) * 60); // Convert minutes to seconds
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const startSession = async () => {
    try {
      const response = await fetch('/api/focus-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineId: routine.id,
        }),
      });
      const data = await response.json();
      setSessionId(data.id);
      setTimeLeft(Number(routine.targetTime) * 60);
      setIsRunning(true);
    } catch (error) {
      console.error('Error starting focus session:', error);
    }
  };

  const pauseSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`/api/focus-sessions/${sessionId}/pause`, {
        method: 'POST',
      });
      setIsRunning(false);
    } catch (error) {
      console.error('Error pausing focus session:', error);
    }
  };

  const resumeSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`/api/focus-sessions/${sessionId}/resume`, {
        method: 'POST',
      });
      setIsRunning(true);
    } catch (error) {
      console.error('Error resuming focus session:', error);
    }
  };

  const endSession = async () => {
    if (!sessionId) return;

    try {
      await fetch(`/api/focus-sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration: Number(routine.targetTime) * 60 - timeLeft,
        }),
      });
      setIsRunning(false);
      setTimeLeft(Number(routine.targetTime) * 60);
      setSessionId(null);
      onComplete();
    } catch (error) {
      console.error('Error ending focus session:', error);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 min-w-[200px]">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex gap-1">
          {!isRunning && !sessionId && (
            <Button
              onClick={startSession}
              size="sm"
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          )}
          {isRunning && (
            <Button
              onClick={pauseSession}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Pause className="h-3 w-3" />
              Pause
            </Button>
          )}
          {!isRunning && sessionId && (
            <Button
              onClick={resumeSession}
              size="sm"
              variant="outline"
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              Resume
            </Button>
          )}
          {sessionId && (
            <Button
              onClick={endSession}
              size="sm"
              variant="destructive"
              className="flex items-center gap-1"
            >
              <Square className="h-3 w-3" />
              End
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 