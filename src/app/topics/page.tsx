
import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListChecks, FileQuestion } from "lucide-react";
import { getTopicsAction } from '@/lib/actions/topicActions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AddTopicDialog } from '@/components/topics/AddTopicDialog';
import { Badge } from '@/components/ui/badge';

export default async function TopicsPage() {
  const topics = await getTopicsAction();

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
          {topics.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-22rem)]"> {/* Adjusted height for better scroll */}
              <ul className="space-y-3">
                {topics.map((topic) => (
                  <li key={topic.id}>
                    <Link href={`/topics/${topic.id}`} legacyBehavior={false} passHref={false}>
                      <a className="flex items-center justify-between p-4 bg-muted/50 rounded-md hover:bg-muted transition-colors group">
                        <div className="flex items-center gap-3">
                          <ListChecks className="h-5 w-5 text-primary group-hover:text-accent" />
                          <span className="font-medium group-hover:text-accent">{topic.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="font-normal">
                            {topic.questionCount || 0} Question{topic.questionCount === 1 ? '' : 's'}
                           </Badge>
                          <FileQuestion className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                        </div>
                      </a>
                    </Link>
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
