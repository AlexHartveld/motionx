import { NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs";
import { prisma } from '@/lib/prisma';
import { 
  startOfDay, 
  endOfDay, 
  subDays, 
  format, 
  parseISO, 
  addDays,
  differenceInDays 
} from "date-fns";
import type { FocusSession, RoutineLog, Routine } from '@prisma/client';

type FocusCategory = 'Under 15min' | '15-30min' | '30-45min' | '45-60min' | 'Over 60min';

type Distribution = {
  [K in FocusCategory]: {
    count: number;
    totalEffectiveness: number;
  };
};

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("from") 
      ? parseISO(searchParams.get("from")!) 
      : subDays(new Date(), 30);
    const toDate = searchParams.get("to") 
      ? parseISO(searchParams.get("to")!) 
      : new Date();

    // Fetch all relevant data
    const [
      focusSessions,
      routines,
      routineLogs
    ] = await Promise.all([
      prisma.focusSession.findMany({
        where: {
          userId,
          startTime: {
            gte: startOfDay(fromDate),
            lte: endOfDay(toDate)
          }
        },
        include: {
          routine: true
        }
      }),
      prisma.routine.findMany({
        where: {
          userId,
          archivedAt: null
        },
        include: {
          logs: {
            where: {
              completedAt: {
                gte: startOfDay(fromDate),
                lte: endOfDay(toDate)
              }
            }
          },
          focusSessions: {
            where: {
              startTime: {
                gte: startOfDay(fromDate),
                lte: endOfDay(toDate)
              }
            }
          }
        }
      }),
      prisma.routineLog.findMany({
        where: {
          userId,
          completedAt: {
            gte: startOfDay(fromDate),
            lte: endOfDay(toDate)
          }
        },
        include: {
          routine: true
        }
      })
    ]);

    // Calculate total focus time
    const totalFocusTime = focusSessions.reduce((acc, session) => 
      acc + (session.duration || 0), 0);

    // Calculate productivity score based on completion rates and focus time
    const productivityScore = calculateProductivityScore(routineLogs, focusSessions);

    // Calculate routine performance
    const routinePerformance = calculateRoutinePerformance(routines);

    // Calculate productive hours
    const productiveHours = calculateProductiveHours(focusSessions);

    // Calculate streak data
    const streakData = calculateStreakData(routineLogs);

    // Calculate focus distribution
    const focusDistribution = calculateFocusDistribution(focusSessions);

    // Calculate weekly stats
    const weeklyStats = calculateWeeklyStats(routineLogs, focusSessions, fromDate, toDate);

    return NextResponse.json({
      totalFocusTime,
      totalSessions: focusSessions.length,
      completedRoutines: routineLogs.length,
      activeRoutines: routines.length,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      productivityScore,
      focusTimeChange: calculateFocusTimeChange(focusSessions, fromDate),
      weeklyStats,
      routinePerformance,
      productiveHours,
      streakData,
      focusDistribution,
      completionRates: calculateCompletionRates(routineLogs, routines, fromDate, toDate)
    });

  } catch (error) {
    console.error("Error fetching stats:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper functions for calculations
function calculateProductivityScore(
  logs: RoutineLog[],
  sessions: FocusSession[]
): number {
  const completionRate = logs.length / Math.max(1, sessions.length);
  const avgSessionLength = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / Math.max(1, sessions.length);
  const normalizedLength = Math.min(avgSessionLength / (25 * 60), 1); // Normalize against 25-minute sessions
  
  return (completionRate * 0.6 + normalizedLength * 0.4);
}

function calculateRoutinePerformance(routines: (Routine & {
  logs: RoutineLog[];
  focusSessions: FocusSession[];
})[]) {
  return routines.map(routine => {
    const completionRate = routine.logs.length / Math.max(1, routine.focusSessions.length);
    const totalFocusTime = routine.focusSessions.reduce((acc, session) => acc + (session.duration || 0), 0);
    const averageSessionLength = totalFocusTime / Math.max(1, routine.focusSessions.length);
    
    return {
      routineId: routine.id,
      routineName: routine.name,
      completionRate,
      totalFocusTime,
      averageSessionLength,
      lastCompleted: routine.logs[0]?.completedAt || null
    };
  });
}

function calculateProductiveHours(sessions: FocusSession[]) {
  const hourlyData = new Array(24).fill(null).map((_, hour) => ({
    hour,
    sessions: 0,
    totalFocusTime: 0,
    completedSessions: 0
  }));

  sessions.forEach(session => {
    const hour = new Date(session.startTime).getHours();
    hourlyData[hour].sessions++;
    hourlyData[hour].totalFocusTime += session.duration || 0;
    if (session.endTime) hourlyData[hour].completedSessions++;
  });

  return hourlyData.map(data => ({
    hour: data.hour,
    sessions: data.sessions,
    averageFocusTime: data.totalFocusTime / Math.max(1, data.sessions),
    completionRate: data.completedSessions / Math.max(1, data.sessions)
  }));
}

function calculateStreakData(logs: RoutineLog[]) {
  // Sort logs by date
  const sortedLogs = logs.sort((a, b) => 
    new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  const streakHistory = [];
  let lastDate = new Date();

  // Calculate streaks
  for (let i = 0; i < sortedLogs.length; i++) {
    const logDate = new Date(sortedLogs[i].completedAt);
    const dayDiff = Math.floor(
      (lastDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff <= 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }

    streakHistory.push({
      date: format(logDate, 'yyyy-MM-dd'),
      completed: sortedLogs.filter(l => 
        format(new Date(l.completedAt), 'yyyy-MM-dd') === format(logDate, 'yyyy-MM-dd')
      ).length,
      streak: currentStreak
    });

    lastDate = logDate;
  }

  return {
    currentStreak,
    longestStreak,
    totalDaysActive: new Set(logs.map(l => format(new Date(l.completedAt), 'yyyy-MM-dd'))).size,
    averageCompletionsPerDay: logs.length / Math.max(1, streakHistory.length),
    streakHistory
  };
}

function calculateFocusDistribution(sessions: FocusSession[]) {
  const distributions: Distribution = {
    'Under 15min': { count: 0, totalEffectiveness: 0 },
    '15-30min': { count: 0, totalEffectiveness: 0 },
    '30-45min': { count: 0, totalEffectiveness: 0 },
    '45-60min': { count: 0, totalEffectiveness: 0 },
    'Over 60min': { count: 0, totalEffectiveness: 0 }
  };

  sessions.forEach((session: FocusSession) => {
    const duration = session.duration / 60; // Convert to minutes
    const effectiveness = session.endTime ? 1 : 0.5;
    
    let category: FocusCategory;
    if (duration < 15) category = 'Under 15min';
    else if (duration < 30) category = '15-30min';
    else if (duration < 45) category = '30-45min';
    else if (duration < 60) category = '45-60min';
    else category = 'Over 60min';

    distributions[category].count++;
    distributions[category].totalEffectiveness += effectiveness;
  });

  return Object.entries(distributions).map(([duration, data]) => ({
    duration,
    count: data.count,
    effectiveness: data.count > 0 ? data.totalEffectiveness / data.count : 0
  }));
}

function calculateWeeklyStats(
  logs: RoutineLog[],
  sessions: FocusSession[],
  fromDate: Date,
  toDate: Date
) {
  const stats = [];
  let currentDate = fromDate;

  while (currentDate <= toDate) {
    const dayStr = format(currentDate, 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => 
      format(new Date(l.completedAt), 'yyyy-MM-dd') === dayStr
    );
    const daySessions = sessions.filter(s => 
      format(new Date(s.startTime), 'yyyy-MM-dd') === dayStr
    );

    stats.push({
      date: dayStr,
      focusTime: daySessions.reduce((acc, s) => acc + (s.duration || 0), 0),
      completedRoutines: dayLogs.length,
      productivity: calculateProductivityScore(dayLogs, daySessions)
    });

    currentDate = addDays(currentDate, 1);
  }

  return stats;
}

function calculateFocusTimeChange(sessions: FocusSession[], fromDate: Date): number {
  const midPoint = addDays(fromDate, Math.floor(differenceInDays(new Date(), fromDate) / 2));
  
  const firstHalf = sessions.filter(s => new Date(s.startTime) < midPoint);
  const secondHalf = sessions.filter(s => new Date(s.startTime) >= midPoint);

  const firstHalfTotal = firstHalf.reduce((acc, s) => acc + (s.duration || 0), 0);
  const secondHalfTotal = secondHalf.reduce((acc, s) => acc + (s.duration || 0), 0);

  return firstHalfTotal === 0 ? 1 : (secondHalfTotal - firstHalfTotal) / firstHalfTotal;
}

function calculateCompletionRates(
  logs: RoutineLog[],
  routines: Routine[],
  fromDate: Date,
  toDate: Date
) {
  const rates = [];
  let currentDate = fromDate;

  while (currentDate <= toDate) {
    const dayStr = format(currentDate, 'yyyy-MM-dd');
    const dayLogs = logs.filter(l => 
      format(new Date(l.completedAt), 'yyyy-MM-dd') === dayStr
    );

    const activeRoutines = routines.filter(r => 
      new Date(r.createdAt) <= currentDate && 
      (!r.archivedAt || new Date(r.archivedAt) > currentDate)
    );

    rates.push({
      date: dayStr,
      rate: (dayLogs.length / Math.max(1, activeRoutines.length)) * 100,
      totalTasks: activeRoutines.length
    });

    currentDate = addDays(currentDate, 1);
  }

  return rates;
} 