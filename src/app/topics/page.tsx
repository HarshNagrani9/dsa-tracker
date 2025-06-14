
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddTopicForm } from "@/components/topics/AddTopicForm";
import { getTopicsAction } from '@/lib/actions/topicActions';
import type { TopicDocument } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function TopicsPage() {
  const topics = await getTopicsAction();
  // Removed incorrect useState from Server Component

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Topics</h1>
        <AddTopicDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Topics</CardTitle>
          <CardDescription>
            Categorize your DSA questions by topics. Add new topics using the button above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topics.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <ul className="space-y-3">
                {topics.map((topic) => (
                  <li key={topic.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center gap-3">
                      <ListChecks className="h-5 w-5 text-primary" />
                      <span className="font-medium">{topic.name}</span>
                    </div>
                    {/* Placeholder for future actions like Edit/Delete */}
                    {/* <Button variant="ghost" size="sm">Edit</Button> */}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : (
            <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center h-60">
              <ListChecks className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Topics Yet</h3>
              <p className="text-sm text-muted-foreground">Add your first topic to start organizing questions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Client component for the dialog part
function AddTopicDialog() {
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

