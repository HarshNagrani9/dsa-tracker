
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format, subDays, isSameDay, parseISO } from 'date-fns';
import type { StreakData } from '@/lib/types';

const STREAK_COLLECTION_NAME = 'userProfile';
const STREAK_DOC_ID = 'globalStreakData'; // Unique ID for the single streak document

export async function getStreakDataAction(): Promise<StreakData> {
  const streakDocRef = doc(db, STREAK_COLLECTION_NAME, STREAK_DOC_ID);
  const streakDocSnap = await getDoc(streakDocRef);

  if (!streakDocSnap.exists()) {
    return { currentStreak: 0, maxStreak: 0, lastActivityDate: '' };
  }
  const data = streakDocSnap.data();
  return {
    currentStreak: data.currentStreak || 0,
    maxStreak: data.maxStreak || 0,
    lastActivityDate: data.lastActivityDate || '',
  };
}

export async function updateStreakOnActivityAction(): Promise<StreakData> {
  const streakDocRef = doc(db, STREAK_COLLECTION_NAME, STREAK_DOC_ID);
  const streakDocSnap = await getDoc(streakDocRef);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  let currentData: StreakData;

  if (!streakDocSnap.exists()) {
    currentData = { currentStreak: 0, maxStreak: 0, lastActivityDate: '' };
  } else {
    const data = streakDocSnap.data();
    currentData = {
      currentStreak: data.currentStreak || 0,
      maxStreak: data.maxStreak || 0,
      lastActivityDate: data.lastActivityDate || '',
    };
  }

  if (currentData.lastActivityDate === todayStr) {
    // Activity already recorded for today. If the document didn't exist initially,
    // it means this is the first activity ever, and it's today.
    // Ensure the document exists with at least a 1-day streak if it was the very first activity.
    if (!streakDocSnap.exists() && currentData.currentStreak === 0) {
         const initialStreakData: StreakData = {
            currentStreak: 1,
            maxStreak: 1,
            lastActivityDate: todayStr,
        };
        await setDoc(streakDocRef, initialStreakData);
        return initialStreakData;
    }
    return currentData; // No change to streak numbers if activity already logged today
  }

  let newCurrentStreak = currentData.currentStreak;
  let newMaxStreak = currentData.maxStreak;

  if (currentData.lastActivityDate) {
    const lastActivityDateObj = parseISO(currentData.lastActivityDate);
    const yesterday = subDays(today, 1);

    if (isSameDay(lastActivityDateObj, yesterday)) {
      newCurrentStreak += 1;
    } else {
      // Not yesterday, so streak is broken or it's a new start after a gap
      newCurrentStreak = 1;
    }
  } else {
    // No last activity date, so this is the first ever activity
    newCurrentStreak = 1;
  }

  newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);

  const updatedData: StreakData = {
    currentStreak: newCurrentStreak,
    maxStreak: newMaxStreak,
    lastActivityDate: todayStr,
  };

  await setDoc(streakDocRef, updatedData); // This will create the document if it doesn't exist, or overwrite it
  return updatedData;
}
