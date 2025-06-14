
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Flame, Star, CalendarDays, User, Activity, Loader2 } from "lucide-react";
import Image from 'next/image';
import { getStreakDataAction } from '@/lib/actions/streakActions';
import type { StreakData } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { SignInForm } from '@/components/auth/SignInForm';

export default function StreakPage() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [streakData, setStreakData] = React.useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true); // For data fetching

  React.useEffect(() => {
    async function fetchUserStreakData(currentUserId: string) {
      setIsLoading(true);
      setStreakData(null); // Clear previous data
      try {
        const data = await getStreakDataAction(currentUserId);
        setStreakData(data);
      } catch (error) {
        console.error("Error fetching streak data:", error);
        setStreakData({ currentStreak: 0, maxStreak: 0, lastActivityDate: '' });
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      setIsLoading(true);
      setStreakData(null);
      return;
    }

    if (user?.uid) {
      fetchUserStreakData(user.uid);
    } else {
      setStreakData(null);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-56 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-60 rounded-lg" />
      </div>
    );
  }

  if (!user) { 
    if (isMobile === undefined) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    if (isMobile) {
      return (
        <div className="flex flex-col items-center justify-center pt-8 sm:pt-12">
          <SignInForm />
        </div>
      );
    } else {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <Flame className="h-24 w-24 text-muted-foreground mb-6" /> 
        <h1 className="text-2xl font-bold mb-2">Your Streaks</h1>
        <p className="text-muted-foreground">Please sign in to view and track your streaks.</p>
        <Button asChild className="mt-6">
          <Link href="/signin">Sign In / Sign Up</Link>
        </Button>
      </div>
     );
    }
  }
  
  if (isLoading) { // User logged in, data loading
    return (
      <div className="flex flex-col gap-8">
        <div className="text-center">
          <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-56 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
        <Skeleton className="h-40 rounded-lg" />
        <Skeleton className="h-60 rounded-lg" />
      </div>
    );
  }

  if (!streakData) { // User logged in, data loaded, but something went wrong
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <Activity className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Could Not Load Streak Data</h1>
        <p className="text-muted-foreground">There was an issue fetching your streak information. Please try again later.</p>
      </div>
    );
  }

  // User logged in, streak data available
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-headline text-primary flex items-center justify-center">
          <Flame className="inline-block h-10 w-10 mr-2 " />
          Your Streaks
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Keep the fire burning by solving DSA problems daily!
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-2xl font-semibold flex items-center justify-center text-center gap-2">
              <Flame className="h-8 w-8 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <div className="text-7xl font-bold text-primary">
              {streakData.currentStreak}
            </div>
            <p className="text-xl text-muted-foreground mt-1">
              Day{streakData.currentStreak === 1 ? '' : 's'}
            </p>
            {streakData.currentStreak > 0 && streakData.lastActivityDate && (
              <p className="text-sm text-muted-foreground mt-3">
                Last activity: {format(parseISO(streakData.lastActivityDate), 'MMMM d, yyyy')}
              </p>
            )}
             {streakData.currentStreak === 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                Solve a problem today to start your streak!
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-card">
          <CardHeader className="pb-3 pt-6">
            <CardTitle className="text-2xl font-semibold flex items-center justify-center text-center gap-2">
              <Star className="h-8 w-8 text-yellow-500" />
              Max Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <div className="text-7xl font-bold text-accent">
              {streakData.maxStreak}
            </div>
            <p className="text-xl text-muted-foreground mt-1">
              Day{streakData.maxStreak === 1 ? '' : 's'}
            </p>
             {streakData.maxStreak === 0 && streakData.currentStreak === 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                No record yet. Keep solving!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {streakData.currentStreak === 0 && (
        <Card className="mt-0">
            <CardContent className="pt-6">
                 <div className="p-6 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center">
                    <Flame className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Active Streak</h3>
                    <p className="text-muted-foreground max-w-md">
                        Solve a DSA problem today to start your streak and build a consistent practice habit.
                        Every day counts!
                    </p>
                </div>
            </CardContent>
        </Card>
      )}

       <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-6 w-6" />
                Activity Heatmap (Future Feature)
            </CardTitle>
            <CardDescription>
                Visualize your daily activity and consistency over time. This feature is planned for a future update.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
                <Image
                src="https://placehold.co/300x150.png"
                alt="Streak Calendar Placeholder"
                width={300}
                height={150}
                className="rounded-md mb-6 shadow-md opacity-70"
                data-ai-hint="calendar heatmap"
                />
                <p className="text-muted-foreground">
                A visual calendar heatmap will show your daily solved questions or activities. Stay tuned!
                </p>
            </div>
        </CardContent>
       </Card>
    </div>
  );
}
