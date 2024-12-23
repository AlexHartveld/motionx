'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Habit, Stats } from '@/lib/types'
import LoadingSpinner from './loading-spinner'
import AddHabitForm from './add-habit-form'
import { Trash2 } from 'lucide-react'
import ConfirmationDialog from './confirmation-dialog'

export default function HabitTracker() {
  const { isSignedIn, isLoaded } = useAuth()
  const [habits, setHabits] = useState<Habit[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setHabits([])
      setStats(null)
      setLoading(false)
      return
    }

    if (isSignedIn) {
      fetchHabits()
      fetchStats()
    }
  }, [isSignedIn, isLoaded])

  async function fetchHabits() {
    try {
      const response = await fetch('/api/habits')
      const data = await response.json()
      setHabits(data)
    } catch (error) {
      console.error('Error fetching habits:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  async function handleComplete(habitId: string) {
    try {
      await fetch(`/api/habits/${habitId}/log`, {
        method: 'POST',
      })
      fetchHabits()
      fetchStats()
    } catch (error) {
      console.error('Error logging habit:', error)
    }
  }

  function isCompletedToday(habit: Habit): boolean {
    return habit.logs.some(log => {
      const logDate = new Date(log.completedAt)
      const today = new Date()
      return logDate.toDateString() === today.toDateString()
    })
  }

  async function handleDelete(habitId: string) {
    try {
      await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      })
      fetchHabits()
      setHabitToDelete(null)
    } catch (error) {
      console.error('Error deleting habit:', error)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg brutalist-border">
      <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">Habit Tracker</h2>
      <AddHabitForm onAdd={fetchHabits} />
      <div className="space-y-4">
        {habits.map((habit) => (
          <div 
            key={habit.id} 
            className="relative p-4 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-between hover:transform hover:scale-[1.02] transition-transform"
          >
            <button
              onClick={() => setHabitToDelete(habit.id)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete habit"
            >
              <Trash2 size={16} />
            </button>
            <div>
              <h3 className="font-semibold text-lg text-black dark:text-white">{habit.name}</h3>
              {habit.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{habit.description}</p>
              )}
              <div className="mt-1 space-x-2">
                <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-800 dark:text-blue-100">
                  {habit.currentStreak} day streak
                </span>
                {isCompletedToday(habit) && (
                  <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full text-green-800 dark:text-green-100">
                    Practiced today
                  </span>
                )}
              </div>
            </div>
            {!isCompletedToday(habit) && (
              <button
                onClick={() => handleComplete(habit.id)}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors brutalist-hover"
              >
                Complete
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={!!habitToDelete}
        onClose={() => setHabitToDelete(null)}
        onConfirm={() => habitToDelete && handleDelete(habitToDelete)}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? This action cannot be undone, but your activity history will be preserved."
      />
    </div>
  )
}

