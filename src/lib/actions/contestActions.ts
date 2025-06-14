
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
  // Fallback to current date if parsing fails, though ideally, this shouldn't be hit with valid Firestore data
  console.warn(`[parseTimestampToDate] Failed to parse timestamp:`, timestampField, `Returning current date.`);
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
    const contestData: Omit<ContestDocumentFirestore, 'id'> = { 
      title: validationResult.data.title,
      platform: validationResult.data.platform,
      date: Timestamp.fromDate(validationResult.data.date), 
      startTime: validationResult.data.startTime,
      endTime: validationResult.data.endTime,
      userId: validationResult.data.userId,
      createdAt: serverTimestamp() as Timestamp, 
      updatedAt: serverTimestamp() as Timestamp,
    };
    await addDoc(collection(db, 'contests'), contestData);
    revalidatePath('/contests'); // For the contests list page
    revalidatePath('/'); // For dashboard upcoming contests count
    return {
      success: true,
      message: 'Contest added successfully!',
    };
  } catch (e) {
    let errorMessage = 'Failed to add contest to Firestore.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error("[addContestAction] Error adding contest to Firestore: ", e);
    return {
      success: false,
      message: 'Error adding contest.',
      error: errorMessage,
    };
  }
}

export async function getContestsAction(userId: string | null | undefined): Promise<ContestDocumentClient[]> {
  if (!userId) {
    console.log("[getContestsAction] No userId provided, returning empty array.");
    return [];
  }
  console.log(`[getContestsAction] Fetching contests for userId: ${userId}`);
  try {
    const contestsCollection = collection(db, 'contests');
    const q = query(
      contestsCollection, 
      where('userId', '==', userId),
      orderBy('date', 'desc') // This ordering requires a composite index
    );
    console.log(`[getContestsAction] Constructed Firestore query for contests (user "${userId}"):`, JSON.stringify({
      collection: 'contests',
      filters: [{ field: 'userId', op: '==', value: userId }],
      orderBy: [{ field: 'date', direction: 'desc' }]
    }, null, 2));

    const querySnapshot = await getDocs(q);
    console.log(`[getContestsAction] Firestore query executed. Found ${querySnapshot.size} contests for userId: ${userId}.`);

    const contests = querySnapshot.docs.map(doc => {
      const data = doc.data() as DocumentData; 
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
    console.log(`[getContestsAction] Successfully mapped ${contests.length} contests.`);
    return contests;

  } catch (error) {
    console.error(`[getContestsAction] Error fetching contests for user ${userId}:`, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`!!! FIRESTORE INDEX REQUIRED for 'contests' collection for Contest Page !!!`);
      console.error(`Query involved: where('userId', '==', '${userId}'), orderBy('date', 'desc')`);
      console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'contests' collection with fields:`);
      console.error(`  - userId (Ascending)`);
      console.error(`  - date (Descending)`);
      console.error(`The error message usually provides a direct link to create it in the Firebase console. Check the full error message below:`);
      console.error(error.message);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return []; // Return empty array on error
  }
}

export async function getUpcomingContestsCountAction(userId: string | null | undefined): Promise<number> {
  if (!userId) return 0;
  console.log(`[getUpcomingContestsCountAction] Fetching upcoming contests count for userId: ${userId}`);
  try {
    const contestsCollection = collection(db, "contests");
    const today = new Date();
    today.setHours(0,0,0,0); 
    const todayTimestamp = Timestamp.fromDate(today);

    const q = query(
      contestsCollection, 
      where("userId", "==", userId),
      where("date", ">=", todayTimestamp) // This query also requires an index
    );
     console.log(`[getUpcomingContestsCountAction] Constructed Firestore query for upcoming contests (user "${userId}"):`, JSON.stringify({
      collection: 'contests',
      filters: [
        { field: 'userId', op: '==', value: userId },
        { field: 'date', op: '>=', value: todayTimestamp.toDate().toISOString() }
      ]
    }, null, 2));
    const querySnapshot = await getDocs(q);
    console.log(`[getUpcomingContestsCountAction] Firestore query executed. Found ${querySnapshot.size} upcoming contests for userId: ${userId}.`);
    return querySnapshot.size;
  } catch (error) {
    console.error("[getUpcomingContestsCountAction] Error fetching upcoming contests count:", error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`!!! FIRESTORE INDEX REQUIRED for 'contests' collection for upcoming contests count (Dashboard) !!!`);
      console.error(`Query involved: where('userId', '==', '${userId}'), where('date', '>=', today)`);
      console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'contests' collection with fields:`);
      console.error(`  - userId (Ascending)`);
      console.error(`  - date (Ascending)`);
      console.error(`The error message usually provides a direct link. Check the full error message below:`);
      console.error(error.message);
      console.error(`--------------------------------------------------------------------------------`);
    }
    return 0;
  }
}
