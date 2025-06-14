
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { QuestionDocument } from "@/lib/types";
import { format } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';
import { getAllQuestionsAction } from '@/lib/actions/questionActions';
import { Skeleton } from '@/components/ui/skeleton';
import { User, ListX } from 'lucide-react';

export default function QuestionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = React.useState<QuestionDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true); // For data fetching, distinct from authLoading

  React.useEffect(() => {
    async function fetchUserQuestions(currentUserId: string) {
      setIsLoading(true);
      setQuestions([]); // Clear previous user's data before fetching new
      try {
        const userQuestions = await getAllQuestionsAction(currentUserId);
        setQuestions(userQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestions([]); // Ensure questions are empty on error
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      setIsLoading(true); // Show main skeleton if auth is still loading
      setQuestions([]); // Clear data while auth state is resolving
      return;
    }

    if (user?.uid) {
      fetchUserQuestions(user.uid);
    } else {
      // No user logged in, and auth is not loading
      setQuestions([]);
      setIsLoading(false); // Not loading data because no user
    }
  }, [user, authLoading]);

  if (authLoading) {
     return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
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

  if (!user) { // Auth has loaded, but no user
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <User className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your Questions</h1>
        <p className="text-muted-foreground">Please sign in to manage and view your questions.</p>
      </div>
    );
  }

  // User is logged in, handle data loading and display
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Questions</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Tracked Questions</CardTitle>
          <CardDescription>
            View and manage all your DSA questions. Add new questions using the button in the header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? ( // Data is loading for the logged-in user
             <Skeleton className="h-64 w-full" />
          ) : questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="text-right">Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.title}</TableCell>
                    <TableCell>{question.topicName}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          question.difficulty === "Easy" ? "secondary" : 
                          question.difficulty === "Medium" ? "default" : 
                          question.difficulty === "Hard" ? "destructive" : "outline"
                        }
                        className={
                          question.difficulty === "Medium" ? "bg-accent text-accent-foreground" : ""
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.platform}</TableCell>
                    <TableCell>{format(question.createdAt, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      {question.link ? (
                        <a 
                          href={question.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : ( // User is logged in, data has loaded, but no questions found for this user
            <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
              <ListX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Questions Found</h3>
              <p className="text-sm text-muted-foreground">You haven&apos;t added any questions yet. Click &quot;Add Question&quot; in the header to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
