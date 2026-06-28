import {
    collection,
    doc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { getTodayKey } from "../firebase/firestoreHelpers";
import { SleepLogSource, SleepQuality } from "../firebase/firestoreTypes";

type AddSleepInput = {
  uid: string;
  sleepStart: string;
  sleepEnd: string;
  quality: SleepQuality;
  source?: SleepLogSource;
};

export type SleepHistoryItem = {
  durationMinutes: number;
  quality: SleepQuality;
  time: string;
};

function getLogId(uid: string, todayKey: string) {
  return `${uid}_${todayKey}_${Date.now()}`;
}

function calculateDurationMinutes(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid sleep time");
  }

  let duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  if (duration < 0) {
    duration += 24 * 60;
  }

  return duration;
}

function formatLogTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function addSleepLog({
  uid,
  sleepStart,
  sleepEnd,
  quality,
  source = "manual",
}: AddSleepInput) {
  if (!uid) throw new Error("User not found");

  const durationMinutes = calculateDurationMinutes(sleepStart, sleepEnd);
  const todayKey = getTodayKey();
  const now = new Date().toISOString();

  const logId = getLogId(uid, todayKey);
  const dailyStatsId = `${uid}_${todayKey}`;

  const sleepLogRef = doc(db, COLLECTIONS.sleepLogs, logId);
  const dailyStatsRef = doc(db, COLLECTIONS.dailyStats, dailyStatsId);

  await runTransaction(db, async (transaction) => {
    const dailyStatsSnap = await transaction.get(dailyStatsRef);

    transaction.set(sleepLogRef, {
        uid,
        dateKey: todayKey,
        sleepStart,
        sleepEnd,
        durationMinutes,
        quality,
        source,
        device: "web",
        loggedAt: now,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    if (dailyStatsSnap.exists()) {
        transaction.update(dailyStatsRef, {
        sleepMinutes: durationMinutes,
        updatedAt: serverTimestamp(),
        });
    } else {
        transaction.set(dailyStatsRef, {
        uid,
        dateKey: todayKey,
        waterMl: 0,
        sleepMinutes: durationMinutes,
        yogaMinutes: 0,
        musicMinutes: 0,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        });
    }
  });
}

export async function getTodaySleepHistory(
  uid: string
): Promise<SleepHistoryItem[]> {
  const todayKey = getTodayKey();

  const logsRef = collection(db, COLLECTIONS.sleepLogs);

  const logsQuery = query(
    logsRef,
    where("uid", "==", uid),
    where("dateKey", "==", todayKey)
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const loggedAt = String(data.loggedAt || "");

      return {
        durationMinutes: Number(data.durationMinutes || 0),
        quality: data.quality as SleepQuality,
        time: formatLogTime(loggedAt),
        loggedAt,
      };
    })
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .map(({ durationMinutes, quality, time }) => ({
      durationMinutes,
      quality,
      time,
    }));
}