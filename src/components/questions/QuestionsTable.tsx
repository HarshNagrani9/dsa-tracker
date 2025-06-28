import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionDocument } from "@/lib/types";
import { format } from 'date-fns';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface QuestionsTableProps {
  questions: QuestionDocument[];
  onToggleCompletion: (questionId: string, completed: boolean) => void;
}

export function QuestionsTable({ questions, onToggleCompletion }: QuestionsTableProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {questions.map((question) => {
        const expanded = expandedId === question.id;
        return (
          <div key={question.id}>
            {/* Collapsed row (single line) */}
            <div
              className={`flex items-center px-4 py-2 rounded-md border hover:shadow-sm cursor-pointer transition-colors ${expanded ? 'bg-muted/40 border-primary' : 'bg-card border-border'}`}
              onClick={() => setExpandedId(expanded ? null : question.id)}
              tabIndex={0}
              role="button"
              aria-expanded={expanded}
            >
              <Checkbox
                checked={!!question.completed}
                onCheckedChange={(checked) => onToggleCompletion(question.id, !!checked)}
                className="mr-3"
                title={question.completed ? 'Mark as incomplete' : 'Mark as complete'}
                aria-label="Toggle completion"
                onClick={e => { e.stopPropagation(); }}
                onFocus={e => e.stopPropagation()}
              />
              <span className="flex-1 truncate font-medium text-base">
                {question.title}
              </span>
              <Badge className="ml-2" variant="outline">{question.topicName}</Badge>
              <Badge className="ml-2" variant={
                question.difficulty === "Easy" ? "secondary" : 
                question.difficulty === "Medium" ? "default" : 
                question.difficulty === "Hard" ? "destructive" : "outline"
              }>{question.difficulty}</Badge>
              <Badge className="ml-2" variant="outline">{question.platform}</Badge>
              <span className="ml-2 text-xs text-muted-foreground">{format(question.createdAt, 'MMM d, yyyy')}</span>
              <button
                className="ml-2 p-1 rounded hover:bg-accent focus:outline-none"
                tabIndex={-1}
                aria-label={expanded ? 'Collapse' : 'Expand'}
                onClick={e => { e.stopPropagation(); setExpandedId(expanded ? null : question.id); }}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
            {/* Expanded card */}
            {expanded && (
              <Card className="mt-2 mb-4 border-primary/40 shadow-lg">
                <CardHeader className="pb-2 flex flex-row items-start gap-2 justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate text-lg">
                      {question.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {question.description || <span className="italic text-muted-foreground">No description</span>}
                    </CardDescription>
                  </div>
                  <Checkbox
                    checked={!!question.completed}
                    onCheckedChange={(checked) => onToggleCompletion(question.id, !!checked)}
                    className="mt-1 ml-2"
                    title={question.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    aria-label="Toggle completion"
                    onClick={e => e.stopPropagation()}
                    onFocus={e => e.stopPropagation()}
                  />
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline">{question.topicName}</Badge>
                    <Badge 
                      variant={
                        question.difficulty === "Easy" ? "secondary" : 
                        question.difficulty === "Medium" ? "default" : 
                        question.difficulty === "Hard" ? "destructive" : "outline"
                      }
                      className={question.difficulty === "Medium" ? "bg-accent text-accent-foreground" : ""}
                    >
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline">{question.platform}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Added: {format(question.createdAt, 'MMM d, yyyy')}
                  </div>
                  {question.comments && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-semibold">Comments:</span> {question.comments}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-2">
                  {question.link ? (
                    <Link href={question.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-xs">
                      <ExternalLink className="h-4 w-4" />
                      View Question
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No link</span>
                  )}
                  {question.completed && (
                    <span className="text-xs text-green-600 font-semibold ml-auto">Completed</span>
                  )}
                </CardFooter>
              </Card>
            )}
          </div>
        );
      })}
    </div>
  );
} 