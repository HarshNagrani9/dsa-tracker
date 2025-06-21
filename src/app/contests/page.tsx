
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Trophy, User, ListX, Loader2 } from "lucide-react";
import { getContestsAction } from '@/lib/actions/contestActions';
import type { ContestDocumentClient } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { AddContestDialog } from '@/components/contests/AddContestDialog';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { SignInForm } from '@/components/auth/SignInForm';

export default function ContestsPage() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [contests, setContests] = React.useState<ContestDocumentClient[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); 

  React.useEffect(() => {
    async function fetchUserContests(currentUserId: string) {
      console.log("[ContestsPage] useEffect: Auth loaded, user found. Fetching contests for userId:", currentUserId);
      setIsLoading(true);
      setContests([]); 
      try {
        const userContests = await getContestsAction(currentUserId);
        console.log("[ContestsPage] useEffect: getContestsAction returned:", userContests);
        setContests(userContests);
      } catch (error) {
        console.error("[ContestsPage] useEffect: Error fetching contests:", error);
        setContests([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      console.log("[ContestsPage] useEffect: Auth is loading. Setting isLoading to true.");
      setIsLoading(true);
      setContests([]);
      return;
    }

    if (user?.uid) {
      fetchUserContests(user.uid);
    } else {
      console.log("[ContestsPage] useEffect: Auth loaded, but no user. Clearing contests and setting isLoading to false.");
      setContests([]);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading) {
     return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) { 
    if (isMobile === undefined) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    if (isMobile) {
      return (
        <div className="flex flex-col items-center justify-center pt-8 sm:pt-12">
          <SignInForm />
        </div>
      );
    } else {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <Trophy className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your Contests</h1>
        <p className="text-muted-foreground">Please sign in to manage and view your contests.</p>
        <Button asChild className="mt-6">
          <Link href="/signin">Sign In / Sign Up</Link>
        </Button>
      </div>
     );
    }
  }

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
           {isLoading ? ( 
             <Skeleton className="h-64 w-full" />
          ) : contests.length > 0 ? (
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
                  
                  const normalizedContestDate = new Date(contest.date);
                  normalizedContestDate.setHours(0,0,0,0);

                  let status: "Upcoming" | "Completed" | "Today" = "Upcoming";
                  if (normalizedContestDate < today) {
                    status = "Completed";
                  } else if (normalizedContestDate.getTime() === today.getTime()) {
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
              <ListX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Contests Tracked</h3>
              <p className="text-sm text-muted-foreground">You haven&apos;t added any contests yet. Add your first contest to start tracking.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
