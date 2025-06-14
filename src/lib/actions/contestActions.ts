
'use server';

import { db } from '@/lib/firebase/config';
import { AddContestSchema, type AddContestFormInput, type ContestDocumentClient } from '@/lib/types';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp, where } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  message: string;
  error?: string | null;
}

export async function addContestAction(data: AddContestFormInput): Promise<ActionResult> {
  const validationResult = AddContestSchema.safeParse(data);

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map(issue => `${issue.path.join('.')} (${issue.code}): ${issue.message}`).join('; ');
    return {
      success: false,
      message: 'Validation failed. Please check the form fields.',
      error: errorMessages,
    };
  }

  try {
    const contestData = {
      ...validationResult.data,
      date: Timestamp.fromDate(validationResult.data.date), // Convert JS Date to Firestore Timestamp
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'contests'), contestData);
    revalidatePath('/contests');
    revalidatePath('/'); // For upcoming contests count on dashboard
    return {
      success: true,
      message: 'Contest added successfully!',
    };
  } catch (e) {
    let errorMessage = 'Failed to add contest to Firestore.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error("Error adding contest to Firestore: ", e);
    return {
      success: false,
      message: 'Error adding contest.',
      error: errorMessage,
    };
  }
}

export async function getContestsAction(): Promise<ContestDocumentClient[]> {
  try {
    const contestsCollection = collection(db, 'contests');
    // Simplified query to order only by date.
    // For sorting by date then startTime, a composite index (date DESC, startTime ASC) is needed in Firestore.
    const q = query(contestsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        platform: data.platform,
        date: (data.date as Timestamp).toDate(), // Convert Firestore Timestamp to JS Date
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      } as ContestDocumentClient;
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    return [];
  }
}

export async function getUpcomingContestsCountAction(): Promise<number> {
  try {
    const contestsCollection = collection(db, "contests");
    const today = new Date();
    today.setHours(0,0,0,0); // Start of today for comparison
    const todayTimestamp = Timestamp.fromDate(today);

    const q = query(contestsCollection, where("date", ">=", todayTimestamp));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching upcoming contests count:", error);
    return 0;
  }
}

