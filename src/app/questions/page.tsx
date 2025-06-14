
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
import { User } from 'lucide-react';

export default function QuestionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = React.useState<QuestionDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchQuestions() {
      if (user?.uid) {
        setIsLoading(true);
        try {
          const userQuestions = await getAllQuestionsAction(user.uid);
          setQuestions(userQuestions);
        } catch (error) {
          console.error("Error fetching questions:", error);
          setQuestions([]);
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) {
        setQuestions([]);
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, [user, authLoading]);

  if (authLoading || (isLoading && !questions.length && !user)) {
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

  if (!user && !authLoading) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <User className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your Questions</h1>
        <p className="text-muted-foreground">Please sign in to manage and view your questions.</p>
      </div>
    );
  }


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
          {isLoading && questions.length === 0 ? (
             <Skeleton className="h-64 w-full" />
          ): questions.length > 0 ? (
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
          ) : (
            <div className="mt-4 p-8 bg-muted/50 rounded-md flex items-center justify-center text-center min-h-[200px]">
              <p className="text-muted-foreground">No questions added yet. Click "Add Question" in the header to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
