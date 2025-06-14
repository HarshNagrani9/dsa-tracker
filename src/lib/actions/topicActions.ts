
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
  console.warn(`[parseTimestampToDate] Failed to parse timestamp:`, timestampField, `Returning current date.`);
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
    const topicsCollectionRef = collection(db, 'topics');
    const existingTopicQuery = query(
      topicsCollectionRef,
      where('name', '==', validationResult.data.name),
      where('userId', '==', validationResult.data.userId)
    );
    console.log(`[addTopicAction] Checking for existing topic with name "${validationResult.data.name}" for user "${validationResult.data.userId}"`);
    const existingTopicSnapshot = await getDocs(existingTopicQuery);
    if (!existingTopicSnapshot.empty) {
      console.log(`[addTopicAction] Topic "${validationResult.data.name}" already exists for user "${validationResult.data.userId}".`);
      return {
        success: false,
        message: 'Topic already exists.',
        error: `A topic with the name "${validationResult.data.name}" already exists for this user.`,
      };
    }
    console.log(`[addTopicAction] Topic "${validationResult.data.name}" does not exist for user "${validationResult.data.userId}". Creating new topic.`);
    const topicData = {
      name: validationResult.data.name,
      userId: validationResult.data.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'topics'), topicData);
    console.log(`[addTopicAction] Topic "${validationResult.data.name}" created successfully for user "${validationResult.data.userId}".`);
    
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
    console.error("[addTopicAction] Error adding topic to Firestore: ", e);
    if (e instanceof Error && (e.message.includes("query requires an index") || e.message.includes("needs an index"))) {
       console.error(`--------------------------------------------------------------------------------`);
       console.error(`!!! FIRESTORE INDEX REQUIRED for 'topics' collection for checking existing topic in addTopicAction !!!`);
       console.error(`Query involved: where('name', '==', '${validationResult.data.name}'), where('userId', '==', '${validationResult.data.userId}')`);
       console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'topics' collection with fields:`);
       console.error(`  - name (Ascending)`);
       console.error(`  - userId (Ascending)`);
       console.error(`OR:`);
       console.error(`  - userId (Ascending)`);
       console.error(`  - name (Ascending)`);
       console.error(`The error message usually provides a direct link. Check the full error message below:`);
       console.error(e.message);
       console.error(`--------------------------------------------------------------------------------`);
    }
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
    // TEMPORARILY REMOVED orderBy('name', 'asc') for diagnostics
    const topicsQuery = query(
      topicsCollectionRef, 
      where('userId', '==', userId)
      // orderBy('name', 'asc') // Requires index: userId ASC, name ASC
    );
    console.log(`[getTopicsAction] TEMPORARILY SIMPLIFIED QUERY. Original would be: query(topicsCollectionRef, where('userId', '==', userId), orderBy('name', 'asc'))`);
    console.log(`[getTopicsAction] If data loads now but is unsorted, you NEED an INDEX on 'topics': userId (Ascending), name (Ascending)`);
    
    console.log(`[getTopicsAction] Constructed Firestore query for topics (user "${userId}"):`, JSON.stringify({
      collection: 'topics',
      filters: [{ field: 'userId', op: '==', value: userId }],
      // orderBy: [{ field: 'name', direction: 'asc' }] // Temporarily removed
    }, null, 2));

    const topicsSnapshot = await getDocs(topicsQuery);
    console.log(`[getTopicsAction] Firestore query for topics executed. Found ${topicsSnapshot.size} topics for userId: ${userId}`);

    const topicsData: TopicDocument[] = [];

    for (const topicDoc of topicsSnapshot.docs) {
      const topic = topicDoc.data() as DocumentData;
      const topicName = topic.name;
      let questionCount = 0;
      // TEMPORARILY REMOVING QUESTION COUNT FOR DIAGNOSTICS
      // try {
      //   const questionsQuery = query(
      //     collection(db, "questions"), 
      //     where("topicName", "==", topicName),
      //     where("userId", "==", userId) // Requires index on questions: topicName ASC, userId ASC (or vice-versa)
      //   );
      //   const questionsSnapshot = await getDocs(questionsQuery);
      //   questionCount = questionsSnapshot.size;
      // } catch (qcError) {
      //   console.error(`[getTopicsAction] Error fetching question count for topic "${topicName}", user "${userId}":`, qcError);
      //   if (qcError instanceof Error && (qcError.message.includes("query requires an index") || qcError.message.includes("needs an index"))) {
      //     console.error(`--------------------------------------------------------------------------------`);
      //     console.error(`!!! FIRESTORE INDEX REQUIRED for 'questions' collection for Topic Question Counts !!!`);
      //     console.error(`Query involved: where("topicName", "==", "${topicName}"), where("userId", "==", "${userId}")`);
      //     console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'questions' collection with fields:`);
      //     console.error(`  - topicName (Ascending)`);
      //     console.error(`  - userId (Ascending)`);
      //     console.error(`OR:`);
      //     console.error(`  - userId (Ascending)`);
      //     console.error(`  - topicName (Ascending)`);
      //     console.error(`The error message usually provides a direct link. Check the full error message below:`);
      //     console.error(qcError.message);
      //     console.error(`--------------------------------------------------------------------------------`);
      //   }
      // }
      console.log(`[getTopicsAction] TEMPORARILY SKIPPING question count for topic "${topicName}". If topics load but counts are missing, it indicates an issue/missing index for the question count query.`);

      topicsData.push({
        id: topicDoc.id,
        name: topicName,
        userId: topic.userId,
        createdAt: parseTimestampToDate(topic.createdAt),
        updatedAt: parseTimestampToDate(topic.updatedAt),
        questionCount: questionCount, // Will be 0 due to skipped logic
      });
    }
    console.log(`[getTopicsAction] Successfully mapped ${topicsData.length} topics.`);
    // If topics were not sorted by query, sort them here if needed for UI consistency (though this is less efficient)
    // topicsData.sort((a, b) => a.name.localeCompare(b.name));
    return topicsData;
  } catch (error) {
    console.error(`[getTopicsAction] Error fetching topics for user ${userId}:`, error);
    if (error instanceof Error && (error.message.includes("query requires an index") || error.message.includes("needs an index"))) {
      console.error(`--------------------------------------------------------------------------------`);
      console.error(`!!! FIRESTORE INDEX REQUIRED for 'topics' collection for Topics Page !!!`);
      console.error(`Original query involved: where('userId', '==', '${userId}'), orderBy('name', 'asc')`);
      console.error(`SUGGESTED INDEX: Go to your Firestore console and create an index on the 'topics' collection with fields:`);
      console.error(`  - userId (Ascending)`);
      console.error(`  - name (Ascending)`);
      console.error(`The error message usually provides a direct link. Check the full error message below:`);
      console.error(error.message);
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
        console.warn(`[getTopicByIdAction] User ${userId} not authorized to view topic ${topicId} owned by ${data.userId}. Returning null.`);
        return null; 
      }
      console.log(`[getTopicByIdAction] Found topic "${data.name}" for ID ${topicId}.`);
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
    return null;
  }
}

