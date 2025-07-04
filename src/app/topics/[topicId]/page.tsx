
"use client";

import * as React from 'react';
import Link from 'next/link';
import { getTopicByIdAction } from '@/lib/actions/topicActions';
import { getQuestionsByTopicNameAction, toggleQuestionCompletionAction } from '@/lib/actions/questionActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, User, AlertTriangle, ListX, FolderX, Filter as FilterIcon, Loader2, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import type { QuestionDocument, TopicDocument, Difficulty, Platform, FilterOption } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { DIFFICULTIES, PLATFORMS } from '@/lib/constants';
import { useIsMobile } from '@/hooks/use-mobile';
import { SignInForm } from '@/components/auth/SignInForm';
import { QuestionsTable } from '@/components/questions/QuestionsTable';
import { toast } from '@/hooks/use-toast';

interface TopicDetailPageProps {
  params: { // Keep this structure for the prop type
    topicId: string;
  };
}

export default function TopicDetailPage({ params: paramsProp }: TopicDetailPageProps) {
  const params = React.use(paramsProp); // Use React.use() here
  const { topicId } = params; // Destructure after using React.use()
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  
  const [topic, setTopic] = React.useState<TopicDocument | null>(null);
  const [questions, setQuestions] = React.useState<QuestionDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [selectedDifficulty, setSelectedDifficulty] = React.useState<FilterOption<Difficulty>>('All');
  const [selectedPlatform, setSelectedPlatform] = React.useState<FilterOption<Platform>>('All');

  React.useEffect(() => {
    async function fetchTopicPageData(currentTopicId: string, currentUserId: string) {
      setIsLoading(true);
      setError(null);
      setTopic(null);
      setQuestions([]);
      try {
        const fetchedTopic = await getTopicByIdAction(currentTopicId, currentUserId);
        if (fetchedTopic) {
          setTopic(fetchedTopic);
          const fetchedQuestions = await getQuestionsByTopicNameAction(fetchedTopic.name, currentUserId);
          setQuestions(fetchedQuestions);
        } else {
          setError("Topic not found or you're not authorized to view it.");
          setTopic(null);
          setQuestions([]);
        }
      } catch (e) {
        console.error("Error fetching topic details:", e);
        setError("Failed to load topic details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (authLoading) {
      setIsLoading(true);
      setTopic(null);
      setQuestions([]);
      setError(null);
      return;
    }

    if (user?.uid && topicId) {
      fetchTopicPageData(topicId, user.uid);
    } else {
      setIsLoading(false);
      setTopic(null);
      setQuestions([]);
      if (!user) setError(null); // Clear error if it was due to no user initially
    }
  }, [topicId, user, authLoading]);

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
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-1/2" />
        </div>
        <div className="flex gap-4 my-4">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
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
        <ListChecks className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Topic Details</h1>
        <p className="text-muted-foreground">Please sign in to view this topic.</p>
         <div className="flex gap-4 mt-6">
            <Button asChild>
                <Link href="/signin">Sign In / Sign Up</Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/topics">Back to Topics</Link>
            </Button>
         </div>
      </div>
     );
    }
  }
  
  if (isLoading && !error) { // Show skeleton only if loading and no preceding error
     return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-1/2" />
        </div>
         <div className="flex gap-4 my-4">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive mb-2">Error Loading Topic</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/topics">Back to Topics</Link>
        </Button>
      </div>
    );
  }

  if (!topic) { // This case might be hit if not loading, no error, but topic is still null (e.g., after fetchTopicPageData sets it to null on non-existence)
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <FolderX className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Topic Not Found</h1>
        <p className="text-muted-foreground">The topic you are looking for does not exist or you might not have access.</p>
        <Button asChild className="mt-4">
          <Link href="/topics">Back to Topics</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/topics">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Topics</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight font-headline">{topic.name}</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 my-0">
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
          <CardTitle>Questions in {topic.name}</CardTitle>
          <CardDescription>
            A list of questions tracked under this topic. Total originally fetched: {questions.length}.
            { (selectedDifficulty !== 'All' || selectedPlatform !== 'All') && ` Currently showing: ${filteredQuestions.length}.` }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 && !isLoading ? ( // Ensure not loading before showing "No Questions Yet"
             <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
              <ListX className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Questions Yet</h3>
              <p className="text-muted-foreground">This topic doesn&apos;t have any questions associated with it.</p>
            </div>
          ) : filteredQuestions.length > 0 ? (
            <QuestionsTable questions={filteredQuestions} onToggleCompletion={handleToggleCompletion} />
          ) : (
             <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
                <FilterIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground">No Questions Match Filters</h3>
                <p className="text-muted-foreground">Try adjusting your difficulty or platform filters.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
