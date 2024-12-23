'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Play, Pause, Plus } from 'lucide-react'

export default function FocusSessions() {
  const [sessions, setSessions] = useState([
    { id: 1, name: 'Deep Work', duration: 0, active: false },
    { id: 2, name: 'Brainstorming', duration: 0, active: false },
  ])
  const [newSession, setNewSession] = useState('')

  const addSession = () => {
    if (newSession.trim() !== '') {
      setSessions([...sessions, { id: Date.now(), name: newSession, duration: 0, active: false }])
      setNewSession('')
    }
  }

  const toggleSession = (id: number) => {
    setSessions(sessions.map(session => 
      session.id === id ? { ...session, active: !session.active } : session
    ))
  }

  return (
    <Card className="brutalist-border brutalist-hover bg-purple-100 dark:bg-purple-900">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">FOCUS SESSIONS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Input 
            type="text" 
            placeholder="New session" 
            value={newSession} 
            onChange={(e) => setNewSession(e.target.value)}
            className="mr-2 bg-white dark:bg-gray-800 text-black dark:text-white brutalist-border"
          />
          <Button onClick={addSession} className="brutalist-border brutalist-hover"><Plus className="h-4 w-4" /></Button>
        </div>
        <ul className="space-y-2">
          {sessions.map(session => (
            <li key={session.id} className="flex items-center justify-between animate-fadeIn">
              <span>{session.name}</span>
              <div className="flex items-center">
                <span className="mr-2">{Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}</span>
                <Button
                  variant={session.active ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSession(session.id)}
                  className="brutalist-border brutalist-hover"
                >
                  {session.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

