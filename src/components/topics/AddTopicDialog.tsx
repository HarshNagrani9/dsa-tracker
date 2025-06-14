
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
import { AddTopicForm } from "@/components/topics/AddTopicForm";

export function AddTopicDialog() {
  const [isAddTopicDialogOpen, setIsAddTopicDialogOpen] = React.useState(false);
  return (
    <Dialog open={isAddTopicDialogOpen} onOpenChange={setIsAddTopicDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
          <DialogDescription>
            Enter the name for the new DSA topic.
          </DialogDescription>
        </DialogHeader>
        <AddTopicForm 
          onFormSubmitSuccess={() => setIsAddTopicDialogOpen(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
