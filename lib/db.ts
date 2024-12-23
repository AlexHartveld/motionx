import { prisma } from './prisma'
import { Habit, HabitLog, Stats } from './types'

export async function createHabit(userId: string, habit: Partial<Habit>): Promise<Habit> {
  return prisma.habit.create({
    data: {
      userId,
      name: habit.name!,
      description: habit.description,
      frequency: habit.frequency!,
      targetCount: habit.targetCount!,
    },
  })
}

export async function getHabits(userId: string): Promise<Habit[]> {
  return prisma.habit.findMany({
    where: { 
      userId,
      archivedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      logs: {
        orderBy: { completedAt: 'desc' },
        take: 1,
      },
    },
  })
}

export async function logHabit(habitId: string, userId: string, note?: string): Promise<HabitLog> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    include: { 
      logs: {
        orderBy: { completedAt: 'desc' },
        take: 2,
      }
    },
  })

  if (!habit) throw new Error('Habit not found')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedToday = habit.logs.some((log: HabitLog) => {
    const logDate = new Date(log.completedAt)
    logDate.setHours(0, 0, 0, 0)
    return logDate.getTime() === today.getTime()
  })

  if (completedToday) {
    return prisma.habitLog.create({
      data: {
        habitId,
        userId,
        note,
      },
    })
  }

  const lastLog = habit.logs[0]
  let currentStreak = habit.currentStreak
  let longestStreak = habit.longestStreak

  if (!lastLog || isStreakBroken(lastLog.completedAt, today, habit.frequency)) {
    currentStreak = 1
  } else {
    currentStreak++
  }

  longestStreak = Math.max(currentStreak, longestStreak)

  await prisma.habit.update({
    where: { id: habitId },
    data: { currentStreak, longestStreak },
  })

  return prisma.habitLog.create({
    data: {
      habitId,
      userId,
      note,
    },
  })
}

export async function getStats(userId: string): Promise<Stats> {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: {
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      },
    },
  }) as Habit[]

  const totalHabits = habits.length
  const completedToday = habits.filter((h: Habit) => h.logs.length > 0).length
  const currentStreak = Math.max(...habits.map((h: Habit) => h.currentStreak), 0)
  const longestStreak = Math.max(...habits.map((h: Habit) => h.longestStreak), 0)
  const completionRate = totalHabits ? (completedToday / totalHabits) * 100 : 0

  return {
    totalHabits,
    completedToday,
    currentStreak,
    longestStreak,
    completionRate,
  }
}

function isStreakBroken(lastDate: Date, currentDate: Date, frequency: string): boolean {
  const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
  
  switch (frequency) {
    case 'daily':
      return daysDiff > 1
    case 'weekly':
      return daysDiff > 7
    case 'monthly':
      return daysDiff > 31
    default:
      return true
  }
}

export async function archiveHabit(habitId: string, userId: string): Promise<Habit> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  })

  if (!habit || habit.userId !== userId) {
    throw new Error('Habit not found or unauthorized')
  }

  return prisma.habit.update({
    where: { id: habitId },
    data: { 
      archivedAt: new Date(),
    },
  })
}