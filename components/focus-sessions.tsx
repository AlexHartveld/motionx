'use client'

import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Play, Pause, Square } from 'lucide-react'
import { Routine, FocusSession } from '@/lib/types'

interface FocusSessionsProps {
  routines: Routine[]
  onComplete: () => void
}

interface SessionState {
  id: string | null
  timeLeft: number
  isRunning: boolean
  startTime: string
  totalPaused: number
}

export default function FocusSessions({ routines, onComplete }: FocusSessionsProps) {
  const [sessions, setSessions] = useState<Record<string, SessionState>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load existing sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('/api/focus-sessions')
        if (!response.ok) return
        
        const activeSessions = await response.json()
        const sessionStates: Record<string, SessionState> = {}
        
        activeSessions.forEach((session: FocusSession) => {
          const startTime = new Date(session.startTime)
          const now = new Date()
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
          const targetSeconds = Number(session.routine?.targetTime) * 60
          const pausedTime = session.totalPaused || 0
          
          // Calculate remaining time
          const timeLeft = Math.max(0, targetSeconds - (elapsedSeconds - pausedTime))
          
          sessionStates[session.routineId] = {
            id: session.id,
            timeLeft,
            isRunning: !session.isPaused,
            startTime: session.startTime,
            totalPaused: pausedTime
          }
        })
        
        setSessions(sessionStates)
      } catch (error) {
        console.error('Error loading sessions:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSessions()
  }, [])

  // Timer effect
  useEffect(() => {
    if (isLoading || Object.keys(sessions).length === 0) {
      return
    }

    const timer = setInterval(() => {
      setSessions(prev => {
        const newSessions = { ...prev }
        let hasChanges = false

        Object.keys(newSessions).forEach(routineId => {
          const session = newSessions[routineId]
          if (session.isRunning && session.timeLeft > 0) {
            newSessions[routineId] = {
              ...session,
              timeLeft: session.timeLeft - 1
            }
            hasChanges = true
          }
        })

        return hasChanges ? newSessions : prev
      })
    }, 1000)

    // Save state before unloading
    const handleBeforeUnload = () => {
      Object.values(sessions).forEach((session) => {
        if (session.isRunning && session.id) {
          fetch(`/api/focus-sessions/${session.id}/pause`, {
            method: 'POST',
            keepalive: true
          }).catch(console.error)
        }
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(timer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [sessions, isLoading])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  const startSession = async (routine: Routine) => {
    try {
      const startTime = new Date().toISOString()
      const response = await fetch('/api/focus-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routineId: routine.id,
          startTime,
        }),
      })

      if (!response.ok) throw new Error('Failed to start session')

      const data = await response.json()
      setSessions(prev => ({
        ...prev,
        [routine.id]: {
          id: data.id,
          timeLeft: Number(routine.targetTime) * 60,
          isRunning: true,
          startTime,
          totalPaused: 0
        }
      }))
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const pauseSession = async (routineId: string) => {
    const session = sessions[routineId];
    if (!session?.id) {
      console.error('No session found for routine:', routineId);
      return;
    }

    try {
      // Calculate current duration before pausing
      const now = new Date();
      const startTime = new Date(session.startTime);
      const currentDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000) - session.totalPaused;

      const pauseData = {
        pausedAt: now.toISOString(),
        duration: currentDuration
      };

      const response = await fetch(`/api/focus-sessions/${session.id}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pauseData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to pause session: ${responseText}`);
      }

      const updatedSession = await response.json();
      setSessions(prev => ({
        ...prev,
        [routineId]: {
          ...prev[routineId],
          isRunning: false,
          totalPaused: updatedSession.totalPaused || prev[routineId].totalPaused
        }
      }));
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  };

  const resumeSession = async (routineId: string) => {
    const session = sessions[routineId];
    if (!session?.id) return;

    try {
      const response = await fetch(`/api/focus-sessions/${session.id}/resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to resume session');

      const updatedSession = await response.json();
      setSessions(prev => ({
        ...prev,
        [routineId]: {
          ...prev[routineId],
          isRunning: true,
          totalPaused: updatedSession.totalPaused || prev[routineId].totalPaused
        }
      }));
    } catch (error) {
      console.error('Error resuming session:', error);
    }
  };

  const endSession = async (routineId: string) => {
    const session = sessions[routineId];
    if (!session?.id) {
      console.error('No session found for routine:', routineId);
      return;
    }

    try {
      // Calculate final duration
      const now = new Date();
      const startTime = new Date(session.startTime);
      const totalTime = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const finalDuration = totalTime - session.totalPaused;

      const endData = {
        endTime: now.toISOString(),
        duration: finalDuration,
        totalPaused: session.totalPaused
      };

      const response = await fetch(`/api/focus-sessions/${session.id}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(endData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to end session: ${responseText}`);
      }

      // We don't need the updated session data since we're removing it from state
      await response.json(); // Just consume the response

      setSessions(prev => {
        const updated = { ...prev };
        delete updated[routineId];
        return updated;
      });
      
      onComplete();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  if (isLoading) {
    return <div>Loading sessions...</div>
  }

  return (
    <ul className="space-y-4">
      {routines.map(routine => {
        const session = sessions[routine.id]
        const timeLeft = session?.timeLeft ?? (Number(routine.targetTime) * 60)

        return (
          <li 
            key={routine.id} 
            className="flex flex-col p-4 bg-white rounded-lg shadow animate-fadeIn"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-lg">{routine.name}</span>
              <div className="text-2xl font-mono font-bold text-gray-800">
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              {!session?.isRunning && !session?.id && (
                <Button
                  onClick={() => startSession(routine)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              )}
              {session?.isRunning && (
                <Button
                  onClick={() => pauseSession(routine.id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              {!session?.isRunning && session?.id && (
                <Button
                  onClick={() => resumeSession(routine.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              {session?.id && (
                <Button
                  onClick={() => endSession(routine.id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  End
                </Button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

