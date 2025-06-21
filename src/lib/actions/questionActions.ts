
'use server';

import type { AddQuestionFormInput, QuestionDocument } from '@/lib/types';
import { AddQuestionSchema } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs, query, where, Timestamp, orderBy, DocumentData, runTransaction, doc, writeBatch, deleteDoc } from 'firebase/firestore';
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
  console.warn(`[parseTimestampToDate] Failed to parse timestamp:`, timestampField, `Returning current date.`);
  return new Date();
};

async function findOrCreateTopic(topicName: string, userId: string): Promise<string | null> {
  console.log(`[findOrCreateTopic] Attempting to find or create topic: "${topicName}" for userId: ${userId}`);
  const topicsCollectionRef = collection(db, 'topics');
  const topicQuery = query(
    topicsCollectionRef,
    where('name', '==', topicName),
    where('userId', '==', userId)
  );

  try {
    const querySnapshot = await getDocs(topicQuery);
    if (!querySnapshot.empty) {
      const existingTopic = querySnapshot.docs[0];
      console.log(`[findOrCreateTopic] Found existing topic with ID: ${existingTopic.id} for topic name "${topicName}" and user ${userId}.`);
      return existingTopic.id;
    } else {
      console.log(`[findOrCreateTopic] Topic "${topicName}" not found for user ${userId}. Creating new topic.`);
      const newTopicData = {
        name: topicName,
        userId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const newTopicRef = await addDoc(topicsCollectionRef, newTopicData);
      console.log(`[findOrCreateTopic] Created new topic with ID: ${newTopicRef.id} for topic name "${topicName}" and user ${userId}.`);
      return newTopicRef.id;
    }
  } catch (error) {
    console.error(`[findOrCreateTopic] Error finding or creating topic "${topicName}" for user ${userId}:`, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`!!! FIRESTORE INDEX REQUIRED for 'topics' collection for auto topic creation/lookup. !!!`);
      console.error(`Query involved: where('name', '==', '${topicName}'), where('userId', '==', '${userId}')`);
      console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'topics' collection with fields:`);
      console.error(`  - name (Ascending)`);
      console.error(`  - userId (Ascending)`);
      console.error(`OR:`);
      console.error(`  - userId (Ascending)`);
      console.error(`  - name (Ascending)`);
      console.error(`The error message usually provides a direct link: ${error.message}`);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return null; 
  }
}


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
    // findOrCreateTopic will attempt to create the topic if it doesn't exist.
    // The topicId returned isn't strictly necessary for the question document itself if we store topicName,
    // but ensuring the topic exists is the main goal here.
    await findOrCreateTopic(validationResult.data.topicName, validationResult.data.userId);
    
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
    }

    revalidatePath('/'); 
    revalidatePath('/questions'); 
    revalidatePath('/topics'); // Revalidate topics list because a new topic might have been created or question counts might change
    revalidatePath(`/topics/${validationResult.data.topicName}`); // Revalidate specific topic page (though ID is better if available)
    revalidatePath('/streak'); 


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

export async function toggleQuestionCompletionAction(questionId: string, completed: boolean, userId: string): Promise<ActionResult> {
  if (!userId) {
    return { success: false, message: "User not authenticated.", error: "User ID is missing." };
  }

  const completionRef = doc(db, "questionCompletions", `${userId}_${questionId}`);

  try {
    if (completed) {
      await runTransaction(db, async (transaction) => {
        transaction.set(completionRef, {
          userId: userId,
          questionId: questionId,
          completedAt: serverTimestamp(),
        });
      });
      // Also update streak
      await updateStreakOnActivityAction(userId);
    } else {
      await runTransaction(db, async (transaction) => {
        transaction.delete(completionRef);
      });
    }
    revalidatePath('/questions');
    revalidatePath('/topics');
    revalidatePath('/streak');
    return { success: true, message: `Question status updated.` };
  } catch (e) {
    console.error("Error toggling question completion status: ", e);
    let errorMessage = "Failed to update question status.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return { success: false, message: "Error updating status.", error: errorMessage };
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
      // Consider adding orderBy('createdAt', 'desc') here if desired,
      // but it will require an index: topicName ASC, userId ASC, createdAt DESC
    );

    console.log(`[getQuestionsByTopicNameAction] Constructed Firestore query for topic "${topicName}", user "${userId}":`, JSON.stringify({
        collection: 'questions',
        filters: [
            {field: 'topicName', op: '==', value: topicName},
            {field: 'userId', op: '==', value: userId}
        ]
    }));

    const querySnapshot = await getDocs(q);
    console.log(`[getQuestionsByTopicNameAction] Firestore query executed. Found ${querySnapshot.size} questions for topic "${topicName}", userId: ${userId}`);

    const questions: QuestionDocument[] = querySnapshot.docs.map(doc => {
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

    // Fetch completion data
    const completions = await getQuestionCompletions(userId);
    const completedQuestionIds = new Map(completions.map(c => [c.questionId, c.completedAt]));

    const mergedQuestions = questions.map(q => ({
      ...q,
      completed: completedQuestionIds.has(q.id),
      completedAt: completedQuestionIds.get(q.id),
    }));


    // Sort client-side if not ordering in the query
    mergedQuestions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log(`[getQuestionsByTopicNameAction] Successfully mapped and sorted ${mergedQuestions.length} questions.`);
    return mergedQuestions;
  } catch (error) {
    console.error(`[getQuestionsByTopicNameAction] Error fetching questions for topic "${topicName}", user "${userId}": `, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`!!! FIRESTORE INDEX REQUIRED for 'questions' collection for Topic Detail Page. !!!`);
      console.error(`Query involved: where("topicName", "==", "${topicName}") AND where("userId", "==", "${userId}").`);
      console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'questions' collection with fields:`);
      console.error(`  - topicName (Ascending)`);
      console.error(`  - userId (Ascending)`);
      console.error(`OR:`);
      console.error(`  - userId (Ascending)`);
      console.error(`  - topicName (Ascending)`);
      console.error(`(If you also order by createdAt, add that as a third field to the index).`);
      console.error(`The error message usually provides a direct link: ${error.message}`);
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
      where("userId", "==", userId)
      // orderBy("createdAt", "desc") // Removed to avoid mandatory index for basic listing
                                    // Will sort client-side instead.
                                    // If this orderBy is added back, an index on userId (ASC), createdAt (DESC) is needed.
    );
    console.log(`[getAllQuestionsAction] Constructed Firestore query for user "${userId}":`, JSON.stringify({
        collection: 'questions',
        filters: [{field: 'userId', op: '==', value: userId}]
    }));
    const querySnapshot = await getDocs(q);
    console.log(`[getAllQuestionsAction] Firestore query executed. Found ${querySnapshot.size} questions for userId: ${userId}`);

    const questions: QuestionDocument[] = querySnapshot.docs.map(doc => {
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

     // Fetch completion data
    const completions = await getQuestionCompletions(userId);
    const completedQuestionIds = new Map(completions.map(c => [c.questionId, c.completedAt]));

    const mergedQuestions = questions.map(q => ({
      ...q,
      completed: completedQuestionIds.has(q.id),
      completedAt: completedQuestionIds.get(q.id),
    }));

    // Sort client-side
    mergedQuestions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log(`[getAllQuestionsAction] Successfully mapped and sorted ${mergedQuestions.length} questions.`);
    return mergedQuestions;
  } catch (error) {
    console.error(`[getAllQuestionsAction] Error fetching all questions for user "${userId}": `, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`!!! FIRESTORE INDEX REQUIRED for 'questions' collection for Questions Page (if ordering by createdAt in query). !!!`);
      console.error(`Query involved: where("userId", "==", "${userId}"), orderBy("createdAt", "desc")`);
      console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'questions' collection with fields:`);
      console.error(`  - userId (Ascending)`);
      console.error(`  - createdAt (Descending)`);
      console.error(`The error message usually provides a direct link: ${error.message}`);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return []; 
  }
}

async function getQuestionCompletions(userId: string): Promise<{ questionId: string; completedAt: Date }[]> {
  const completionsCol = collection(db, 'questionCompletions');
  const q = query(completionsCol, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      questionId: data.questionId,
      completedAt: parseTimestampToDate(data.completedAt),
    };
  });
}

export async function getHeatmapDataAction(userId: string | null | undefined): Promise<{ date: string; count: number }[]> {
    if (!userId) return [];
    
    const completions = await getQuestionCompletions(userId);
    const countsByDay: { [key: string]: number } = {};

    completions.forEach(c => {
        const date = c.completedAt.toISOString().split('T')[0]; // YYYY-MM-DD
        countsByDay[date] = (countsByDay[date] || 0) + 1;
    });

    return Object.entries(countsByDay).map(([date, count]) => ({ date, count }));
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
    const q = query(questionsCollection, where("userId", "==", userId)); 
    console.log(`[getQuestionAggregatesAction] Constructed Firestore query for user "${userId}":`, JSON.stringify({
        collection: 'questions',
        filters: [{field: 'userId', op: '==', value: userId}]
    }));
    const querySnapshot = await getDocs(q);
    questions = querySnapshot.docs.map(doc => doc.data() as QuestionDocument);
    console.log(`[getQuestionAggregatesAction] Firestore query executed. Found ${questions.length} questions to aggregate for userId: ${userId}`);
  } catch (error) {
    console.error(`[getQuestionAggregatesAction] Error fetching questions for aggregation (userId: ${userId}):`, error);
      if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`!!! FIRESTORE INDEX REQUIRED for 'questions' collection for aggregating dashboard data. !!!`);
      console.error(`Query involved: where("userId", "==", "${userId}").`);
      console.error(`(A simple query on 'userId' usually doesn't need a custom index, but if other operations are implicitly involved or if Firestore's query planner decides so, it might be requested).`);
      console.error(`The error message usually provides a direct link: ${error.message}`);
      console.error(`--------------------------------------------------------------------------------`);
    }
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

