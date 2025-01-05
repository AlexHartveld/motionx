'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Play, Pause } from 'lucide-react'
import { Routine } from '@/lib/types'

interface FocusSessionsProps {
  routines: Routine[]
  onComplete: () => void
}

export default function FocusSessions({ routines, onComplete }: FocusSessionsProps) {
  const [activeRoutines, setActiveRoutines] = useState<Record<string, { 
    timeLeft: number, 
    isRunning: boolean 
  }>>({})

  const toggleRoutine = (routineId: string, targetTime: number) => {
    setActiveRoutines(prev => {
      const current = prev[routineId]
      if (!current) {
        // Start new timer
        return {
          ...prev,
          [routineId]: {
            timeLeft: targetTime * 60,
            isRunning: true
          }
        }
      }
      // Toggle existing timer
      return {
        ...prev,
        [routineId]: {
          ...current,
          isRunning: !current.isRunning
        }
      }
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRoutines(prev => {
        const updated = { ...prev }
        let hasChanges = false

        Object.entries(updated).forEach(([routineId, session]) => {
          if (session.isRunning && session.timeLeft > 0) {
            updated[routineId] = {
              ...session,
              timeLeft: session.timeLeft - 1
            }
            hasChanges = true

            if (session.timeLeft <= 1) {
              onComplete()
              delete updated[routineId]
            }
          }
        })

        return hasChanges ? updated : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <ul className="space-y-2">
      {routines.map(routine => {
        const session = activeRoutines[routine.id]
        const isActive = session?.isRunning
        const timeLeft = session?.timeLeft ?? (Number(routine.targetTime || 30) * 60)
        const minutes = Math.floor(timeLeft / 60)
        const seconds = timeLeft % 60

        return (
          <li key={routine.id} className="flex items-center justify-between animate-fadeIn">
            <span>{routine.name}</span>
            <div className="flex items-center">
              <span className="mr-2">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
              <Button
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRoutine(routine.id, Number(routine.targetTime || 30))}
                className="brutalist-border brutalist-hover"
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

