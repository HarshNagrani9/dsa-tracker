
'use server';

import type { AddQuestionFormInput } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ActionResult {
  success: boolean;
  message: string;
  error?: string | string[] | null; 
}

export async function addQuestionAction(data: AddQuestionFormInput): Promise<ActionResult> {
  const validationResult = AddQuestionSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: "Validation failed.",
      error: validationResult.error.flatten().fieldErrors_toString(),
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

    return {
      success: true,
      message: "Question added successfully to Firestore!",
    };
  } catch (e) {
    console.error("Error adding document: ", e);
    let errorMessage = "Failed to add question to Firestore.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return {
      success: false,
      message: errorMessage,
      error: String(e),
    };
  }
}
