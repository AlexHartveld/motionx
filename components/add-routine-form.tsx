'use client'

import { useState } from 'react'

type AddRoutineFormProps = {
  onAdd: () => void
}

export default function AddRoutineForm({ onAdd }: AddRoutineFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [targetCount, setTargetCount] = useState(1)
  const [targetDuration, setTargetDuration] = useState(30)
  const [durationType, setDurationType] = useState<'minutes' | 'hours'>('minutes')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await fetch('/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          frequency,
          targetCount,
          targetTime: durationType === 'hours' ? targetDuration * 60 : targetDuration // Store in minutes
        })
      })
      setIsOpen(false)
      setName('')
      setDescription('')
      setFrequency('daily')
      setTargetCount(1)
      setTargetDuration(30)
      setDurationType('minutes')
      onAdd()
    } catch (error) {
      console.error('Error adding routine:', error)
    }
  }

  return (
    <div className="mb-6">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-4 border-4 border-black dark:border-white border-dashed rounded-lg text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors brutalist-hover"
        >
          + Add New Routine
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-lg brutalist-border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-black dark:text-white">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-black dark:text-white">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-black dark:text-white">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  className="w-full p-2 rounded border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-black dark:text-white">Target Count</label>
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-full p-2 rounded border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-black dark:text-white">Target Duration</label>
                <input
                  type="number"
                  min="1"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(Number(e.target.value))}
                  className="w-full p-2 rounded border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-black dark:text-white">Duration Type</label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as 'minutes' | 'hours')}
                  className="w-full p-2 rounded border-2 border-black dark:border-white bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border-2 border-black dark:border-white text-black dark:text-white rounded brutalist-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded brutalist-hover"
              >
                Add New Routine
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
} 