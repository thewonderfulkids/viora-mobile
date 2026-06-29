import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import {
  GoalDoc,
  GoalInput,
  HabitCompletionDoc,
  HabitDoc,
  HabitInput,
} from "../types/goalsHabits";

function nowIso() {
  return new Date().toISOString();
}

function createId(collectionName: string) {
  return doc(collection(db, collectionName)).id;
}

function toGoal(id: string, data: any): GoalDoc {
  return {
    id,
    userId: String(data.userId || ""),
    title: String(data.title || "Untitled Goal"),
    description: String(data.description || ""),
    category: data.category || "general",
    targetValue: Number(data.targetValue || 0),
    currentValue: Number(data.currentValue || 0),
    unit: data.unit || "custom",
    targetDate: String(data.targetDate || ""),
    status: data.status || "active",
    source: data.source || "manual",
    premiumOnly: data.premiumOnly === true,
    familyAccountReady: data.familyAccountReady !== false,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    archivedAt: data.archivedAt || null,
    completedAt: data.completedAt || null,
    isDeleted: data.isDeleted === true,
  };
}

function toHabit(id: string, data: any): HabitDoc {
  return {
    id,
    userId: String(data.userId || ""),
    title: String(data.title || "Untitled Habit"),
    description: String(data.description || ""),
    category: data.category || "general",
    frequency: data.frequency || "daily",
    targetPerPeriod: Number(data.targetPerPeriod || 1),
    reminderTime: data.reminderTime || null,
    status: data.status || "active",
    source: data.source || "manual",
    streak: Number(data.streak || 0),
    bestStreak: Number(data.bestStreak || 0),
    lastCompletedDate: data.lastCompletedDate || null,
    premiumOnly: data.premiumOnly === true,
    familyAccountReady: data.familyAccountReady !== false,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    archivedAt: data.archivedAt || null,
    isDeleted: data.isDeleted === true,
  };
}

function toCompletion(id: string, data: any): HabitCompletionDoc {
  return {
    id,
    userId: String(data.userId || ""),
    habitId: String(data.habitId || ""),
    dateKey: String(data.dateKey || ""),
    status: data.status || "completed",
    completedAt: String(data.completedAt || nowIso()),
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

export async function getGoalsByUser(userId: string, maxResults = 50): Promise<GoalDoc[]> {
  if (!userId) return [];

  const goalsQuery = query(
    collection(db, COLLECTIONS.wellnessGoals),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 100))
  );

  const snapshot = await getDocs(goalsQuery);
  return snapshot.docs.map((item) => toGoal(item.id, item.data()));
}

