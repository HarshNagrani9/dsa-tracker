import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuestionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Questions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Track Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Manage all your DSA questions here. Add new questions, link them to topics, set difficulty, platform, and add notes.</p>
          {/* Placeholder for question list, filters, and actions */}
          <div className="mt-4 p-8 bg-muted/50 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Question tracking UI will be here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
