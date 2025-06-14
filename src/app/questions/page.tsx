
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
import { db } from "@/lib/firebase/config";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import type { QuestionDocument } from "@/lib/types";
import { format } from 'date-fns';

async function getQuestions(): Promise<QuestionDocument[]> {
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(questionsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const questions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure all fields are present and correctly typed
      return {
        id: doc.id,
        title: data.title || '',
        link: data.link || '',
        description: data.description || '',
        difficulty: data.difficulty || 'Easy', // Provide a default or handle missing
        platform: data.platform || 'Other', // Provide a default or handle missing
        topicName: data.topicName || '',
        comments: data.comments || '',
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(), // Convert Timestamp to Date
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(), // Convert Timestamp to Date
      } as QuestionDocument;
    });
    return questions;
  } catch (error) {
    console.error("Error fetching questions: ", error);
    return []; // Return empty array on error
  }
}

export default async function QuestionsPage() {
  const questions = await getQuestions();

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
          {questions.length > 0 ? (
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
                          question.difficulty === "Medium" ? "default" : // using primary color for medium
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
            <div className="mt-4 p-8 bg-muted/50 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">No questions added yet. Click "Add Question" to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
