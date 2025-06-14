
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
      date: Timestamp.fromDate(validationResult.data.date), 
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'contests'), contestData);
    revalidatePath('/contests');
    revalidatePath('/'); 
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
    const q = query(contestsCollection, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

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

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        platform: data.platform,
        date: parseTimestampToDate(data.date), 
        startTime: data.startTime,
        endTime: data.endTime,
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
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
    today.setHours(0,0,0,0); 
    const todayTimestamp = Timestamp.fromDate(today);

    const q = query(contestsCollection, where("date", ">=", todayTimestamp));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching upcoming contests count:", error);
    return 0;
  }
}
