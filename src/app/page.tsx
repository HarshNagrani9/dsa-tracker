import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, LineChart, PieChartIcon } from "lucide-react"; // Using PieChartIcon as PieChart is not a component

// Placeholder data for charts - replace with actual data fetching and chart components later
const difficultyData = [
  { name: 'Easy', count: 15, fill: 'hsl(var(--chart-1))' },
  { name: 'Medium', count: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Hard', count: 10, fill: 'hsl(var(--chart-3))' },
];

const platformData = [
  { name: 'LeetCode', count: 30, fill: 'hsl(var(--chart-1))' },
  { name: 'CSES', count: 5, fill: 'hsl(var(--chart-2))' },
  { name: 'CodeChef', count: 8, fill: 'hsl(var(--chart-4))' },
  { name: 'Codeforces', count: 7, fill: 'hsl(var(--chart-5))' },
];

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">50</div>
            <p className="text-xs text-muted-foreground">+5 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 Days</div>
            <p className="text-xs text-muted-foreground">Keep it up!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Contests</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Next one in 2 days</p>
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
            {/* Placeholder for Chart component */}
            <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Difficulty Chart Placeholder</p>
            </div>
            <div className="mt-4 flex justify-around text-sm">
              {difficultyData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }}></span>
                  {item.name}: {item.count}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Questions by Platform</CardTitle>
            <CardDescription>Distribution of solved questions across different platforms.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for Chart component */}
            <div className="h-[300px] w-full bg-muted/50 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Platform Chart Placeholder</p>
            </div>
             <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {platformData.map(item => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }}></span>
                  {item.name}: {item.count}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