export async function saveGoal(input: GoalInput): Promise<GoalDoc> {
  if (!input.userId) throw new Error("User is required to save goal.");
  if (!input.title.trim()) throw new Error("Goal title is required.");

  const timestamp = nowIso();
  const id = createId(COLLECTIONS.wellnessGoals);
  const payload: GoalDoc = {
    id,
    userId: input.userId,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    category: input.category,
    targetValue: Math.max(Number(input.targetValue || 0), 0),
    currentValue: Math.max(Number(input.currentValue || 0), 0),
    unit: input.unit,
    targetDate: input.targetDate,
    status: "active",
    source: input.source || "manual",
    premiumOnly: false,
    familyAccountReady: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    archivedAt: null,
    completedAt: null,
    isDeleted: false,
  };

  await setDoc(doc(db, COLLECTIONS.wellnessGoals, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function updateGoalProgress(goal: GoalDoc, nextValue: number): Promise<void> {
  const timestamp = nowIso();
  const safeValue = Math.max(Number(nextValue || 0), 0);
  const isComplete = goal.targetValue > 0 && safeValue >= goal.targetValue;

  await updateDoc(doc(db, COLLECTIONS.wellnessGoals, goal.id), {
    currentValue: safeValue,
    status: isComplete ? "completed" : "active",
    completedAt: isComplete ? timestamp : null,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function archiveGoal(goalId: string): Promise<void> {
  const timestamp = nowIso();

  await updateDoc(doc(db, COLLECTIONS.wellnessGoals, goalId), {
    status: "archived",
    archivedAt: timestamp,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function deleteGoal(goalId: string): Promise<void> {
  const timestamp = nowIso();

  await updateDoc(doc(db, COLLECTIONS.wellnessGoals, goalId), {
    isDeleted: true,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function getHabitsByUser(userId: string, maxResults = 50): Promise<HabitDoc[]> {
  if (!userId) return [];

  const habitsQuery = query(
    collection(db, COLLECTIONS.wellnessHabits),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 100))
  );

  const snapshot = await getDocs(habitsQuery);
  return snapshot.docs.map((item) => toHabit(item.id, item.data()));
}

export async function saveHabit(input: HabitInput): Promise<HabitDoc> {
  if (!input.userId) throw new Error("User is required to save habit.");
  if (!input.title.trim()) throw new Error("Habit title is required.");

  const timestamp = nowIso();
  const id = createId(COLLECTIONS.wellnessHabits);
  const payload: HabitDoc = {
    id,
    userId: input.userId,
    title: input.title.trim(),
    description: input.description?.trim() || "",
    category: input.category,
    frequency: input.frequency,
    targetPerPeriod: Math.max(Number(input.targetPerPeriod || 1), 1),
    reminderTime: input.reminderTime || null,
    status: "active",
    source: input.source || "manual",
    streak: 0,
    bestStreak: 0,
    lastCompletedDate: null,
    premiumOnly: false,
    familyAccountReady: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    archivedAt: null,
    isDeleted: false,
  };

  await setDoc(doc(db, COLLECTIONS.wellnessHabits, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function archiveHabit(habitId: string): Promise<void> {
  const timestamp = nowIso();

  await updateDoc(doc(db, COLLECTIONS.wellnessHabits, habitId), {
    status: "archived",
    archivedAt: timestamp,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function deleteHabit(habitId: string): Promise<void> {
  const timestamp = nowIso();

  await updateDoc(doc(db, COLLECTIONS.wellnessHabits, habitId), {
    isDeleted: true,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function getHabitCompletionsByUser({
  userId,
  startDateKey,
  maxResults = 200,
}: {
  userId: string;
  startDateKey: string;
  maxResults?: number;
}): Promise<HabitCompletionDoc[]> {
  if (!userId) return [];

  const completionsQuery = query(
    collection(db, COLLECTIONS.habitCompletions),
    where("userId", "==", userId),
    where("dateKey", ">=", startDateKey),
    where("isDeleted", "==", false),
    orderBy("dateKey", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 300))
  );

  const snapshot = await getDocs(completionsQuery);
  return snapshot.docs.map((item) => toCompletion(item.id, item.data()));
}

export async function completeHabitForDate({
  habit,
  dateKey,
}: {
  habit: HabitDoc;
  dateKey: string;
}): Promise<HabitCompletionDoc> {
  const timestamp = nowIso();
  const completionId = `${habit.userId}_${habit.id}_${dateKey}`;
  const payload: HabitCompletionDoc = {
    id: completionId,
    userId: habit.userId,
    habitId: habit.id,
    dateKey,
    status: "completed",
    completedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  const nextStreak = habit.lastCompletedDate === dateKey ? habit.streak : habit.streak + 1;
  const nextBestStreak = Math.max(habit.bestStreak, nextStreak);

  await Promise.all([
    setDoc(doc(db, COLLECTIONS.habitCompletions, completionId), {
      ...payload,
      serverUpdatedAt: serverTimestamp(),
    }, { merge: true }),
    updateDoc(doc(db, COLLECTIONS.wellnessHabits, habit.id), {
      streak: nextStreak,
      bestStreak: nextBestStreak,
      lastCompletedDate: dateKey,
      updatedAt: timestamp,
      serverUpdatedAt: serverTimestamp(),
    }),
  ]);

  return payload;
}

export async function removeHabitCompletion({
  habit,
  dateKey,
}: {
  habit: HabitDoc;
  dateKey: string;
}): Promise<void> {
  const timestamp = nowIso();
  const completionId = `${habit.userId}_${habit.id}_${dateKey}`;
  const nextStreak = Math.max(habit.streak - 1, 0);

  await Promise.all([
    updateDoc(doc(db, COLLECTIONS.habitCompletions, completionId), {
      isDeleted: true,
      updatedAt: timestamp,
      serverUpdatedAt: serverTimestamp(),
    }),
    updateDoc(doc(db, COLLECTIONS.wellnessHabits, habit.id), {
      streak: nextStreak,
      lastCompletedDate: habit.lastCompletedDate === dateKey ? null : habit.lastCompletedDate || null,
      updatedAt: timestamp,
      serverUpdatedAt: serverTimestamp(),
    }),
  ]);
}
