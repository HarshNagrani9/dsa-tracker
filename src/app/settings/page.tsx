import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Configure your application preferences here. (e.g., User profile, notification settings - to be implemented).</p>
          <div className="mt-4 p-8 bg-muted/50 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Settings UI will be here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
