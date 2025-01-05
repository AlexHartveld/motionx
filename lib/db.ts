import { prisma } from './prisma'
import { Routine, RoutineLog, Stats } from './types'

export async function createRoutine(userId: string, routine: Partial<Routine>): Promise<Routine> {
  return prisma.routine.create({
    data: {
      userId,
      name: routine.name!,
      description: routine.description,
      frequency: routine.frequency!,
      targetCount: routine.targetCount!,
    },
  })
}

export async function getRoutines(userId: string): Promise<Routine[]> {
  return prisma.routine.findMany({
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

export async function logRoutine(routineId: string, userId: string, note?: string): Promise<RoutineLog> {
  const routine = await prisma.routine.findUnique({
    where: { id: routineId },
    include: { 
      logs: {
        orderBy: { completedAt: 'desc' },
        take: 2,
      }
    },
  })

  if (!routine) throw new Error('Routine not found')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const completedToday = routine.logs.some((log: RoutineLog) => {
    const logDate = new Date(log.completedAt)
    logDate.setHours(0, 0, 0, 0)
    return logDate.getTime() === today.getTime()
  })

  if (completedToday) {
    return prisma.routineLog.create({
      data: {
        routineId,
        userId,
        note,
      },
    })
  }

  const lastLog = routine.logs[0]
  let currentStreak = routine.currentStreak
  let longestStreak = routine.longestStreak

  if (!lastLog || isStreakBroken(lastLog.completedAt, today, routine.frequency)) {
    currentStreak = 1
  } else {
    currentStreak++
  }

  longestStreak = Math.max(currentStreak, longestStreak)

  await prisma.routine.update({
    where: { id: routineId },
    data: { currentStreak, longestStreak },
  })

  return prisma.routineLog.create({
    data: {
      routineId,
      userId,
      note,
    },
  })
}

export async function getStats(userId: string): Promise<Stats> {
  const routines = await prisma.routine.findMany({
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
  }) as Routine[]

  const totalRoutines = routines.length
  const completedToday = routines.filter((r: Routine) => r.logs.length > 0).length
  const currentStreak = Math.max(...routines.map((r: Routine) => r.currentStreak), 0)
  const longestStreak = Math.max(...routines.map((r: Routine) => r.longestStreak), 0)
  const completionRate = totalRoutines ? (completedToday / totalRoutines) * 100 : 0

  return {
    totalRoutines,
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

export async function archiveRoutine(routineId: string, userId: string): Promise<Routine> {
  const routine = await prisma.routine.findUnique({
    where: { id: routineId },
  })

  if (!routine || routine.userId !== userId) {
    throw new Error('Routine not found or unauthorized')
  }

  return prisma.routine.update({
    where: { id: routineId },
    data: { 
      archivedAt: new Date(),
    },
  })
}