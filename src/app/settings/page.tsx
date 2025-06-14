
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Palette, UserCircle, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Configure your application preferences. More settings will be available soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2"><Palette /> Theme</h3>
              <p className="text-sm text-muted-foreground">Choose between light, dark, or system default theme.</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="p-6 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
            <UserCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <h4 className="font-semibold text-foreground">User Profile Settings</h4>
            <p className="text-sm text-muted-foreground mt-1">Coming soon: Manage your profile information.</p>
          </div>
          
          <div className="p-6 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
            <Bell className="h-12 w-12 text-muted-foreground mb-3" />
            <h4 className="font-semibold text-foreground">Notification Settings</h4>
            <p className="text-sm text-muted-foreground mt-1">Coming soon: Configure contest reminders and other notifications.</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
