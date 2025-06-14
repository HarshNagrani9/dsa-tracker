
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart as BarChartIcon, Activity, CalendarClock, Star } from "lucide-react";
import { collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { QuestionDocument, Difficulty, Platform } from "@/lib/types";
import { DIFFICULTIES, PLATFORMS } from "@/lib/constants";
import { DifficultyChart } from "@/components/dashboard/DifficultyChart";
import { PlatformChart } from "@/components/dashboard/PlatformChart";
import { getUpcomingContestsCountAction } from "@/lib/actions/contestActions";
import { getStreakDataAction } from "@/lib/actions/streakActions";
import { format, parseISO } from 'date-fns';


async function getTotalQuestionsSolved(): Promise<number> {
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(questionsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching total questions solved:", error);
    return 0;
  }
}

async function getQuestionAggregates(): Promise<{
  difficultyData: { name: string; count: number; fill: string }[];
  platformData: { name: string; count: number; fill: string }[];
}> {
  let questions: Partial<QuestionDocument>[] = [];
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(questionsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    questions = querySnapshot.docs.map(doc => doc.data() as QuestionDocument);
  } catch (error) {
    console.error("Error fetching questions for aggregation:", error);
  }

  const difficultyCounts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  const platformCounts: Record<Platform, number> = { 
    LeetCode: 0, CSES: 0, CodeChef: 0, Codeforces: 0, Other: 0 
  };

  questions.forEach(q => {
    if (q.difficulty && difficultyCounts[q.difficulty] !== undefined) {
      difficultyCounts[q.difficulty]++;
    }
    if (q.platform && platformCounts[q.platform] !== undefined) {
      platformCounts[q.platform]++;
    } else if (q.platform) { 
      platformCounts.Other = (platformCounts.Other || 0) + 1;
    }
  });

  const finalDifficultyData = DIFFICULTIES.map((diff, index) => ({
    name: diff,
    count: difficultyCounts[diff],
    fill: `hsl(var(--chart-${index + 1}))`,
  }));
  
  const finalPlatformData = PLATFORMS.map((plat, index) => ({
    name: plat,
    count: platformCounts[plat] || 0, 
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  return { difficultyData: finalDifficultyData, platformData: finalPlatformData };
}


export default async function DashboardPage() {
  const totalSolved = await getTotalQuestionsSolved();
  const upcomingContests = await getUpcomingContestsCountAction();
  const streakData = await getStreakDataAction();
  const { difficultyData, platformData } = await getQuestionAggregates();

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
            <div className="text-2xl font-bold">{totalSolved}</div>
            <p className="text-xs text-muted-foreground">Across all topics and platforms.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData.currentStreak} Day{streakData.currentStreak === 1 ? '' : 's'}</div>
            <p className="text-xs text-muted-foreground">
                {streakData.currentStreak > 0 ? "Keep the fire burning!" : "Start your streak today!"}
            </p>
            {streakData.currentStreak > 0 && streakData.lastActivityDate && (
                <p className="text-xs text-muted-foreground mt-1">Last active: {format(parseISO(streakData.lastActivityDate), 'MMM d')}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Streak</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakData.maxStreak} Day{streakData.maxStreak === 1 ? '' : 's'}</div>
            <p className="text-xs text-muted-foreground">Your longest period of consistency.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Contests</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingContests}</div>
             <p className="text-xs text-muted-foreground">{upcomingContests > 0 ? "Check the contests page." : "No upcoming contests tracked."}</p>
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
            <DifficultyChart data={difficultyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questions by Platform</CardTitle>
            <CardDescription>Distribution of solved questions across different platforms.</CardDescription>
          </CardHeader>
          <CardContent>
             <PlatformChart data={platformData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
