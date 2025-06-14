
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ListChecks, User, FolderX, ChevronRight, Loader2 } from "lucide-react";
import { getTopicsAction } from '@/lib/actions/topicActions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddTopicDialog } from '@/components/topics/AddTopicDialog';
import type { TopicDocument } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { SignInForm } from '@/components/auth/SignInForm';

export default function TopicsPage() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [topics, setTopics] = React.useState<TopicDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); 

  React.useEffect(() => {
    async function fetchUserTopics(currentUserId: string) {
      console.log("[TopicsPage] useEffect: Auth loaded, user found. Fetching topics for userId:", currentUserId);
      setIsLoading(true);
      setTopics([]); 
      try {
        const userTopics = await getTopicsAction(currentUserId);
        console.log("[TopicsPage] useEffect: getTopicsAction returned:", userTopics);
        setTopics(userTopics);
      } catch (error) {
        console.error("[TopicsPage] useEffect: Error fetching topics:", error);
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      console.log("[TopicsPage] useEffect: Auth is loading. Setting isLoading to true.");
      setIsLoading(true);
      setTopics([]);
      return;
    }

    if (user?.uid) {
      fetchUserTopics(user.uid);
    } else {
      console.log("[TopicsPage] useEffect: Auth loaded, but no user. Clearing topics and setting isLoading to false.");
      setTopics([]);
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
            <ScrollArea className="h-[calc(100vh-22rem)]">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}
              </div>
            </ScrollArea>
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
        <ListChecks className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Topics</h1>
        <p className="text-muted-foreground">Please sign in to manage and view your topics.</p>
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
        <h1 className="text-3xl font-bold tracking-tight font-headline">Topics</h1>
        <AddTopicDialog /> 
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Topics</CardTitle>
          <CardDescription>
            Categorize your DSA questions by topics. Click on a topic to view its questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? ( 
             <ScrollArea className="h-[calc(100vh-22rem)]">
              <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-md" />)}
                </div>
            </ScrollArea>
          ) : topics.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-22rem)]"> 
              <ul className="space-y-3">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <Link 
                      href={`/topics/${topic.id}`}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-md hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <ListChecks className="h-5 w-5 text-primary group-hover:text-accent" />
                        <span className="font-medium group-hover:text-accent">{topic.name}</span>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent" />
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : ( 
            <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center h-60">
              <FolderX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Topics Yet</h3>
              <p className="text-sm text-muted-foreground">Add your first topic to start organizing your questions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
