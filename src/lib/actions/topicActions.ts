
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
  if (!userId) return [];
  try {
    const topicsCollectionRef = collection(db, 'topics');
    const topicsQuery = query(
      topicsCollectionRef, 
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );
    const topicsSnapshot = await getDocs(topicsQuery);

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
    console.error('Error fetching topics with question counts:', error);
    return [];
  }
}


export async function getTopicByIdAction(topicId: string, userId: string | null | undefined): Promise<TopicDocument | null> {
  if (!userId) return null;
  try {
    const topicDocRef = doc(db, 'topics', topicId);
    const topicDocSnap = await getDoc(topicDocRef);

    if (topicDocSnap.exists()) {
      const data = topicDocSnap.data() as DocumentData;
      if (data.userId !== userId) {
        console.log("User not authorized to view this topic.");
        return null; // Or throw an error
      }
      return {
        id: topicDocSnap.id,
        name: data.name,
        userId: data.userId,
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
      };
    } else {
      console.log("No such topic document!");
      return null;
    }
  } catch (error) {
    console.error('Error fetching topic by ID:', error);
    return null;
  }
}
