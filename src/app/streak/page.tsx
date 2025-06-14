
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, CalendarDays } from "lucide-react";
import Image from 'next/image';

export default function StreakPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Daily Streak</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="text-primary h-6 w-6" />
            Maintain Your Consistency
          </CardTitle>
          <CardDescription>
            Track your daily activity and build a consistent DSA practice habit. This feature is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[300px]">
            <Image 
              src="https://placehold.co/300x200.png" // Placeholder image for streak visual
              alt="Streak Calendar Placeholder"
              width={300}
              height={200}
              className="rounded-md mb-6 shadow-md"
              data-ai-hint="calendar heatmap"
            />
            <h3 className="text-xl font-semibold text-foreground mb-2">Streak Tracker Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              We're working on a visual streak tracker (like a calendar heatmap) to help you visualize your progress and stay motivated. 
              This will require logging your daily solved questions or activities.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-5 w-5" />
              <span>Stay tuned for updates!</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
