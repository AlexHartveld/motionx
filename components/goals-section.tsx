'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import LoadingSpinner from './loading-spinner'

interface Goal {
  id: number
  description: string
  completed: boolean
}

export default function GoalsSection() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (!response.ok) {
        throw new Error('Failed to fetch goals')
      }
      const data = await response.json()
      setGoals(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching goals:', error)
      setLoading(false)
    }
  }

  const addGoal = async () => {
    if (newGoal.trim() === '') return

    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newGoal.trim()
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to add goal')
      }

      const goal = await response.json()
      setGoals(prevGoals => [goal, ...prevGoals])
      setNewGoal('')
    } catch (error) {
      console.error('Error adding goal:', error)
    }
  }

  const toggleGoal = async (id: number) => {
    try {
      const goal = goals.find(g => g.id === id)
      if (!goal) return

      const response = await fetch(`/api/goals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !goal.completed
        })
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to toggle goal')
      }

      const updatedGoal = await response.json()
      setGoals(prevGoals => prevGoals.map(g => g.id === id ? updatedGoal : g))
    } catch (error) {
      console.error('Error toggling goal:', error)
    }
  }

  const deleteGoal = async (id: number) => {
    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to delete goal')
      }

      setGoals(prevGoals => prevGoals.filter(g => g.id !== id))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addGoal()
    }
  }

  if (loading) {
    return (
      <Card className="brutalist-border brutalist-hover bg-orange-100 dark:bg-orange-900/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">GOALS</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="brutalist-border brutalist-hover bg-orange-100 dark:bg-orange-900/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">GOALS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input 
            type="text" 
            placeholder="New goal" 
            value={newGoal} 
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={handleKeyPress}
            className="mr-2 bg-white dark:bg-gray-800 text-black dark:text-white brutalist-border"
          />
          <Button onClick={addGoal} className="brutalist-border brutalist-hover">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-2">
          {goals.map(goal => (
            <li 
              key={goal.id} 
              className={cn(
                "group flex items-center justify-between p-2 rounded animate-fadeIn",
                "bg-white dark:bg-gray-800 brutalist-border",
                goal.completed && "bg-green-50 dark:bg-green-900/20"
              )}
            >
              <div className="flex items-center flex-1">
                <Button
                  variant={goal.completed ? "default" : "outline"}
                  size="sm"
                  className="mr-2 brutalist-border brutalist-hover"
                  onClick={() => toggleGoal(goal.id)}
                >
                  <Check className={`h-4 w-4 ${goal.completed ? 'opacity-100' : 'opacity-0'}`} />
                </Button>
                <span className={cn(
                  "flex-1",
                  goal.completed && "line-through text-gray-500 dark:text-gray-400"
                )}>
                  {goal.description}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteGoal(goal.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

