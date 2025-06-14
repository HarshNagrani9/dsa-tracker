
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, PieChartIcon } from "lucide-react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { QuestionDocument, Difficulty, Platform } from "@/lib/types";
import { DIFFICULTIES, PLATFORMS } from "@/lib/constants";

async function getTotalQuestionsSolved(): Promise<number> {
  try {
    const questionsCollection = collection(db, "questions");
    const querySnapshot = await getDocs(questionsCollection);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching total questions solved:", error);
    return 0;
  }
}

async function getUpcomingContestsCount(): Promise<number> {
  // TODO: Implement actual fetching from a 'contests' collection
  // This would involve querying contests where date is in the future.
  // For now, returning a placeholder.
  // Example:
  // try {
  //   const contestsCollection = collection(db, "contests");
  //   const today = new Date();
  //   const q = query(contestsCollection, where("date", ">=", Timestamp.fromDate(today)));
  //   const querySnapshot = await getDocs(q);
  //   return querySnapshot.size;
  // } catch (error) {
  //   console.error("Error fetching upcoming contests:", error);
  //   return 0;
  // }
  return 0; // Placeholder
}

async function getCurrentStreak(): Promise<number> {
  // TODO: Implement actual streak calculation.
  // This would likely involve checking a log of daily solved questions or activities.
  // For now, returning a placeholder.
  return 0; // Placeholder
}

async function getQuestionAggregates(): Promise<{
  difficultyData: { name: string; count: number; fill: string }[];
  platformData: { name: string; count: number; fill: string }[];
}> {
  let questions: Partial<QuestionDocument>[] = [];
  try {
    const questionsCollection = collection(db, "questions");
    const querySnapshot = await getDocs(questionsCollection);
    questions = querySnapshot.docs.map(doc => doc.data() as QuestionDocument);
  } catch (error) {
    console.error("Error fetching questions for aggregation:", error);
    // Return default empty state if fetch fails
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
      platformCounts.Other++; // Catch-all for platforms not in the predefined list
    }
  });

  const finalDifficultyData = DIFFICULTIES.map((diff, index) => ({
    name: diff,
    count: difficultyCounts[diff],
    fill: `hsl(var(--chart-${index + 1}))`, // Cycle through chart-1, chart-2, chart-3
  }));
  
  const finalPlatformData = PLATFORMS.map((plat, index) => ({
    name: plat,
    count: platformCounts[plat],
    fill: `hsl(var(--chart-${(index % 5) + 1}))`, // Cycle through chart-1 to chart-5
  }));

  return { difficultyData: finalDifficultyData, platformData: finalPlatformData };
}


export default async function DashboardPage() {
  const totalSolved = await getTotalQuestionsSolved();
  const upcomingContests = await getUpcomingContestsCount();
  const currentStreak = await getCurrentStreak();
  const { difficultyData, platformData } = await getQuestionAggregates();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Questions Solved</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolved}</div>
            {/* <p className="text-xs text-muted-foreground">+5 from last week</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} Days</div>
            <p className="text-xs text-muted-foreground">{currentStreak > 0 ? "Keep it up!" : "Start today!"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Contests</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingContests}</div>
            {/* <p className="text-xs text-muted-foreground">Next one in 2 days</p> */}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Questions by Difficulty</CardTitle>
            <CardDescription>Distribution of solved questions based on difficulty.</CardDescription>
          </CardHeader>
          <CardContent>
            {difficultyData.reduce((sum, item) => sum + item.count, 0) > 0 ? (
              <>
                {/* Placeholder for Chart component - Actual chart implementation needed */}
                <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Difficulty Chart Placeholder</p>
                </div>
                <div className="mt-4 flex justify-around text-sm">
                  {difficultyData.map(item => item.count > 0 && (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }}></span>
                      {item.name}: {item.count}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">No difficulty data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questions by Platform</CardTitle>
            <CardDescription>Distribution of solved questions across different platforms.</CardDescription>
          </CardHeader>
          <CardContent>
             {platformData.reduce((sum, item) => sum + item.count, 0) > 0 ? (
              <>
                {/* Placeholder for Chart component - Actual chart implementation needed */}
                <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Platform Chart Placeholder</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {platformData.map(item => item.count > 0 && (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }}></span>
                      {item.name}: {item.count}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">No platform data available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

