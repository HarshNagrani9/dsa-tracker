
'use server';

import { db } from '@/lib/firebase/config';
import { AddContestSchema, type AddContestFormInput, type ContestDocumentClient, type ContestDocumentFirestore } from '@/lib/types';
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp, where, DocumentData } from 'firebase/firestore';
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

export async function addContestAction(data: AddContestFormInput): Promise<ActionResult> {
  if (!data.userId) {
    return { success: false, message: "User not authenticated.", error: "User ID is missing." };
  }
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
    const contestData: Omit<ContestDocumentFirestore, 'id'> = { // Ensure type matches Firestore structure
      title: validationResult.data.title,
      platform: validationResult.data.platform,
      date: Timestamp.fromDate(validationResult.data.date), 
      startTime: validationResult.data.startTime,
      endTime: validationResult.data.endTime,
      userId: validationResult.data.userId,
      createdAt: serverTimestamp() as Timestamp, // Cast needed as serverTimestamp can be FieldValue
      updatedAt: serverTimestamp() as Timestamp,
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

export async function getContestsAction(userId: string | null | undefined): Promise<ContestDocumentClient[]> {
  if (!userId) return [];
  try {
    const contestsCollection = collection(db, 'contests');
    const q = query(
      contestsCollection, 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data() as DocumentData; // Firestore data
      return {
        id: doc.id,
        title: data.title,
        platform: data.platform,
        date: parseTimestampToDate(data.date), 
        startTime: data.startTime,
        endTime: data.endTime,
        userId: data.userId,
        createdAt: parseTimestampToDate(data.createdAt),
        updatedAt: parseTimestampToDate(data.updatedAt),
      } as ContestDocumentClient; 
    });
  } catch (error) {
    console.error('Error fetching contests:', error);
    return [];
  }
}

export async function getUpcomingContestsCountAction(userId: string | null | undefined): Promise<number> {
  if (!userId) return 0;
  try {
    const contestsCollection = collection(db, "contests");
    const today = new Date();
    today.setHours(0,0,0,0); 
    const todayTimestamp = Timestamp.fromDate(today);

    const q = query(
      contestsCollection, 
      where("userId", "==", userId),
      where("date", ">=", todayTimestamp)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching upcoming contests count:", error);
    return 0;
  }
}
