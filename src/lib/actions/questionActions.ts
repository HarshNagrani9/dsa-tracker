
'use server';

import type { AddQuestionFormInput } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  message: string;
  error?: string | null; 
}

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

    revalidatePath('/questions'); // Revalidate the questions page
    revalidatePath('/'); // Revalidate the dashboard page

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
      message: "Error adding question.", // Generic message for toast title
      error: errorMessage, // Specific error for toast description
    };
  }
}

