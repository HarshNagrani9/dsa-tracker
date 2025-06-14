
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, Star, CalendarDays } from "lucide-react";
import Image from 'next/image';
import { getStreakDataAction } from '@/lib/actions/streakActions';
import { format, parseISO } from 'date-fns';

export default async function StreakPage() {
  const streakData = await getStreakDataAction();

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary flex items-center justify-center">
          <Flame className="inline-block h-10 w-10 mr-2 " />
          Your Streaks
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Keep the fire burning by solving DSA problems daily!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
                Solve a problem to set your first record!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {streakData.currentStreak === 0 && (
        <Card className="mt-0"> {/* Removed mt-4 to align better if it's the only card below */}
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
