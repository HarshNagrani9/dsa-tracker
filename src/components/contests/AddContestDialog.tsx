
"use client";

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddContestForm } from "@/components/contests/AddContestForm";

export function AddContestDialog() {
  const [isAddContestDialogOpen, setIsAddContestDialogOpen] = React.useState(false);
  return (
    <Dialog open={isAddContestDialogOpen} onOpenChange={setIsAddContestDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Contest
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Contest</DialogTitle>
          <DialogDescription>
            Fill in the details for the new coding contest.
          </DialogDescription>
        </DialogHeader>
        <AddContestForm 
          onFormSubmitSuccess={() => setIsAddContestDialogOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
