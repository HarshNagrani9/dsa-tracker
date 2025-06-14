'use server';

import type { AddQuestionFormInput } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';

interface ActionResult {
  success: boolean;
  message: string;
  error?: string | null;
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

  // Simulate saving the data
  console.log("New Question Data:", validationResult.data);

  // In a real application, you would save to a database here.
  // For now, we'll just simulate success.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  return {
    success: true,
    message: "Question added successfully!",
  };
}