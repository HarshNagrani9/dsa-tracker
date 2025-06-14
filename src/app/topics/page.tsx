
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, FileQuestion, User, FolderX } from "lucide-react";
import { getTopicsAction } from '@/lib/actions/topicActions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddTopicDialog } from '@/components/topics/AddTopicDialog';
import { Badge } from '@/components/ui/badge';
import type { TopicDocument } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

export default function TopicsPage() {
  const { user, loading: authLoading } = useAuth();
  const [topics, setTopics] = React.useState<TopicDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); // For data fetching

  React.useEffect(() => {
    async function fetchUserTopics(currentUserId: string) {
      setIsLoading(true);
      setTopics([]); // Clear previous data
      try {
        const userTopics = await getTopicsAction(currentUserId);
        setTopics(userTopics);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setTopics([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      setIsLoading(true);
      setTopics([]);
      return;
    }

    if (user?.uid) {
      fetchUserTopics(user.uid);
    } else {
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
  
  if (!user) { // Auth loaded, no user
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <User className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Topics</h1>
        <p className="text-muted-foreground">Please sign in to manage and view your topics.</p>
      </div>
    );
  }

  // User is logged in
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Topics</h1>
        <AddTopicDialog /> {/* AddTopicDialog visibility is handled internally based on user */}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Topics</CardTitle>
          <CardDescription>
            Categorize your DSA questions by topics. Click on a topic to view its questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? ( // Data loading for logged-in user
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
                      <div className="flex items-center gap-2">
                         <Badge variant="secondary" className="font-normal">
                          {topic.questionCount || 0} Question{topic.questionCount === 1 || topic.questionCount === 0 ? '' : 's'}
                         </Badge>
                        <FileQuestion className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          ) : ( // User logged in, data loaded, but no topics found
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
