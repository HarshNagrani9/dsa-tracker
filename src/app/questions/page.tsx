
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { QuestionDocument, Difficulty, Platform, FilterOption } from "@/lib/types";
import { format } from 'date-fns';
import { useAuth } from '@/providers/AuthProvider';
import { getAllQuestionsAction, toggleQuestionCompletionAction } from '@/lib/actions/questionActions';
import { Skeleton } from '@/components/ui/skeleton';
import { User, ListX, Filter as FilterIcon, Loader2, FileQuestion } from 'lucide-react'; // Added FileQuestion for consistency
import { DIFFICULTIES, PLATFORMS } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-mobile';
import { SignInForm } from '@/components/auth/SignInForm';
import { QuestionsTable } from '@/components/questions/QuestionsTable';
import { toast } from '@/hooks/use-toast';

export default function QuestionsPage() {
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [questions, setQuestions] = React.useState<QuestionDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [selectedDifficulty, setSelectedDifficulty] = React.useState<FilterOption<Difficulty>>('All');
  const [selectedPlatform, setSelectedPlatform] = React.useState<FilterOption<Platform>>('All');

  React.useEffect(() => {
    async function fetchUserQuestions(currentUserId: string) {
      setIsLoading(true);
      setQuestions([]);
      try {
        const userQuestions = await getAllQuestionsAction(currentUserId);
        setQuestions(userQuestions);
        console.log("[QuestionsPage] useEffect: getAllQuestionsAction returned:", userQuestions);
      } catch (error) {
        console.error("[QuestionsPage] Error fetching questions:", error);
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      setIsLoading(true);
      setQuestions([]);
      return;
    }

    if (user?.uid) {
      fetchUserQuestions(user.uid);
    } else {
      setQuestions([]);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const handleToggleCompletion = async (questionId: string, completed: boolean) => {
    if (!user) return;

    // Optimistic UI update
    setQuestions(prevQuestions =>
      prevQuestions.map(q =>
        q.id === questionId ? { ...q, completed } : q
      )
    );

    const result = await toggleQuestionCompletionAction(questionId, completed, user.uid);

    if (!result.success) {
      // Revert on failure
      setQuestions(prevQuestions =>
        prevQuestions.map(q =>
          q.id === questionId ? { ...q, completed: !completed } : q
        )
      );
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const filteredQuestions = React.useMemo(() => {
    return questions.filter(question => {
      const difficultyMatch = selectedDifficulty === 'All' || question.difficulty === selectedDifficulty;
      const platformMatch = selectedPlatform === 'All' || question.platform === selectedPlatform;
      return difficultyMatch && platformMatch;
    });
  }, [questions, selectedDifficulty, selectedPlatform]);

  if (authLoading) {
     return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
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
        <FileQuestion className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Your Questions</h1>
        <p className="text-muted-foreground">Please sign in to manage and view your questions.</p>
        <Button asChild className="mt-6">
          <Link href="/signin">Sign In / Sign Up</Link>
        </Button>
      </div>
     );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight font-headline">Questions</h1>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Select onValueChange={(value) => setSelectedDifficulty(value as FilterOption<Difficulty>)} value={selectedDifficulty}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Difficulties</SelectItem>
            {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => setSelectedPlatform(value as FilterOption<Platform>)} value={selectedPlatform}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Platforms</SelectItem>
            {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tracked Questions</CardTitle>
          <CardDescription>
            View and manage all your DSA questions. Add new questions using the button in the header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <Skeleton className="h-64 w-full" />
          ) : questions.length === 0 ? (
            <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
              <ListX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Questions Found</h3>
              <p className="text-sm text-muted-foreground">You haven&apos;t added any questions yet. Click &quot;Add Question&quot; in the header to get started!</p>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <QuestionsTable questions={filteredQuestions} onToggleCompletion={handleToggleCompletion} />
          ) : (
            <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
              <FilterIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Questions Match Filters</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your difficulty or platform filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
