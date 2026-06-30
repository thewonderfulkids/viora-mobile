import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import {
  CopingAction,
  MentalWellnessSummaryDoc,
  MoodEntryDoc,
  MoodEntryInput,
  MoodEmotion,
  MoodLevel,
  MoodTrigger,
} from "../types";

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createId(collectionName: string) {
  return doc(collection(db, collectionName)).id;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number(value || 0), min), max);
}

function validMoodLevel(value: unknown): MoodLevel {
  const next = Math.round(clamp(Number(value || 3), 1, 5)) as MoodLevel;
  return next;
}

function cleanStringArray<T extends string>(value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean) as T[];
}

function buildReflection(input: MoodEntryInput) {
  const emotions = input.emotions.length > 0 ? input.emotions.join(", ") : "mixed";
  const triggers = input.triggers.length > 0 ? input.triggers.join(", ") : "unclear triggers";

  if (input.stressLevel >= 8) {
    return `High stress detected with ${emotions}. Viora recommends one short reset before the next demanding task.`;
  }

  if (input.moodLevel >= 4 && input.energyLevel >= 7) {
    return `Positive mood and energy detected. Protect this rhythm with hydration, steady meals and a calm evening routine.`;
  }

  if (input.energyLevel <= 3) {
    return `Low energy is visible today. Sleep, food timing or ${triggers} may be influencing your mental wellness.`;
  }

  return `Mood check-in saved. Viora will connect ${emotions} with your sleep, nutrition, habits and wellness intelligence.`;
}

function toEntry(id: string, data: any): MoodEntryDoc {
  return {
    id,
    userId: String(data.userId || ""),
    dateKey: String(data.dateKey || todayKey()),
    moodLevel: validMoodLevel(data.moodLevel),
    stressLevel: clamp(Number(data.stressLevel || 0), 0, 10),
    energyLevel: clamp(Number(data.energyLevel || 0), 0, 10),
    sleepImpact: clamp(Number(data.sleepImpact || 0), 0, 10),
    emotions: cleanStringArray<MoodEmotion>(data.emotions),
    triggers: cleanStringArray<MoodTrigger>(data.triggers),
    copingActions: cleanStringArray<CopingAction>(data.copingActions),
    note: String(data.note || ""),
    aiReflection: String(data.aiReflection || ""),
    source: data.source || "manual",
    premiumOnly: data.premiumOnly === true,
    familyAccountReady: data.familyAccountReady !== false,
    voiceReady: data.voiceReady !== false,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

export function createEmptyMentalSummary(userId: string, dateKey = todayKey()): MentalWellnessSummaryDoc {
  const timestamp = nowIso();

  return {
    id: `${userId}_${dateKey}`,
    userId,
    dateKey,
    moodScore: 0,
    stressScore: 0,
    energyScore: 0,
    emotionalBalanceScore: 0,
    checkInStreak: 0,
    riskLevel: "medium",
    dominantEmotion: "unknown",
    dominantTrigger: "unknown",
    aiSummary: "Start with one honest mood check-in. Viora will connect your mental wellness with sleep, nutrition, habits and AI coaching.",
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };
}

function toSummary(id: string, data: any): MentalWellnessSummaryDoc {
  return {
    id,
    userId: String(data.userId || ""),
    dateKey: String(data.dateKey || todayKey()),
    moodScore: clamp(Number(data.moodScore || 0), 0, 100),
    stressScore: clamp(Number(data.stressScore || 0), 0, 100),
    energyScore: clamp(Number(data.energyScore || 0), 0, 100),
    emotionalBalanceScore: clamp(Number(data.emotionalBalanceScore || 0), 0, 100),
    checkInStreak: Math.max(Number(data.checkInStreak || 0), 0),
    riskLevel: data.riskLevel || "medium",
    dominantEmotion: data.dominantEmotion || "unknown",
    dominantTrigger: data.dominantTrigger || "unknown",
    aiSummary: String(data.aiSummary || ""),
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

export async function getMoodEntriesByUser(userId: string, maxResults = 40): Promise<MoodEntryDoc[]> {
  if (!userId) return [];

  const moodQuery = query(
    collection(db, COLLECTIONS.moodEntries),
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(moodQuery);
  return snapshot.docs
    .map((item) => toEntry(item.id, item.data()))
    .filter((item) => !item.isDeleted)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, Math.min(Math.max(maxResults, 1), 100));
}

export async function saveMoodEntry(input: MoodEntryInput): Promise<MoodEntryDoc> {
  if (!input.userId) throw new Error("User is required to save mood check-in.");

  const timestamp = nowIso();
  const id = createId(COLLECTIONS.moodEntries);
  const payload: MoodEntryDoc = {
    id,
    userId: input.userId,
    dateKey: input.dateKey || todayKey(),
    moodLevel: validMoodLevel(input.moodLevel),
    stressLevel: clamp(input.stressLevel, 0, 10),
    energyLevel: clamp(input.energyLevel, 0, 10),
    sleepImpact: clamp(input.sleepImpact, 0, 10),
    emotions: input.emotions,
    triggers: input.triggers,
    copingActions: input.copingActions,
    note: input.note?.trim() || "",
    aiReflection: buildReflection(input),
    source: input.source || "manual",
    premiumOnly: false,
    familyAccountReady: true,
    voiceReady: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  await setDoc(doc(db, COLLECTIONS.moodEntries, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function deleteMoodEntry(entryId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.moodEntries, entryId), {
    isDeleted: true,
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function getMentalSummary(userId: string, dateKey = todayKey()): Promise<MentalWellnessSummaryDoc | null> {
  if (!userId) return null;
  const id = `${userId}_${dateKey}`;
  const snapshot = await getDoc(doc(db, COLLECTIONS.mentalWellnessSummaries, id));
  if (!snapshot.exists()) return null;
  const summary = toSummary(snapshot.id, snapshot.data());
  return summary.isDeleted ? null : summary;
}

export async function saveMentalSummary(summary: MentalWellnessSummaryDoc): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.mentalWellnessSummaries, summary.id), {
    ...summary,
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}
