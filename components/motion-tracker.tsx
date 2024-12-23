'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Plus } from 'lucide-react'

export default function MotionTracker() {
  const [activities, setActivities] = useState([
    { id: 1, name: 'Deep Work', duration: 0, active: false },
    { id: 2, name: 'Brainstorming', duration: 0, active: false },
  ])
  const [newActivity, setNewActivity] = useState('')

  const addActivity = () => {
    if (newActivity.trim() !== '') {
      setActivities([...activities, { id: Date.now(), name: newActivity, duration: 0, active: false }])
      setNewActivity('')
    }
  }

  const toggleActivity = (id: number) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, active: !activity.active } : activity
    ))
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl">Motion Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input 
            type="text" 
            placeholder="New activity" 
            value={newActivity} 
            onChange={(e) => setNewActivity(e.target.value)}
            className="mr-2 bg-gray-700 border-gray-600 text-white"
          />
          <Button onClick={addActivity}><Plus className="h-4 w-4" /></Button>
        </div>
        <ul className="space-y-2">
          {activities.map(activity => (
            <li key={activity.id} className="flex items-center justify-between">
              <span>{activity.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')}</span>
                <Button
                  variant={activity.active ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleActivity(activity.id)}
                >
                  {activity.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

