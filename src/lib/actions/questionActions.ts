
'use server';

import type { AddQuestionFormInput, QuestionDocument } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { updateStreakOnActivityAction } from './streakActions';

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

    await addDoc(collection(db, "questions"), questionData);

    try {
      await updateStreakOnActivityAction();
      revalidatePath('/');
      revalidatePath('/streak');
    } catch (streakError) {
      console.error("Error updating streak data after adding question: ", streakError);
      // Optionally, decide if this error should affect the overall success message.
      // For now, the question is added, but streak update might have failed.
    }

    revalidatePath('/questions');
    revalidatePath('/topics'); 
    // Note: revalidatePath('/') for dashboard (streak card) is now handled after streak update

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
    // Removed orderBy to avoid mandatory index for now, per user request.
    // For sorting, an index on topicName (asc) and createdAt (desc) would be needed.
    const q = query(
      questionsCollection,
      where("topicName", "==", topicName)
    );

    console.log(`[getQuestionsByTopicNameAction] Constructed Firestore query for topic "${topicName}":`, q);


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
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`FIRESTORE INDEX REQUIRED for topic "${topicName}"`);
      console.error(`To fix this, create the index in your Firebase Console. You might need an index on 'topicName' or a composite index if sorting is re-enabled.`);
      console.error(`The error message usually provides a direct link. If not, you need to create an index on the 'questions' collection for the 'topicName' field.`);
      console.error(`Original error: ${error.message}`);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return [];
  }
}
