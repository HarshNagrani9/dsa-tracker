
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as BarChartIcon, Activity, CalendarClock, Star, User, LineChart } from "lucide-react";
import { getQuestionAggregatesAction } from "@/lib/actions/questionActions";
import { getUpcomingContestsCountAction } from "@/lib/actions/contestActions";
import { getStreakDataAction } from "@/lib/actions/streakActions";
import type { ChartDataItem, StreakData } from "@/lib/types";
import { DifficultyChart } from "@/components/dashboard/DifficultyChart";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { useAuth } from "@/providers/AuthProvider";
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  totalSolved: number;
  upcomingContests: number;
  streakData: StreakData;
  difficultyData: ChartDataItem[];
  platformData: ChartDataItem[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true); // For data fetching

  React.useEffect(() => {
    async function fetchUserDashboardData(currentUserId: string) {
      setIsLoading(true);
      setDashboardData(null); // Clear previous data
      try {
        const [aggregates, upcomingContests, streak] = await Promise.all([
          getQuestionAggregatesAction(currentUserId),
          getUpcomingContestsCountAction(currentUserId),
          getStreakDataAction(currentUserId),
        ]);
        setDashboardData({
          totalSolved: aggregates.totalSolved,
          difficultyData: aggregates.difficultyData,
          platformData: aggregates.platformData,
          upcomingContests,
          streakData: streak,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(null); 
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      setIsLoading(true);
      setDashboardData(null);
      return;
    }

    if (user?.uid) {
      fetchUserDashboardData(user.uid);
    } else {
      setDashboardData(null);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) { // Auth loaded, no user
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <User className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">Welcome to DSA Tracker</h1>
        <p className="text-xl text-muted-foreground mb-6">Please sign in to track your progress and view your dashboard.</p>
      </div>
    );
  }

  if (isLoading) { // User is logged in, but data is still loading
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }
  
  if (!dashboardData) { // User is logged in, data loaded, but something went wrong or no data
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <LineChart className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold">No Dashboard Data</h1>
        <p className="text-muted-foreground">Could not load dashboard data or no activity recorded yet.</p>
        <p className="text-muted-foreground mt-1">Try adding some questions or contests!</p>
      </div>
    );
  }

  // User is logged in and dashboard data is available
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions Solved</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalSolved}</div>
            <p className="text-xs text-muted-foreground">Across all topics and platforms.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.streakData.currentStreak} Day{dashboardData.streakData.currentStreak === 1 ? '' : 's'}</div>
            <p className="text-xs text-muted-foreground">
                {dashboardData.streakData.currentStreak > 0 ? "Keep the fire burning!" : "Start your streak today!"}
            </p>
            {dashboardData.streakData.currentStreak > 0 && dashboardData.streakData.lastActivityDate && (
                <p className="text-xs text-muted-foreground mt-1">Last active: {format(parseISO(dashboardData.streakData.lastActivityDate), 'MMM d')}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.streakData.maxStreak} Day{dashboardData.streakData.maxStreak === 1 ? '' : 's'}</div>
            <p className="text-xs text-muted-foreground">Your longest period of consistency.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Contests</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.upcomingContests}</div>
             <p className="text-xs text-muted-foreground">{dashboardData.upcomingContests > 0 ? "Check the contests page." : "No upcoming contests tracked."}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Questions by Difficulty</CardTitle>
            <CardDescription>Distribution of solved questions based on difficulty.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <DifficultyChart data={dashboardData.difficultyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questions by Platform</CardTitle>
            <CardDescription>Distribution of solved questions across different platforms.</CardDescription>
          </CardHeader>
          <CardContent>
             <PlatformChart data={dashboardData.platformData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
