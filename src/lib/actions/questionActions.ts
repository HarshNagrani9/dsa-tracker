
'use server';

import type { AddQuestionFormInput, QuestionDocument } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp, orderBy, DocumentData } from 'firebase/firestore';
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
  if (!data.userId) {
    return { success: false, message: "User not authenticated.", error: "User ID is missing." };
  }
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
      title: validationResult.data.title,
      link: validationResult.data.link,
      description: validationResult.data.description,
      difficulty: validationResult.data.difficulty,
      platform: validationResult.data.platform,
      topicName: validationResult.data.topicName,
      comments: validationResult.data.comments,
      userId: validationResult.data.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, "questions"), questionData);

    try {
      await updateStreakOnActivityAction(validationResult.data.userId);
    } catch (streakError) {
      console.error("Error updating streak data after adding question: ", streakError);
      // Do not let streak error block main success path
    }

    // Revalidate paths
    revalidatePath('/'); // For dashboard aggregates
    revalidatePath('/questions'); // For the main questions list
    revalidatePath('/topics'); // For topic list (question counts) & specific topic pages will refetch
    revalidatePath('/streak'); // For streak display


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

export async function getQuestionsByTopicNameAction(topicName: string, userId: string | null | undefined): Promise<QuestionDocument[]> {
  if (!userId) {
    console.log("[getQuestionsByTopicNameAction] No userId provided, returning empty array.");
    return [];
  }
  console.log(`[getQuestionsByTopicNameAction] Fetching questions for topic "${topicName}", userId: ${userId}`);
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(
      questionsCollection,
      where("topicName", "==", topicName),
      where("userId", "==", userId)
      // orderBy("createdAt", "desc") // Keep commented out or remove if index isn't created for it
    );

    console.log(`[getQuestionsByTopicNameAction] Constructed Firestore query for topic "${topicName}", user "${userId}":`, q);

    const querySnapshot = await getDocs(q);
    console.log(`[getQuestionsByTopicNameAction] Found ${querySnapshot.size} questions for topic "${topicName}", userId: ${userId}`);

    const questions = querySnapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        title: data.title || '',
        link: data.link || '',
        description: data.description || '',
        difficulty: data.difficulty || 'Easy',
        platform: data.platform || 'Other',
        topicName: data.topicName || '',
        comments: data.comments || '',
        userId: data.userId,
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
      } as QuestionDocument;
    });
    return questions;
  } catch (error) {
    console.error(`[getQuestionsByTopicNameAction] Error fetching questions for topic "${topicName}", user "${userId}": `, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`FIRESTORE INDEX REQUIRED for topic "${topicName}" and user "${userId}"`);
      console.error(`To fix this, create the composite index in your Firebase Console for the 'questions' collection.`);
      console.error(`Fields for index: topicName (ASC), userId (ASC), createdAt (DESC) - if re-adding sort.`);
      console.error(`Alternatively: topicName (ASC), userId (ASC) if no sorting on createdAt.`);
      console.error(`The error message usually provides a direct link. If not, you need to manually create it.`);
      console.error(`Original error: ${error.message}`);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return [];
  }
}

export async function getAllQuestionsAction(userId: string | null | undefined): Promise<QuestionDocument[]> {
  if (!userId) {
    console.log("[getAllQuestionsAction] No userId provided, returning empty array.");
    return [];
  }
  console.log(`[getAllQuestionsAction] Fetching all questions for userId: ${userId}`);
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(
      questionsCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    console.log(`[getAllQuestionsAction] Found ${querySnapshot.size} questions for userId: ${userId}`);

    const questions = querySnapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        title: data.title || '',
        link: data.link || '',
        description: data.description || '',
        difficulty: data.difficulty || 'Easy',
        platform: data.platform || 'Other',
        topicName: data.topicName || '',
        comments: data.comments || '',
        userId: data.userId,
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
      } as QuestionDocument;
    });
    return questions;
  } catch (error) {
    console.error(`[getAllQuestionsAction] Error fetching all questions for user ${userId}:`, error);
    return [];
  }
}


export async function getQuestionAggregatesAction(userId: string | null | undefined): Promise<{
  difficultyData: { name: string; count: number; fill: string }[];
  platformData: { name: string; count: number; fill: string }[];
  totalSolved: number;
}> {
  if (!userId) {
    console.log("[getQuestionAggregatesAction] No userId, returning empty aggregates.");
    return { difficultyData: [], platformData: [], totalSolved: 0 };
  }
  console.log(`[getQuestionAggregatesAction] Aggregating questions for userId: ${userId}`);

  let questions: Partial<QuestionDocument>[] = [];
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(questionsCollection, where("userId", "==", userId)); // No orderBy needed for aggregation
    const querySnapshot = await getDocs(q);
    questions = querySnapshot.docs.map(doc => doc.data() as QuestionDocument);
    console.log(`[getQuestionAggregatesAction] Found ${questions.length} questions to aggregate for userId: ${userId}`);
  } catch (error) {
    console.error(`[getQuestionAggregatesAction] Error fetching questions for aggregation (userId: ${userId}):`, error);
  }

  const { DIFFICULTIES, PLATFORMS } = await import('@/lib/constants');

  const difficultyCounts: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
  const platformCounts: Record<Platform, number> = {
    LeetCode: 0, CSES: 0, CodeChef: 0, Codeforces: 0, Other: 0
  };

  questions.forEach(q => {
    if (q.difficulty && difficultyCounts[q.difficulty] !== undefined) {
      difficultyCounts[q.difficulty]++;
    }
    if (q.platform && platformCounts[q.platform] !== undefined) {
      platformCounts[q.platform]++;
    } else if (q.platform) { // Handles any platform not in the explicit list by adding to 'Other'
      platformCounts.Other = (platformCounts.Other || 0) + 1;
    }
  });

  const finalDifficultyData = DIFFICULTIES.map((diff, index) => ({
    name: diff,
    count: difficultyCounts[diff],
    fill: `hsl(var(--chart-${index + 1}))`,
  }));

  // Ensure all platforms from constants are represented, even if count is 0
  const finalPlatformData = PLATFORMS.map((plat, index) => ({
    name: plat,
    count: platformCounts[plat] || 0, 
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));


  return {
    difficultyData: finalDifficultyData,
    platformData: finalPlatformData,
    totalSolved: questions.length
  };
}
    
