import * as React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionDocument } from "@/lib/types";
import { format } from 'date-fns';

interface QuestionsTableProps {
  questions: QuestionDocument[];
  onToggleCompletion: (questionId: string, completed: boolean) => void;
}

export function QuestionsTable({ questions, onToggleCompletion }: QuestionsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">Done</TableHead>
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
            <TableCell>
              <Checkbox
                checked={question.completed}
                onCheckedChange={(checked) => onToggleCompletion(question.id, !!checked)}
              />
            </TableCell>
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
  );
} 