
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
      revalidatePath('/');
      revalidatePath('/streak');
    } catch (streakError) {
      console.error("Error updating streak data after adding question: ", streakError);
    }

    revalidatePath('/questions');
    revalidatePath(`/topics`); 
    revalidatePath(`/topics/${validationResult.data.topicName}`); // May need topic ID if path is /topics/[id]

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
  if (!userId) return [];
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(
      questionsCollection,
      where("topicName", "==", topicName),
      where("userId", "==", userId),
      orderBy("createdAt", "desc") 
    );

    console.log(`[getQuestionsByTopicNameAction] Constructed Firestore query for topic "${topicName}", user "${userId}":`, q);

    const querySnapshot = await getDocs(q);

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
    console.error(`Error fetching questions for topic "${topicName}", user "${userId}": `, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`FIRESTORE INDEX REQUIRED for topic "${topicName}" and user "${userId}"`);
      console.error(`To fix this, create the composite index in your Firebase Console: topicName (ASC), userId (ASC), createdAt (DESC) on the 'questions' collection.`);
      console.error(`The error message usually provides a direct link. If not, you need to manually create it.`);
      console.error(`Original error: ${error.message}`);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return [];
  }
}

export async function getAllQuestionsAction(userId: string | null | undefined): Promise<QuestionDocument[]> {
  if (!userId) return [];
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(
      questionsCollection, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
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
    console.error("Error fetching all questions for user:", error);
    return []; 
  }
}


export async function getQuestionAggregatesAction(userId: string | null | undefined): Promise<{
  difficultyData: { name: string; count: number; fill: string }[];
  platformData: { name: string; count: number; fill: string }[];
  totalSolved: number;
}> {
  if (!userId) return { difficultyData: [], platformData: [], totalSolved: 0 };

  let questions: Partial<QuestionDocument>[] = [];
  try {
    const questionsCollection = collection(db, "questions");
    const q = query(questionsCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    questions = querySnapshot.docs.map(doc => doc.data() as QuestionDocument);
  } catch (error) {
    console.error("Error fetching questions for aggregation:", error);
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
    } else if (q.platform) { 
      platformCounts.Other = (platformCounts.Other || 0) + 1;
    }
  });

  const finalDifficultyData = DIFFICULTIES.map((diff, index) => ({
    name: diff,
    count: difficultyCounts[diff],
    fill: `hsl(var(--chart-${index + 1}))`,
  }));
  
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

