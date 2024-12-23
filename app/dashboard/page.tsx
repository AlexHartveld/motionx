import Header from '../components/header'
import HabitTracker from '../components/habit-tracker'
import FocusSessions from '../components/focus-sessions'
import GoalsSection from '../components/goals-section'
import ProductivityStats from '../components/productivity-stats'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center brutalist-border inline-block p-4 bg-yellow-300 dark:bg-yellow-600">MOMENTUM DASHBOARD</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <HabitTracker />
          <FocusSessions />
          <GoalsSection />
          <ProductivityStats />
        </div>
      </main>
    </div>
  )
}

