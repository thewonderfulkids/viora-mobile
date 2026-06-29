import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { DailyStatsDoc } from "../firebase/firestoreTypes";
import {
  WellnessIntelligenceDashboard,
  WellnessIntelligenceSnapshot,
} from "../types/wellnessIntelligence";

function nowIso() {
  return new Date().toISOString();
}

function toDailyStats(data: any): DailyStatsDoc {
  return {
    uid: String(data.uid || ""),
    dateKey: String(data.dateKey || ""),
    waterMl: Number(data.waterMl || 0),
    sleepMinutes: Number(data.sleepMinutes || 0),
    yogaMinutes: Number(data.yogaMinutes || 0),
    musicMinutes: Number(data.musicMinutes || 0),
    isDeleted: data.isDeleted === true,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
  };
}

function toSnapshot(id: string, data: any): WellnessIntelligenceSnapshot {
  return {
    id,
    userId: String(data.userId || ""),
    dateKey: String(data.dateKey || ""),
    dailyWellnessIndex: Number(data.dailyWellnessIndex || 0),
    weeklyAverageScore: Number(data.weeklyAverageScore || 0),
    consistencyScore: Number(data.consistencyScore || 0),
    riskLevel: data.riskLevel || "low",
    primaryFocus: data.primaryFocus || "balanced_routine",
    summary: String(data.summary || ""),
    generatedAt: String(data.generatedAt || nowIso()),
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
  };
}

export async function getRecentDailyStats({
  userId,
  maxResults = 14,
}: {
  userId: string;
  maxResults?: number;
}): Promise<DailyStatsDoc[]> {
  if (!userId) return [];

  const safeLimit = Math.min(Math.max(maxResults, 1), 30);

  const q = query(
    collection(db, COLLECTIONS.dailyStats),
    where("uid", "==", userId),
    where("isDeleted", "==", false),
    orderBy("dateKey", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => toDailyStats(item.data()));
}

export async function saveWellnessIntelligenceSnapshot({
  userId,
  dateKey,
  dashboard,
}: {
  userId: string;
  dateKey: string;
  dashboard: WellnessIntelligenceDashboard;
}): Promise<WellnessIntelligenceSnapshot> {
  if (!userId) throw new Error("User is required to save wellness intelligence.");
  if (!dateKey) throw new Error("Date key is required to save wellness intelligence.");

  const timestamp = nowIso();
  const id = `${userId}_${dateKey}`;
  const ref = doc(db, COLLECTIONS.wellnessIntelligenceSnapshots, id);

  const payload = {
    userId,
    dateKey,
    dailyWellnessIndex: dashboard.dailyWellnessIndex,
    weeklyAverageScore: dashboard.weeklyAverageScore,
    consistencyScore: dashboard.consistencyScore,
    riskLevel: dashboard.riskLevel,
    primaryFocus: dashboard.primaryFocus,
    summary: dashboard.summary,
    generatedAt: dashboard.generatedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  };

  await setDoc(ref, payload, { merge: true });

  return toSnapshot(id, payload);
}

export async function getRecentWellnessIntelligenceSnapshots({
  userId,
  maxResults = 7,
}: {
  userId: string;
  maxResults?: number;
}): Promise<WellnessIntelligenceSnapshot[]> {
  if (!userId) return [];

  const q = query(
    collection(db, COLLECTIONS.wellnessIntelligenceSnapshots),
    where("userId", "==", userId),
    orderBy("dateKey", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 30))
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => toSnapshot(item.id, item.data()));
}
