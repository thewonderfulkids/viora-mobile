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
  FoodNutrition,
  NutritionEntryDoc,
  NutritionEntryInput,
  NutritionFoodItem,
  NutritionFoodItemInput,
  NutritionGoalDoc,
  NutritionSummaryDoc,
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

function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanNumber(value: unknown) {
  return Math.max(numberValue(value), 0);
}

function roundNutrition(value: number, key: keyof FoodNutrition) {
  if (key === "calories" || key === "sodium") return Math.round(value);
  return Number(value.toFixed(1));
}

function normalizeFoodItem(item: NutritionFoodItemInput, index: number): NutritionFoodItem {
  return {
    id: item.id || `food_${Date.now()}_${index}`,
    name: String(item.name || "Food item").trim() || "Food item",
    quantity: Math.max(numberValue(item.quantity, 1), 0.1),
    unit: item.unit || "serving",
    servingLabel: String(item.servingLabel || `${item.quantity || 1} ${item.unit || "serving"}`).trim(),
    calories: cleanNumber(item.calories),
    protein: cleanNumber(item.protein),
    carbs: cleanNumber(item.carbs),
    fat: cleanNumber(item.fat),
    fiber: cleanNumber(item.fiber),
    sugar: cleanNumber(item.sugar),
    sodium: cleanNumber(item.sodium),
    source: item.source || "manual",
  };
}

function legacyFoodItem(data: any): NutritionFoodItem {
  return {
    id: "legacy_main_item",
    name: String(data.title || "Meal"),
    quantity: 1,
    unit: "serving",
    servingLabel: String(data.portionSize || "1 serving"),
    calories: cleanNumber(data.calories),
    protein: cleanNumber(data.protein),
    carbs: cleanNumber(data.carbs),
    fat: cleanNumber(data.fat),
    fiber: cleanNumber(data.fiber),
    sugar: cleanNumber(data.sugar),
    sodium: cleanNumber(data.sodium),
    source: data.source || "manual",
  };
}

function totalFromItems(items: NutritionFoodItem[]): FoodNutrition {
  return {
    calories: Math.round(items.reduce((sum, item) => sum + cleanNumber(item.calories), 0)),
    protein: roundNutrition(items.reduce((sum, item) => sum + cleanNumber(item.protein), 0), "protein"),
    carbs: roundNutrition(items.reduce((sum, item) => sum + cleanNumber(item.carbs), 0), "carbs"),
    fat: roundNutrition(items.reduce((sum, item) => sum + cleanNumber(item.fat), 0), "fat"),
    fiber: roundNutrition(items.reduce((sum, item) => sum + cleanNumber(item.fiber), 0), "fiber"),
    sugar: roundNutrition(items.reduce((sum, item) => sum + cleanNumber(item.sugar), 0), "sugar"),
    sodium: Math.round(items.reduce((sum, item) => sum + cleanNumber(item.sodium), 0)),
  };
}

