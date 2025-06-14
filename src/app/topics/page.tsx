import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TopicsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Topics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where you will manage your DSA topics. Add, edit, and delete topics to organize your question tracking.</p>
          {/* Placeholder for topic list and actions */}
          <div className="mt-4 p-8 bg-muted/50 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Topic management UI will be here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
