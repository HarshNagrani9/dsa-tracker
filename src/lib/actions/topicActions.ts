
'use server';

import { db } from '@/lib/firebase/config';
import { AddTopicSchema, type AddTopicFormInput, type TopicDocument } from '@/lib/types';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  message: string;
  error?: string | null;
}

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
    revalidatePath('/'); // If topics affect dashboard, e.g. topic dropdowns for filtering
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
    const topicsCollection = collection(db, 'topics');
    const q = query(topicsCollection, orderBy('name', 'asc')); // Order by name
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      } as TopicDocument;
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
}
