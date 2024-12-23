'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Check } from 'lucide-react'

export default function GoalsSection() {
  const [goals, setGoals] = useState([
    { id: 1, description: 'Launch MVP', completed: false },
    { id: 2, description: 'Secure seed funding', completed: false },
    { id: 3, description: 'Hire key team members', completed: true },
  ])
  const [newGoal, setNewGoal] = useState('')

  const addGoal = () => {
    if (newGoal.trim() !== '') {
      setGoals([...goals, { id: Date.now(), description: newGoal, completed: false }])
      setNewGoal('')
    }
  }

  const toggleGoal = (id: number) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))
  }

  return (
    <Card className="brutalist-border brutalist-hover bg-orange-100 dark:bg-orange-900">
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
            className="mr-2 bg-white dark:bg-gray-800 text-black dark:text-white brutalist-border"
          />
          <Button onClick={addGoal} className="brutalist-border brutalist-hover"><Plus className="h-4 w-4" /></Button>
        </div>
        <ul className="space-y-2">
          {goals.map(goal => (
            <li key={goal.id} className="flex items-center animate-fadeIn">
              <Button
                variant={goal.completed ? "default" : "outline"}
                size="sm"
                className="mr-2 brutalist-border brutalist-hover"
                onClick={() => toggleGoal(goal.id)}
              >
                <Check className={`h-4 w-4 ${goal.completed ? 'opacity-100' : 'opacity-0'}`} />
              </Button>
              <span className={goal.completed ? 'line-through' : ''}>{goal.description}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

