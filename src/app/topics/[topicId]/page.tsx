
"use client";

import * as React from 'react';
import Link from 'next/link';
import { getTopicByIdAction } from '@/lib/actions/topicActions';
import { getQuestionsByTopicNameAction } from '@/lib/actions/questionActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, ListFilter, User } from 'lucide-react';
import { format } from 'date-fns';
import type { QuestionDocument, TopicDocument } from '@/lib/types';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

interface TopicDetailPageProps {
  params: {
    topicId: string;
  };
}

export default function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { topicId } = params;
  const { user, loading: authLoading } = useAuth();
  
  const [topic, setTopic] = React.useState<TopicDocument | null>(null);
  const [questions, setQuestions] = React.useState<QuestionDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchTopicData() {
      if (user?.uid && topicId) {
        setIsLoading(true);
        setError(null);
        try {
          const fetchedTopic = await getTopicByIdAction(topicId, user.uid);
          if (fetchedTopic) {
            setTopic(fetchedTopic);
            const fetchedQuestions = await getQuestionsByTopicNameAction(fetchedTopic.name, user.uid);
            setQuestions(fetchedQuestions);
          } else {
            setError("Topic not found or you're not authorized to view it.");
            setTopic(null);
            setQuestions([]);
          }
        } catch (e) {
          console.error("Error fetching topic details:", e);
          setError("Failed to load topic details.");
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) { // User not logged in or no topicId
        setIsLoading(false);
        setTopic(null);
        setQuestions([]);
        if (!user) setError("Please sign in to view topic details.");
      }
    }
    fetchTopicData();
  }, [topicId, user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-1/2" />
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

  if (!user && !authLoading) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <User className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Topic Details</h1>
        <p className="text-muted-foreground">Please sign in to view this topic.</p>
         <Button asChild className="mt-4">
          <Link href="/topics">Back to Topics</Link>
        </Button>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
        <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        <Button asChild className="mt-4">
          <Link href="/topics">Back to Topics</Link>
        </Button>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-10">
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

      <Card>
        <CardHeader>
          <CardTitle>Questions in {topic.name}</CardTitle>
          <CardDescription>
            A list of all questions tracked under the topic: {topic.name}. Total: {questions.length} question{questions.length === 1 ? '' : 's'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
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
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={question.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="mt-4 p-8 bg-muted/30 rounded-md flex flex-col items-center justify-center text-center min-h-[200px]">
              <ListFilter className="h-12 w-12 text-muted-foreground mb-3" />
              <h3 className="text-xl font-semibold text-muted-foreground">No Questions Yet for {topic.name}</h3>
              <p className="text-sm text-muted-foreground">Add questions to this topic to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
