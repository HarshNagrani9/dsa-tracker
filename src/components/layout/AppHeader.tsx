
"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { PlusCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddQuestionForm } from "@/components/questions/AddQuestionForm";
import { useAuth } from "@/providers/AuthProvider";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppHeader() {
  const [isAddQuestionDialogOpen, setIsAddQuestionDialogOpen] = React.useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Placeholder for breadcrumbs or page title */}
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <Dialog open={isAddQuestionDialogOpen} onOpenChange={setIsAddQuestionDialogOpen}>
            {/* Desktop Trigger */}
            <DialogTrigger asChild>
              <Button size="sm" className="hidden sm:flex">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
              </Button>
            </DialogTrigger>
            {/* Mobile Trigger */}
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="sm:hidden">
                <Plus className="h-5 w-5" />
                <span className="sr-only">Add Question</span>
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Add New Question</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new DSA question you want to track.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] sm:max-h-[65vh] w-full">
                <div className="pr-4 py-1"> {/* Add padding for scrollbar and a little vertical padding */}
                  <AddQuestionForm 
                    onFormSubmitSuccess={() => setIsAddQuestionDialogOpen(false)} 
                  />
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
