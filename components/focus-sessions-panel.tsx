'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import FocusSessions from "./focus-sessions"
import { Routine } from "@/lib/types"

interface FocusSessionsPanelProps {
  routines: Routine[]
  onSessionComplete: () => void
}

export default function FocusSessionsPanel({ routines, onSessionComplete }: FocusSessionsPanelProps) {
  return (
    <Card className="brutalist-border brutalist-hover bg-purple-100 dark:bg-purple-900">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">FOCUS SESSIONS</CardTitle>
      </CardHeader>
      <CardContent>
        <FocusSessions routines={routines} onComplete={onSessionComplete} />
      </CardContent>
    </Card>
  )
} 