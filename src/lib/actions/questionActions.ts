
'use server';

import type { AddQuestionFormInput, QuestionDocument } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  message: string;
  error?: string | null;
}

const parseTimestampToDate = (timestampField: any): Date => {
  if (timestampField instanceof Timestamp) {
    return timestampField.toDate();
  }
  if (timestampField instanceof Date) {
    return timestampField;
  }
  if (typeof timestampField === 'string' || typeof timestampField === 'number') {
    const parsedDate = new Date(timestampField);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  console.warn('Unparseable date encountered, returning current date as fallback:', timestampField);
  return new Date();
};

export async function addQuestionAction(data: AddQuestionFormInput): Promise<ActionResult> {
  const validationResult = AddQuestionSchema.safeParse(data);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(issue => `${issue.path.join('.')} (${issue.code}): ${issue.message}`).join('; ');
    console.error("Validation failed:", errorMessages);
    return {
      success: false,
      message: "Validation failed. Please check the form fields.",
      error: errorMessages,
    };
  }

  try {
    const questionData = {
      ...validationResult.data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "questions"), questionData);
    console.log("Document written with ID: ", docRef.id);

    revalidatePath('/questions');
    revalidatePath('/');
    revalidatePath('/topics');
    if (validationResult.data.topicName) {
        // No specific topic ID to revalidate here, /topics covers list counts.
        // Revalidate the specific topic page if its path can be constructed.
        // For now, revalidating the general /topics path for list updates is sufficient.
    }


    return {
      success: true,
      message: "Question added successfully!",
    };
  } catch (e) {
    console.error("Error adding document to Firestore: ", e);
    let errorMessage = "Failed to add question to Firestore.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return {
      success: false,
      message: "Error adding question.",
      error: errorMessage,
    };
  }
}

export async function getQuestionsByTopicNameAction(topicName: string): Promise<QuestionDocument[]> {
  try {
    const questionsCollection = collection(db, "questions");
    // For sorting by createdAt, a composite index on topicName (asc) and createdAt (desc) is required in Firestore.
    // The Firebase console usually provides a link to create this index if such an error occurs.
    // The orderBy clause has been temporarily removed to allow fetching questions without this specific index.
    // Questions will appear, but may not be sorted chronologically.
    const q = query(
      questionsCollection,
      where("topicName", "==", topicName)
      // orderBy("createdAt", "desc") // Temporarily removed
    );
    const querySnapshot = await getDocs(q);

    const questions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        link: data.link || '',
        description: data.description || '',
        difficulty: data.difficulty || 'Easy',
        platform: data.platform || 'Other',
        topicName: data.topicName || '',
        comments: data.comments || '',
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
      } as QuestionDocument;
    });
    return questions;
  } catch (error) {
    console.error(`Error fetching questions for topic "${topicName}": `, error);
    // If the error is specifically about a missing index, Firebase usually provides a link to create it in the console.
    // Re-throw the error or handle it as appropriate for your application
    if (error instanceof Error && error.message.includes("query requires an index")) {
      console.error("Firestore query requires an index. Please create it in the Firebase console using the link provided in the original error message or logs.");
    }
    return []; // Return empty array or re-throw error based on desired behavior
  }
}
