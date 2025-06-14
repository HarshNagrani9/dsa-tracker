
'use server';

import { db } from '@/lib/firebase/config';
import { AddTopicSchema, type AddTopicFormInput, type TopicDocument } from '@/lib/types';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp, where, doc, getDoc, DocumentData } from 'firebase/firestore';
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
  return new Date(); 
};


export async function addTopicAction(data: AddTopicFormInput): Promise<ActionResult> {
  if (!data.userId) {
    return { success: false, message: "User not authenticated.", error: "User ID is missing." };
  }
  const validationResult = AddTopicSchema.safeParse(data);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(issue => `${issue.path.join('.')} (${issue.code}): ${issue.message}`).join('; ');
    return {
      success: false,
      message: 'Validation failed. Please check the form fields.',
      error: errorMessages,
    };
  }

  try {
    const topicData = {
      name: validationResult.data.name,
      userId: validationResult.data.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'topics'), topicData);
    revalidatePath('/topics');
    revalidatePath('/'); 
    return {
      success: true,
      message: 'Topic added successfully!',
    };
  } catch (e) {
    let errorMessage = 'Failed to add topic to Firestore.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error("Error adding topic to Firestore: ", e);
    return {
      success: false,
      message: 'Error adding topic.',
      error: errorMessage,
    };
  }
}

export async function getTopicsAction(userId: string | null | undefined): Promise<TopicDocument[]> {
  if (!userId) {
    console.log("[getTopicsAction] No userId provided, returning empty array.");
    return [];
  }
  console.log(`[getTopicsAction] Fetching topics for userId: ${userId}`);
  try {
    const topicsCollectionRef = collection(db, 'topics');
    const topicsQuery = query(
      topicsCollectionRef, 
      where('userId', '==', userId),
      orderBy('name', 'asc') 
    );
    console.log(`[getTopicsAction] Constructed Firestore query for topics (user "${userId}"):`, topicsQuery.type, topicsQuery);
    const topicsSnapshot = await getDocs(topicsQuery);
    console.log(`[getTopicsAction] Found ${topicsSnapshot.size} topics for userId: ${userId}`);

    const topicsData: TopicDocument[] = [];

    for (const topicDoc of topicsSnapshot.docs) {
      const topic = topicDoc.data() as DocumentData;
      const topicName = topic.name;

      const questionsQuery = query(
        collection(db, "questions"), 
        where("topicName", "==", topicName),
        where("userId", "==", userId)
      );
      const questionsSnapshot = await getDocs(questionsQuery);
      const questionCount = questionsSnapshot.size;

      topicsData.push({
        id: topicDoc.id,
        name: topicName,
        userId: topic.userId,
        createdAt: parseTimestampToDate(topic.createdAt),
        updatedAt: parseTimestampToDate(topic.updatedAt),
        questionCount: questionCount,
      });
    }
    return topicsData;
  } catch (error) {
    console.error(`[getTopicsAction] Error fetching topics for user ${userId}:`, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`FIRESTORE INDEX REQUIRED for 'topics' or 'questions' collection during getTopicsAction.`);
      console.error(`For 'topics' query (where('userId', '==', userId), orderBy('name', 'asc')):`);
      console.error(`  - Suggested index: userId (ASC), name (ASC) on 'topics' collection.`);
      console.error(`For 'questions' query (where("topicName", "==", topicName), where("userId", "==", userId)) for counts:`);
      console.error(`  - Suggested index: topicName (ASC), userId (ASC) on 'questions' collection.`);
      console.error(`  - Or: userId (ASC), topicName (ASC) on 'questions' collection.`);
      console.error(`The error message usually provides a direct link: ${error.message}`);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return [];
  }
}


export async function getTopicByIdAction(topicId: string, userId: string | null | undefined): Promise<TopicDocument | null> {
  if (!userId) {
     console.log("[getTopicByIdAction] No userId provided, returning null.");
    return null;
  }
  console.log(`[getTopicByIdAction] Fetching topic by ID "${topicId}" for userId: ${userId}`);
  try {
    const topicDocRef = doc(db, 'topics', topicId);
    const topicDocSnap = await getDoc(topicDocRef);

    if (topicDocSnap.exists()) {
      const data = topicDocSnap.data() as DocumentData;
      if (data.userId !== userId) {
        console.warn(`[getTopicByIdAction] User ${userId} not authorized to view topic ${topicId} owned by ${data.userId}.`);
        return null; 
      }
      return {
        id: topicDocSnap.id,
        name: data.name,
        userId: data.userId,
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
      };
    } else {
      console.log(`[getTopicByIdAction] No such topic document with ID: ${topicId}`);
      return null;
    }
  } catch (error) {
    console.error(`[getTopicByIdAction] Error fetching topic by ID ${topicId} for user ${userId}:`, error);
    // No specific index error check here as it's a direct doc get, permissions are more likely.
    return null;
  }
}


    