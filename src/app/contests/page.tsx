
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trophy, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddContestForm } from "@/components/contests/AddContestForm";
import { getContestsAction } from '@/lib/actions/contestActions';
import type { ContestDocumentClient } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default async function ContestsPage() {
  const contests = await getContestsAction();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Contests</h1>
        <AddContestDialog />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Track Coding Contests</CardTitle>
          <CardDescription>
            Keep a record of coding contests. Add new contests using the button above.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contests.map((contest) => {
                  const contestDate = new Date(contest.date);
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  contestDate.setHours(0,0,0,0);

                  let status: "Upcoming" | "Past" | "Today" = "Upcoming";
                  if (contestDate < today) {
                    status = "Past";
                  } else if (contestDate.getTime() === today.getTime()) {
                    status = "Today";
                  }

                  return (
                    <TableRow key={contest.id}>
                      <TableCell className="font-medium">{contest.title}</TableCell>
                      <TableCell>{contest.platform}</TableCell>
                      <TableCell>{format(contest.date, 'MMM d, yyyy')}</TableCell>
                      <TableCell>{contest.startTime} - {contest.endTime}</TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={status === "Upcoming" ? "secondary" : status === "Today" ? "default" : "outline"}
                          className={status === "Today" ? "bg-accent text-accent-foreground" : ""}
                        >
                          {status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
             <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center h-60">
              <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Contests Tracked</h3>
              <p className="text-sm text-muted-foreground">Add your first contest to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddContestDialog() {
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
