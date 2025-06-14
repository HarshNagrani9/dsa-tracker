
'use server';

import type { AddQuestionFormInput, QuestionDocument } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore'; // orderBy import removed if not used
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
  // console.warn('Unparseable date encountered in parseTimestampToDate, returning current date as fallback:', timestampField);
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
    // console.log("Document written with ID: ", docRef.id);

    revalidatePath('/questions');
    revalidatePath('/');
    revalidatePath('/topics');
    // No need to revalidate specific topicId page here, /topics covers list counts.

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
    // The query is simplified to only filter by topicName.
    // Sorting by createdAt (desc) was removed to avoid the "index required" error.
    // For sorted results, the composite index (topicName ASC, createdAt DESC) must be created in Firestore.
    const q = query(
      questionsCollection,
      where("topicName", "==", topicName)
      // orderBy("createdAt", "desc") // THIS LINE IS INTENTIONALLY REMOVED
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
    if (error instanceof Error && error.message.includes("query requires an index")) {
      console.error(`Firestore query for topic "${topicName}" requires an index. Please create it in the Firebase console using the link provided in the original error message or logs.`);
    }
    return [];
  }
}