function toEntry(id: string, data: any): NutritionEntryDoc {
  const rawItems = Array.isArray(data.foodItems) && data.foodItems.length > 0 ? data.foodItems : [legacyFoodItem(data)];
  const foodItems = rawItems.map((item: NutritionFoodItemInput, index: number) => normalizeFoodItem(item, index));
  const totals = totalFromItems(foodItems);

  return {
    id,
    userId: String(data.userId || ""),
    mealType: data.mealType || "snack",
    title: String(data.title || "Meal"),
    notes: String(data.notes || ""),
    portionSize: String(data.portionSize || `${foodItems.length} item${foodItems.length === 1 ? "" : "s"}`),
    mealTime: String(data.mealTime || ""),
    dateKey: String(data.dateKey || todayKey()),
    ...totals,
    source: data.source || "manual",
    foodItems,
    premiumOnly: data.premiumOnly === true,
    familyAccountReady: data.familyAccountReady !== false,
    voiceReady: data.voiceReady !== false,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

function toGoal(id: string, data: any): NutritionGoalDoc {
  return {
    id,
    userId: String(data.userId || ""),
    dailyCalories: numberValue(data.dailyCalories, 2000),
    protein: numberValue(data.protein, 75),
    carbs: numberValue(data.carbs, 250),
    fat: numberValue(data.fat, 65),
    fiber: numberValue(data.fiber, 30),
    sugarLimit: numberValue(data.sugarLimit, 40),
    sodiumLimit: numberValue(data.sodiumLimit, 2300),
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

function toSummary(id: string, data: any): NutritionSummaryDoc {
  return {
    id,
    userId: String(data.userId || ""),
    dateKey: String(data.dateKey || todayKey()),
    calories: numberValue(data.calories),
    protein: numberValue(data.protein),
    carbs: numberValue(data.carbs),
    fat: numberValue(data.fat),
    fiber: numberValue(data.fiber),
    sugar: numberValue(data.sugar),
    sodium: numberValue(data.sodium),
    nutritionScore: numberValue(data.nutritionScore),
    mealBalanceScore: numberValue(data.mealBalanceScore),
    healthyEatingStreak: numberValue(data.healthyEatingStreak),
    caloriesRemaining: numberValue(data.caloriesRemaining),
    proteinGap: numberValue(data.proteinGap),
    sugarStatus: data.sugarStatus || "balanced",
    sodiumStatus: data.sodiumStatus || "balanced",
    hydrationCorrelation: data.hydrationCorrelation || "unknown",
    aiSummary: String(data.aiSummary || ""),
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

export async function getNutritionEntriesByUser(
  userId: string,
  maxResults = 80
): Promise<NutritionEntryDoc[]> {
  if (!userId) return [];

  const nutritionQuery = query(
    collection(db, COLLECTIONS.nutritionEntries),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("dateKey", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 120))
  );

  const snapshot = await getDocs(nutritionQuery);
  return snapshot.docs.map((item) => toEntry(item.id, item.data()));
}

export async function getNutritionEntriesForDate(
  userId: string,
  dateKey: string
): Promise<NutritionEntryDoc[]> {
  if (!userId) return [];

  const nutritionQuery = query(
    collection(db, COLLECTIONS.nutritionEntries),
    where("userId", "==", userId),
    where("dateKey", "==", dateKey),
    where("isDeleted", "==", false),
    orderBy("mealTime", "asc"),
    limit(60)
  );

  const snapshot = await getDocs(nutritionQuery);
  return snapshot.docs.map((item) => toEntry(item.id, item.data()));
}

export async function saveNutritionEntry(input: NutritionEntryInput): Promise<NutritionEntryDoc> {
  if (!input.userId) throw new Error("User is required to save nutrition entry.");
  if (!input.foodItems.length) throw new Error("Add at least one food item.");

  const timestamp = nowIso();
  const id = createId(COLLECTIONS.nutritionEntries);
  const foodItems = input.foodItems.map((item, index) => normalizeFoodItem(item, index));
  const totals = totalFromItems(foodItems);
  const title = input.title?.trim() || foodItems.map((item) => item.name).slice(0, 3).join(", ");

  const payload: NutritionEntryDoc = {
    id,
    userId: input.userId,
    mealType: input.mealType,
    title: title || "Meal",
    notes: input.notes?.trim() || "",
    portionSize: input.portionSize?.trim() || `${foodItems.length} item${foodItems.length === 1 ? "" : "s"}`,
    mealTime: input.mealTime || new Date().toISOString(),
    dateKey: input.dateKey || todayKey(),
    ...totals,
    source: input.source || "manual",
    foodItems,
    premiumOnly: false,
    familyAccountReady: true,
    voiceReady: true,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  await setDoc(doc(db, COLLECTIONS.nutritionEntries, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function updateNutritionEntryPortion(
  entry: NutritionEntryDoc,
  multiplier: number
): Promise<void> {
  const safeMultiplier = Math.max(Number(multiplier || 1), 0.25);
  const foodItems = entry.foodItems.map((item) => {
    const updatedQuantity = Math.max(item.quantity * safeMultiplier, 0.1);
    const updatedItem: NutritionFoodItem = {
      ...item,
      quantity: Number(updatedQuantity.toFixed(2)),
      servingLabel: `${Number(updatedQuantity.toFixed(2))} ${item.unit}`,
      calories: Math.round(item.calories * safeMultiplier),
      protein: Number((item.protein * safeMultiplier).toFixed(1)),
      carbs: Number((item.carbs * safeMultiplier).toFixed(1)),
      fat: Number((item.fat * safeMultiplier).toFixed(1)),
      fiber: Number((item.fiber * safeMultiplier).toFixed(1)),
      sugar: Number((item.sugar * safeMultiplier).toFixed(1)),
      sodium: Math.round(item.sodium * safeMultiplier),
    };
    return updatedItem;
  });
  const totals = totalFromItems(foodItems);

  await updateDoc(doc(db, COLLECTIONS.nutritionEntries, entry.id), {
    foodItems,
    ...totals,
    portionSize: `${foodItems.length} item${foodItems.length === 1 ? "" : "s"}`,
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function deleteNutritionEntry(entryId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.nutritionEntries, entryId), {
    isDeleted: true,
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function getNutritionGoal(userId: string): Promise<NutritionGoalDoc | null> {
  if (!userId) return null;

  const goalQuery = query(
    collection(db, COLLECTIONS.nutritionGoals),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(goalQuery);
  const goal = snapshot.docs[0];
  return goal ? toGoal(goal.id, goal.data()) : null;
}

export async function saveNutritionGoal(goal: NutritionGoalDoc): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.nutritionGoals, goal.id), {
    ...goal,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function saveNutritionSummary(summary: NutritionSummaryDoc): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.nutritionSummaries, summary.id), {
    ...summary,
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function getNutritionSummariesByUser(
  userId: string,
  maxResults = 30
): Promise<NutritionSummaryDoc[]> {
  if (!userId) return [];

  const summaryQuery = query(
    collection(db, COLLECTIONS.nutritionSummaries),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("dateKey", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 90))
  );

  const snapshot = await getDocs(summaryQuery);
  return snapshot.docs.map((item) => toSummary(item.id, item.data()));
}
