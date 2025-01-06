'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays } from 'date-fns';
import type { UserStats } from '@/lib/types';
import { type DateRange } from "react-day-picker";

type RoutinePerformanceProps = {
  routine: {
    routineId: string;
    routineName: string;
    completionRate: number;
    totalFocusTime: number;
    averageSessionLength: number;
    lastCompleted: string;
  };
};

type FocusDistributionProps = {
  distribution: Array<{
    duration: string;
    count: number;
    effectiveness: number;
  }>;
};

type StreakDataProps = {
  streakData: {
    currentStreak: number;
    longestStreak: number;
    totalDaysActive: number;
    averageCompletionsPerDay: number;
    streakHistory: Array<{
      date: string;
      completed: number;
      streak: number;
    }>;
  };
};

// Add new components for detailed stats
function RoutinePerformanceCard({ routine }: RoutinePerformanceProps) {
  return (
    <Card className="p-4">
      <h4 className="font-medium">{routine.routineName}</h4>
      <div className="mt-2 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Completion Rate</span>
          <span>{Math.round(routine.completionRate * 100)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Avg. Session</span>
          <span>{Math.round(routine.averageSessionLength / 60)} min</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Focus Time</span>
          <span>{Math.round(routine.totalFocusTime / 3600)}h</span>
        </div>
      </div>
    </Card>
  );
}

function FocusDistributionCard({ distribution }: FocusDistributionProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Session Length Distribution</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={distribution}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="duration" className="text-sm text-muted-foreground" />
            <YAxis className="text-sm text-muted-foreground" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium">{payload[0].payload.duration}</p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].payload.count} sessions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(payload[0].payload.effectiveness * 100)}% effective
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))">
              {distribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--primary) / ${entry.effectiveness * 100}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function StreakCard({ streakData }: StreakDataProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Streak Analysis</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Current Streak</p>
          <p className="text-2xl font-bold">{streakData.currentStreak} days</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Longest Streak</p>
          <p className="text-2xl font-bold">{streakData.longestStreak} days</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Days Active</p>
          <p className="text-2xl font-bold">{streakData.totalDaysActive}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Avg. Daily Completions</p>
          <p className="text-2xl font-bold">
            {streakData.averageCompletionsPerDay.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={streakData.streakHistory}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-sm text-muted-foreground"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis className="text-sm text-muted-foreground" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium">
                        {format(new Date(payload[0].payload.date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].payload.completed} completions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payload[0].payload.streak} day streak
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="streak"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function ProfileStats() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchStats = useCallback(async () => {
    try {
      const from = dateRange?.from || subDays(new Date(), 30);
      const to = dateRange?.to || new Date();
      
      const response = await fetch(
        `/api/user/stats?from=${from.toISOString()}&to=${to.toISOString()}`
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Focus Time
          </h3>
          <p className="text-2xl font-bold mt-2">
            {Math.round((stats?.totalFocusTime || 0) / 60)}h
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            +{Math.round((stats?.focusTimeChange || 0) * 100)}% from last period
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Completed Goals
          </h3>
          <p className="text-2xl font-bold mt-2">{stats?.completedGoals || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.activeGoals || 0} active goals
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Productivity Score
          </h3>
          <p className="text-2xl font-bold mt-2">
            {Math.round((stats?.productivityScore || 0) * 100)}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on completion rate
          </p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Current Streak
          </h3>
          <p className="text-2xl font-bold mt-2">{stats?.currentStreak || 0} days</p>
          <p className="text-xs text-muted-foreground mt-1">
            Best: {stats?.longestStreak || 0} days
          </p>
        </Card>
      </div>

      <Tabs defaultValue="focus" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="focus">Focus Time</TabsTrigger>
          <TabsTrigger value="routines">Routines</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="focus" className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
              <h3 className="text-lg font-semibold">Focus Time Trends</h3>
              <div className="w-full lg:w-auto">
                <div className="bg-background rounded-lg border">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range: DateRange | undefined) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                    numberOfMonths={2}
                    disabled={{ after: new Date() }}
                    initialFocus
                    className="p-0"
                  />
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.weeklyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-sm text-muted-foreground"
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis
                    className="text-sm text-muted-foreground"
                    label={{
                      value: 'Minutes',
                      angle: -90,
                      position: 'insideLeft',
                      className: "text-muted-foreground"
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-medium">
                              {format(new Date(payload[0].payload.date), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round(payload[0].value as number)} minutes
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="focusTime"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Most Productive Hours</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.productiveHours || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="hour"
                    className="text-sm text-muted-foreground"
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis
                    className="text-sm text-muted-foreground"
                    label={{
                      value: 'Sessions',
                      angle: -90,
                      position: 'insideLeft',
                      className: "text-muted-foreground"
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-medium">
                              {payload[0].payload.hour}:00
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payload[0].value} sessions
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="sessions"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="routines" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats?.routinePerformance.map((routine) => (
              <RoutinePerformanceCard key={routine.routineId} routine={routine} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <FocusDistributionCard distribution={stats?.focusDistribution || []} />
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Productivity Patterns</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats?.weeklyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-sm text-muted-foreground"
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis
                    className="text-sm text-muted-foreground"
                    label={{
                      value: 'Productivity Score',
                      angle: -90,
                      position: 'insideLeft',
                      className: "text-muted-foreground"
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="text-sm font-medium">
                              {format(new Date(payload[0].payload.date), 'MMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Score: {Math.round(payload[0].payload.productivity * 100)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Completed: {payload[0].payload.completedRoutines}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="productivity"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <StreakCard 
            streakData={stats?.streakData || {
              currentStreak: 0,
              longestStreak: 0,
              totalDaysActive: 0,
              averageCompletionsPerDay: 0,
              streakHistory: []
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 