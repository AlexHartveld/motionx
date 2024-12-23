'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function Header() {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="bg-white dark:bg-gray-900 text-black dark:text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold brutalist-border p-2 bg-blue-300 dark:bg-blue-600">
          MOMENTUM
        </Link>
        <nav className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={toggleDarkMode}
            className="brutalist-border brutalist-hover"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </nav>
      </div>
    </header>
  )
}

