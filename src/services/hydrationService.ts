import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { getTodayKey } from "../firebase/firestoreHelpers";
import { HydrationLogSource } from "../firebase/firestoreTypes";

type WaterInput = {
  uid: string;
  amountMl: number;
  source?: HydrationLogSource;
};

export type HydrationHistoryItem = {
  amountMl: number;
  time: string;
};

function validateWaterInput({ uid, amountMl }: WaterInput) {
  if (!uid) throw new Error("User not found");
  if (!amountMl || amountMl <= 0) {
    throw new Error("Water amount must be greater than 0");
  }
}

function getLogId(uid: string, todayKey: string) {
  return `${uid}_${todayKey}_${Date.now()}`;
}

function formatLogTime(value: unknown) {
  if (!value) return "--";

  const date =
    typeof value === "string"
      ? new Date(value)
      : value && typeof value === "object" && "toDate" in value
      ? (value as { toDate: () => Date }).toDate()
      : null;

  if (!date || Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function addWaterLog({
  uid,
  amountMl,
  source = "quick_add",
}: WaterInput) {
  validateWaterInput({ uid, amountMl, source });

  const todayKey = getTodayKey();
  const now = new Date().toISOString();

  const logId = getLogId(uid, todayKey);
  const dailyStatsId = `${uid}_${todayKey}`;

  const hydrationLogRef = doc(db, COLLECTIONS.hydrationLogs, logId);
  const dailyStatsRef = doc(db, COLLECTIONS.dailyStats, dailyStatsId);

  await setDoc(hydrationLogRef, {
    uid,
    dateKey: todayKey,
    amountMl,
    source,
    device: "web",
    loggedAt: now,
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const dailyStatsSnap = await getDoc(dailyStatsRef);

  if (dailyStatsSnap.exists()) {
    await updateDoc(dailyStatsRef, {
      waterMl: increment(amountMl),
      updatedAt: serverTimestamp(),
    });

    return;
  }

  await setDoc(dailyStatsRef, {
    uid,
    dateKey: todayKey,
    waterMl: amountMl,
    sleepMinutes: 0,
    yogaMinutes: 0,
    musicMinutes: 0,
    isDeleted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function removeWaterLog({
  uid,
  amountMl,
  source = "manual",
}: WaterInput) {
  validateWaterInput({ uid, amountMl, source });

  const todayKey = getTodayKey();
  const now = new Date().toISOString();

  const logId = getLogId(uid, todayKey);
  const dailyStatsId = `${uid}_${todayKey}`;

  const hydrationLogRef = doc(db, COLLECTIONS.hydrationLogs, logId);
  const dailyStatsRef = doc(db, COLLECTIONS.dailyStats, dailyStatsId);

  await runTransaction(db, async (transaction) => {
    const dailyStatsSnap = await transaction.get(dailyStatsRef);

    const currentWater = dailyStatsSnap.exists()
      ? Number(dailyStatsSnap.data().waterMl || 0)
      : 0;

    const newWater = Math.max(currentWater - amountMl, 0);
    const actualRemoved = currentWater - newWater;

    if (actualRemoved <= 0) return;

    transaction.set(hydrationLogRef, {
      uid,
      dateKey: todayKey,
      amountMl: -actualRemoved,
      source,
      device: "web",
      loggedAt: now,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (dailyStatsSnap.exists()) {
      transaction.update(dailyStatsRef, {
        waterMl: newWater,
        updatedAt: serverTimestamp(),
      });
    }
  });
}

export async function getTodayHydrationHistory(
  uid: string
): Promise<HydrationHistoryItem[]> {
  const todayKey = getTodayKey();

  const logsRef = collection(db, COLLECTIONS.hydrationLogs);

  const logsQuery = query(
    logsRef,
    where("uid", "==", uid),
    where("dateKey", "==", todayKey)
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const loggedAt = data.loggedAt || data.createdAt || "";

      return {
        amountMl: Number(data.amountMl || 0),
        time: formatLogTime(loggedAt),
        loggedAt,
      };
    })
    .sort((a, b) => {
      const aTime =
        typeof a.loggedAt === "string"
          ? new Date(a.loggedAt).getTime()
          : a.loggedAt?.toDate?.().getTime?.() || 0;

      const bTime =
        typeof b.loggedAt === "string"
          ? new Date(b.loggedAt).getTime()
          : b.loggedAt?.toDate?.().getTime?.() || 0;

      return bTime - aTime;
    })
    .map(({ amountMl, time }) => ({
      amountMl,
      time,
    }));
}