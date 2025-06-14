import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Contests</h1>
      <Card>
        <CardHeader>
          <CardTitle>Track Coding Contests</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Keep a record of coding contests you participate in or plan to. Add details like date, time, platform, and title.</p>
          {/* Placeholder for contest list and actions */}
          <div className="mt-4 p-8 bg-muted/50 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Contest tracking UI will be here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
