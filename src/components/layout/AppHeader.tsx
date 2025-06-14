"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Placeholder for breadcrumbs or page title */}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" className="hidden sm:flex">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
