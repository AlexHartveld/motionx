'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Routine } from '@/lib/types'
import ConfirmationDialog from './confirmation-dialog'
import AddRoutineForm from './add-routine-form'
import LoadingSpinner from './loading-spinner'

interface RoutineTrackerProps {
  onRoutinesUpdate: (routines: Routine[]) => void;
}

export default function RoutineTracker({ onRoutinesUpdate }: RoutineTrackerProps) {
  const { user } = useUser()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [routineToDelete, setRoutineToDelete] = useState<string | null>(null)

  const fetchRoutines = useCallback(async () => {
    try {
      const response = await fetch('/api/routines')
      const data = await response.json()
      setRoutines(data)
      onRoutinesUpdate(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching routines:', error)
      setLoading(false)
    }
  }, [onRoutinesUpdate])

  useEffect(() => {
    if (!user) {
      setRoutines([])
      setLoading(false)
      return
    }

    fetchRoutines()
  }, [user, fetchRoutines])

  if (!user) {
    return (
      <div className="text-center p-8 mt-16">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Please sign in to track your routines
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mt-16">
        <LoadingSpinner />
      </div>
    )
  }

  async function handleComplete(routineId: string) {
    try {
      await fetch(`/api/routines/${routineId}/log`, {
        method: 'POST'
      })
      fetchRoutines()
    } catch (error) {
      console.error('Error logging routine:', error)
    }
  }

  function isCompletedToday(routine: Routine): boolean {
    return routine.logs.some(log => {
      const logDate = new Date(log.completedAt)
      const today = new Date()
      return logDate.toDateString() === today.toDateString()
    })
  }

  async function handleDelete(routineId: string) {
    try {
      await fetch(`/api/routines/${routineId}`, {
        method: 'DELETE'
      })
      fetchRoutines()
      setRoutineToDelete(null)
    } catch (error) {
      console.error('Error deleting routine:', error)
    }
  }

  return (
    <div className="space-y-6 mt-16 px-4 max-w-7xl mx-auto">
      <AddRoutineForm onAdd={fetchRoutines} />
      
      {routines.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            No routines yet. Add one to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {routines.map(routine => (
            <div
              key={routine.id}
              className={`p-4 rounded-lg brutalist-border ${
                isCompletedToday(routine)
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold text-black dark:text-white">{routine.name}</h3>
                      {routine.description && (
                        <p className="text-gray-600 dark:text-gray-400">{routine.description}</p>
                      )}
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p>Frequency: {routine.frequency}</p>
                        <p>Target: {routine.targetCount} times</p>
                        <p>Current Streak: {routine.currentStreak} days</p>
                        <p>Longest Streak: {routine.longestStreak} days</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <button
                    onClick={() => handleComplete(routine.id)}
                    disabled={isCompletedToday(routine)}
                    className={`px-4 py-2 rounded ${
                      isCompletedToday(routine)
                        ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                        : 'bg-black dark:bg-white text-white dark:text-black brutalist-hover'
                    }`}
                  >
                    {isCompletedToday(routine) ? 'Completed' : 'Complete'}
                  </button>
                  <button
                    onClick={() => setRoutineToDelete(routine.id)}
                    className="px-4 py-2 border-2 border-black dark:border-white text-black dark:text-white rounded brutalist-hover"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmationDialog
        isOpen={!!routineToDelete}
        onClose={() => setRoutineToDelete(null)}
        onConfirm={() => routineToDelete && handleDelete(routineToDelete)}
        title="Delete Routine"
        message="Are you sure you want to delete this routine? This action cannot be undone."
      />
    </div>
  )
}

