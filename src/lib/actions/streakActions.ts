
'use server';

import { doc, getDoc, setDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import type { StreakData, StreakDataFirestore } from '@/lib/types';

const STREAK_COLLECTION_NAME = 'userProfile'; // Collection name

export async function getStreakDataAction(userId: string | null | undefined): Promise<StreakData> {
  if (!userId) {
    return { currentStreak: 0, maxStreak: 0, lastActivityDate: '' };
  }
  const streakDocRef = doc(db, STREAK_COLLECTION_NAME, userId); // Use userId as document ID
  const streakDocSnap = await getDoc(streakDocRef);

  if (!streakDocSnap.exists()) {
    return { currentStreak: 0, maxStreak: 0, lastActivityDate: '' };
  }
  const data = streakDocSnap.data() as DocumentData;
  return {
    currentStreak: data.currentStreak || 0,
    maxStreak: data.maxStreak || 0,
    lastActivityDate: data.lastActivityDate || '',
  };
}

export async function updateStreakOnActivityAction(userId: string | null | undefined): Promise<StreakData> {
  if (!userId) {
    // Should not happen if called after successful auth an action
    console.error("updateStreakOnActivityAction called without userId");
    return { currentStreak: 0, maxStreak: 0, lastActivityDate: '' };
  }
  const streakDocRef = doc(db, STREAK_COLLECTION_NAME, userId);
  const streakDocSnap = await getDoc(streakDocRef);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  let currentData: StreakData;

  if (!streakDocSnap.exists()) {
    currentData = { currentStreak: 0, maxStreak: 0, lastActivityDate: '' };
  } else {
    const data = streakDocSnap.data() as DocumentData;
    currentData = {
      currentStreak: data.currentStreak || 0,
      maxStreak: data.maxStreak || 0,
      lastActivityDate: data.lastActivityDate || '',
    };
  }

  if (currentData.lastActivityDate === todayStr) {
    if (!streakDocSnap.exists() && currentData.currentStreak === 0) {
         const initialStreakData: StreakDataFirestore = { // Type for Firestore document
            currentStreak: 1,
            maxStreak: 1,
            lastActivityDate: todayStr,
        };
        await setDoc(streakDocRef, initialStreakData);
        return initialStreakData; // Return as StreakData
    }
    return currentData; 
  }

  let newCurrentStreak = currentData.currentStreak;
  let newMaxStreak = currentData.maxStreak;

  if (currentData.lastActivityDate) {
    try {
      const lastActivityDateObj = parseISO(currentData.lastActivityDate);
      const yesterday = subDays(today, 1);

      if (isSameDay(lastActivityDateObj, yesterday)) {
        newCurrentStreak += 1;
      } else {
        newCurrentStreak = 1;
      }
    } catch (e) {
      // If lastActivityDate is somehow invalid, reset streak
      console.error("Error parsing lastActivityDate for streak:", currentData.lastActivityDate, e);
      newCurrentStreak = 1;
    }
  } else {
    newCurrentStreak = 1;
  }

  newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);

  const updatedDataForFirestore: StreakDataFirestore = {
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    lastActivityDate: todayStr,
  };

  await setDoc(streakDocRef, updatedDataForFirestore); 
  
  const clientData: StreakData = { // Ensure returned type matches client expectation
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    lastActivityDate: todayStr,
  };
  return clientData;
}
