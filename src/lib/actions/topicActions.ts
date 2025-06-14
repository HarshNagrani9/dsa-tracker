
'use server';

import { db } from '@/lib/firebase/config';
import { AddTopicSchema, type AddTopicFormInput, type TopicDocument } from '@/lib/types';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp, where, doc, getDoc } from 'firebase/firestore';
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
  // Attempt to parse if it's a string or number representation of a date
  if (typeof timestampField === 'string' || typeof timestampField === 'number') {
    const parsedDate = new Date(timestampField);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  // Fallback for unhandled or invalid types
  return new Date(); 
};


export async function addTopicAction(data: AddTopicFormInput): Promise<ActionResult> {
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
      ...validationResult.data,
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

export async function getTopicsAction(): Promise<TopicDocument[]> {
  try {
    const topicsCollectionRef = collection(db, 'topics');
    const topicsQuery = query(topicsCollectionRef, orderBy('name', 'asc'));
    const topicsSnapshot = await getDocs(topicsQuery);

    const topicsData: TopicDocument[] = [];

    for (const topicDoc of topicsSnapshot.docs) {
      const topic = topicDoc.data();
      const topicName = topic.name;

      // Query for questions count for this topic
      const questionsQuery = query(collection(db, "questions"), where("topicName", "==", topicName));
      const questionsSnapshot = await getDocs(questionsQuery);
      const questionCount = questionsSnapshot.size;

      topicsData.push({
        id: topicDoc.id,
        name: topicName,
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


export async function getTopicByIdAction(topicId: string): Promise<TopicDocument | null> {
  try {
    const topicDocRef = doc(db, 'topics', topicId);
    const topicDocSnap = await getDoc(topicDocRef);

    if (topicDocSnap.exists()) {
      const data = topicDocSnap.data();
      return {
        id: topicDocSnap.id,
        name: data.name,
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
        // questionCount is not typically fetched here, but could be if needed
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
