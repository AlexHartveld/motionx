'use client'

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to ROUTINA</h1>
          <p className="text-xl mb-8">Your personal routine and productivity tracker</p>
          <p>Please sign in to access your dashboard</p>
        </div>
      </main>
    </div>
  )
}

