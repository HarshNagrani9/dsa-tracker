import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StreakPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Daily Streak</h1>
      <Card>
        <CardHeader>
          <CardTitle>Maintain Your Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Track your daily activity and build a consistent DSA practice habit. Your streak will be visualized here.</p>
          {/* Placeholder for streak calendar/visualization */}
          <div className="mt-4 p-8 bg-muted/50 rounded-md flex items-center justify-center h-64">
            <p className="text-muted-foreground">Streak tracker UI (e.g., calendar heatmap) will be here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
