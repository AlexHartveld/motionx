'use client'

import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import RoutineTracker from '@/components/routine-tracker'
import FocusSessionsPanel from '@/components/focus-sessions-panel'
import GoalsSection from '@/components/goals-section'
import ProductivityStats from '@/components/productivity-stats'
import { useState } from 'react'
import { Routine } from '@/lib/types'

export default function DashboardPage() {
  const { isSignedIn } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])

  if (!isSignedIn) {
    redirect('/')
  }

  const handleRoutinesUpdate = (updatedRoutines: Routine[]) => {
    setRoutines(updatedRoutines)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <RoutineTracker onRoutinesUpdate={handleRoutinesUpdate} />
          </div>
          <div>
            <FocusSessionsPanel 
              routines={routines}
              onSessionComplete={() => {}}
            />
          </div>
          <div>
            <GoalsSection />
          </div>
          <div className="md:col-span-2">
            <ProductivityStats />
          </div>
        </div>
      </main>
    </div>
  )
}

