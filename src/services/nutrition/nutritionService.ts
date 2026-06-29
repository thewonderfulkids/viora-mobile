import { doc, collection } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { COLLECTIONS } from "../../firebase/firestoreCollections";
import {
  deleteNutritionEntry,
  getNutritionEntriesByUser,
  getNutritionEntriesForDate,
  getNutritionGoal,
  getNutritionSummariesByUser,
  saveNutritionEntry,
  saveNutritionGoal,
  saveNutritionSummary,
  updateNutritionEntryPortion,
} from "../../repositories";
import {
  FoodNutrition,
  FoodPreset,
  MealType,
  NutritionDashboard,
  NutritionEntryDoc,
  NutritionEntryInput,
  NutritionFoodItemInput,
  NutritionGoalDoc,
  NutritionInsight,
  NutritionMealGroup,
  NutritionMetric,
  NutritionSuggestion,
  NutritionSummaryDoc,
  NutritionTimelineItem,
  NutritionTrend,
} from "../../types";

const FOOD_PRESETS: FoodPreset[] = [
  { id: "tea-milk-sugar", name: "Milk Tea with Sugar", defaultQuantity: 150, unit: "ml", servingLabel: "150 ml cup", category: "drink", calories: 85, protein: 2.5, carbs: 13, fat: 2.5, fiber: 0, sugar: 11, sodium: 35 },
  { id: "tea-no-sugar", name: "Tea without Sugar", defaultQuantity: 150, unit: "ml", servingLabel: "150 ml cup", category: "drink", calories: 35, protein: 2, carbs: 4, fat: 1.5, fiber: 0, sugar: 3, sodium: 30 },
  { id: "sugar", name: "Sugar", defaultQuantity: 1, unit: "tsp", servingLabel: "1 tsp", category: "basic", calories: 16, protein: 0, carbs: 4, fat: 0, fiber: 0, sugar: 4, sodium: 0 },
  { id: "bread", name: "Bread", defaultQuantity: 1, unit: "slice", servingLabel: "1 slice", category: "basic", calories: 70, protein: 2.5, carbs: 13, fat: 1, fiber: 1, sugar: 1.5, sodium: 130 },
  { id: "roti", name: "Roti", defaultQuantity: 1, unit: "piece", servingLabel: "1 medium roti", category: "indian", calories: 110, protein: 3.5, carbs: 22, fat: 1.5, fiber: 3, sugar: 1, sodium: 90 },
  { id: "rice", name: "Cooked Rice", defaultQuantity: 1, unit: "bowl", servingLabel: "1 bowl", category: "indian", calories: 200, protein: 4, carbs: 44, fat: 0.5, fiber: 1, sugar: 0, sodium: 5 },
  { id: "dal", name: "Dal", defaultQuantity: 1, unit: "bowl", servingLabel: "1 bowl", category: "indian", calories: 180, protein: 11, carbs: 28, fat: 4, fiber: 7, sugar: 3, sodium: 420 },
  { id: "sabzi", name: "Sabzi", defaultQuantity: 1, unit: "bowl", servingLabel: "1 bowl", category: "indian", calories: 160, protein: 4, carbs: 18, fat: 8, fiber: 6, sugar: 5, sodium: 480 },
  { id: "egg", name: "Boiled Egg", defaultQuantity: 1, unit: "piece", servingLabel: "1 egg", category: "protein", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0, sugar: 0.6, sodium: 62 },
  { id: "banana", name: "Banana", defaultQuantity: 1, unit: "piece", servingLabel: "1 medium banana", category: "snack", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3, sugar: 14, sodium: 1 },
  { id: "poha", name: "Poha", defaultQuantity: 1, unit: "bowl", servingLabel: "1 bowl", category: "indian", calories: 260, protein: 6, carbs: 45, fat: 7, fiber: 4, sugar: 4, sodium: 430 },
  { id: "upma", name: "Upma", defaultQuantity: 1, unit: "bowl", servingLabel: "1 bowl", category: "indian", calories: 280, protein: 7, carbs: 46, fat: 8, fiber: 5, sugar: 3, sodium: 520 },
  { id: "paratha", name: "Paratha", defaultQuantity: 1, unit: "piece", servingLabel: "1 paratha", category: "indian", calories: 260, protein: 6, carbs: 32, fat: 12, fiber: 4, sugar: 2, sodium: 360 },
  { id: "curd", name: "Curd", defaultQuantity: 1, unit: "bowl", servingLabel: "1 bowl", category: "protein", calories: 120, protein: 6, carbs: 9, fat: 6, fiber: 0, sugar: 8, sodium: 90 },
  { id: "paneer", name: "Paneer", defaultQuantity: 100, unit: "gram", servingLabel: "100 gram", category: "protein", calories: 265, protein: 18, carbs: 3, fat: 20, fiber: 0, sugar: 2, sodium: 22 },
  { id: "milk", name: "Milk", defaultQuantity: 200, unit: "ml", servingLabel: "200 ml", category: "drink", calories: 130, protein: 6.5, carbs: 10, fat: 7, fiber: 0, sugar: 10, sodium: 90 },
];

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createLocalId(collectionName: string) {
  return doc(collection(db, collectionName)).id;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function roundMacro(value: number) {
  return Number(value.toFixed(1));
}

function sum(entries: NutritionEntryDoc[], key: keyof FoodNutrition) {
  return entries.reduce((total, entry) => total + Number(entry[key] || 0), 0);
}

function foodItemFromPreset(preset: FoodPreset, multiplier = 1): NutritionFoodItemInput {
  const quantity = Number((preset.defaultQuantity * multiplier).toFixed(2));

  return {
    name: preset.name,
    quantity,
    unit: preset.unit,
    servingLabel: `${quantity} ${preset.unit}`,
    calories: Math.round(preset.calories * multiplier),
    protein: roundMacro(preset.protein * multiplier),
    carbs: roundMacro(preset.carbs * multiplier),
    fat: roundMacro(preset.fat * multiplier),
    fiber: roundMacro(preset.fiber * multiplier),
    sugar: roundMacro(preset.sugar * multiplier),
    sodium: Math.round(preset.sodium * multiplier),
    source: "preset",
  };
}

export function getNutritionFoodPresets(): FoodPreset[] {
  return FOOD_PRESETS;
}

function defaultGoal(userId: string): NutritionGoalDoc {
  const timestamp = nowIso();

  return {
    id: createLocalId(COLLECTIONS.nutritionGoals),
    userId,
    dailyCalories: 2000,
    protein: 75,
    carbs: 250,
    fat: 65,
    fiber: 30,
    sugarLimit: 40,
    sodiumLimit: 2300,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };
}

function buildMealGroups(entries: NutritionEntryDoc[]): NutritionMealGroup[] {
  const mealTitles: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snacks",
  };

  return (["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((mealType) => {
    const mealEntries = entries.filter((entry) => entry.mealType === mealType);

    return {
      mealType,
      title: mealTitles[mealType],
      entries: mealEntries,
      calories: Math.round(sum(mealEntries, "calories")),
      protein: roundMacro(sum(mealEntries, "protein")),
      carbs: roundMacro(sum(mealEntries, "carbs")),
      fat: roundMacro(sum(mealEntries, "fat")),
      fiber: roundMacro(sum(mealEntries, "fiber")),
      sugar: roundMacro(sum(mealEntries, "sugar")),
      sodium: Math.round(sum(mealEntries, "sodium")),
    };
  });
}

function calculateMealBalanceScore(groups: NutritionMealGroup[]) {
  const completedMeals = groups.filter((group) => group.entries.length > 0).length;
  const proteinMeals = groups.filter((group) => group.protein >= 12).length;
  const balancedMeals = groups.filter((group) => group.calories >= 150 && group.protein >= 10).length;

  return clamp(Math.round(completedMeals * 15 + proteinMeals * 12 + balancedMeals * 10), 0, 100);
}

function calculateNutritionScore(entries: NutritionEntryDoc[], goal: NutritionGoalDoc, mealBalanceScore: number) {
  const calories = sum(entries, "calories");
  const protein = sum(entries, "protein");
  const fiber = sum(entries, "fiber");
  const sugar = sum(entries, "sugar");
  const sodium = sum(entries, "sodium");

  const calorieScore = calories > 0 ? 25 - Math.min(Math.abs(goal.dailyCalories - calories) / goal.dailyCalories, 1) * 25 : 0;
  const proteinScore = clamp((protein / goal.protein) * 25, 0, 25);
  const fiberScore = clamp((fiber / goal.fiber) * 15, 0, 15);
  const sugarPenalty = sugar > goal.sugarLimit ? 10 : sugar > goal.sugarLimit * 0.85 ? 5 : 0;
  const sodiumPenalty = sodium > goal.sodiumLimit ? 10 : sodium > goal.sodiumLimit * 0.85 ? 5 : 0;
  const balanceScore = mealBalanceScore * 0.35;

  return clamp(Math.round(calorieScore + proteinScore + fiberScore + balanceScore - sugarPenalty - sodiumPenalty), 0, 100);
}

function buildSummary(
  userId: string,
  dateKey: string,
  entries: NutritionEntryDoc[],
  goal: NutritionGoalDoc,
  historicalSummaries: NutritionSummaryDoc[]
): NutritionSummaryDoc {
  const mealGroups = buildMealGroups(entries);
  const mealBalanceScore = calculateMealBalanceScore(mealGroups);
  const nutritionScore = calculateNutritionScore(entries, goal, mealBalanceScore);
  const calories = Math.round(sum(entries, "calories"));
  const protein = roundMacro(sum(entries, "protein"));
  const carbs = roundMacro(sum(entries, "carbs"));
  const fat = roundMacro(sum(entries, "fat"));
  const fiber = roundMacro(sum(entries, "fiber"));
  const sugar = roundMacro(sum(entries, "sugar"));
  const sodium = Math.round(sum(entries, "sodium"));
  const previousStreak = historicalSummaries[0]?.healthyEatingStreak || 0;
  const healthyEatingStreak = nutritionScore >= 70 ? previousStreak + 1 : 0;
  const timestamp = nowIso();

  const aiSummary = entries.length === 0
    ? "Start with one actual food item today. Viora will calculate calories from item-level nutrition."
    : nutritionScore >= 80
      ? "Your meals look balanced today. Protein, energy and routine consistency are supporting your wellness score."
      : nutritionScore >= 55
        ? "Your nutrition foundation is active today. A protein or fiber-rich food item can improve your score."
        : "Your nutrition score needs attention. Add a balanced meal with protein, fiber and steady hydration.";

  return {
    id: `${userId}_${dateKey}`,
    userId,
    dateKey,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    nutritionScore,
    mealBalanceScore,
    healthyEatingStreak,
    caloriesRemaining: Math.max(goal.dailyCalories - calories, 0),
    proteinGap: Math.max(roundMacro(goal.protein - protein), 0),
    sugarStatus: sugar > goal.sugarLimit ? "high" : sugar < goal.sugarLimit * 0.35 ? "low" : "balanced",
    sodiumStatus: sodium > goal.sodiumLimit ? "high" : "balanced",
    hydrationCorrelation: entries.length >= 2 ? "supportive" : "unknown",
    aiSummary,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };
}

function buildMetrics(summary: NutritionSummaryDoc, goal: NutritionGoalDoc): NutritionMetric[] {
  return [
    {
      id: "calories",
      label: "Calories",
      value: `${summary.calories}/${goal.dailyCalories}`,
      helper: `${summary.caloriesRemaining} kcal remaining today`,
      tone: summary.calories > goal.dailyCalories ? "warning" : "positive",
    },
    {
      id: "protein",
      label: "Protein",
      value: `${summary.protein}g`,
      helper: summary.proteinGap > 0 ? `${summary.proteinGap}g gap remaining` : "Protein target met",
      tone: summary.proteinGap > 20 ? "warning" : "positive",
    },
    {
      id: "sugar",
      label: "Sugar",
      value: `${summary.sugar}g`,
      helper: `${goal.sugarLimit}g daily soft limit`,
      tone: summary.sugarStatus === "high" ? "warning" : "neutral",
    },
    {
      id: "balance",
      label: "Meal Balance",
      value: `${summary.mealBalanceScore}%`,
      helper: "Based on meal spread and item-level protein distribution",
      tone: summary.mealBalanceScore >= 70 ? "positive" : "warning",
    },
  ];
}

function buildInsights(summary: NutritionSummaryDoc, entries: NutritionEntryDoc[], groups: NutritionMealGroup[]): NutritionInsight[] {
  const insights: NutritionInsight[] = [
    {
      id: "daily-summary",
      title: "AI Daily Nutrition Summary",
      message: summary.aiSummary,
      tone: summary.nutritionScore >= 70 ? "positive" : "warning",
    },
  ];

  if (entries.some((entry) => entry.foodItems.length > 1)) {
    insights.push({
      id: "item-breakdown",
      title: "Item-Level Tracking Active",
      message: "Your calories are now calculated from individual foods like tea, sugar, roti, dal, bread or rice instead of a generic meal label.",
      tone: "positive",
    });
  }

  if (summary.proteinGap > 0) {
    insights.push({
      id: "protein-gap",
      title: "Protein Gap Detected",
      message: `You are ${summary.proteinGap}g away from today's protein target. Add dal, paneer, eggs, sprouts or curd.`,
      tone: summary.proteinGap > 25 ? "warning" : "neutral",
    });
  }

  if (summary.sugarStatus === "high") {
    insights.push({
      id: "sugar-high",
      title: "Sugar Needs Attention",
      message: "Sugar intake is trending high today. Tea sugar, sweets and sweet drinks are included in the total.",
      tone: "warning",
    });
  }

  if (summary.sodiumStatus === "high") {
    insights.push({
      id: "sodium-high",
      title: "Sodium Signal",
      message: "Sodium is above the ideal range. Balance it with water, fresh foods and a lighter next meal.",
      tone: "warning",
    });
  }

  const missingMeals = groups.filter((group) => group.entries.length === 0).map((group) => group.title);
  if (entries.length > 0 && missingMeals.length > 0) {
    insights.push({
      id: "meal-consistency",
      title: "Meal Consistency",
      message: `${missingMeals.slice(0, 2).join(" and ")} ${missingMeals.length > 1 ? "are" : "is"} not logged yet. Add food items for better daily accuracy.`,
      tone: "neutral",
    });
  }

  return insights;
}

function buildSuggestions(dateKey: string): NutritionSuggestion[] {
  const mealTime = new Date().toISOString();

  return [
    {
      id: "real-breakfast",
      mealType: "breakfast",
      title: "Bread + Tea Breakfast",
      description: "2 bread slices + 1 cup milk tea + 1 tsp sugar. Item-wise calories are visible separately.",
      actionLabel: "Add breakfast",
      entry: {
        mealType: "breakfast",
        title: "Bread and Tea Breakfast",
        notes: "Preset item-wise breakfast.",
        portionSize: "3 food items",
        mealTime,
        dateKey,
        foodItems: [
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "bread")!, 2),
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "tea-milk-sugar")!),
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "sugar")!),
        ],
        source: "ai_suggestion",
      },
    },
    {
      id: "balanced-lunch",
      mealType: "lunch",
      title: "Dal Roti Sabzi Plate",
      description: "2 roti + 1 bowl dal + 1 bowl sabzi. Better Indian meal breakdown for real calorie tracking.",
      actionLabel: "Add lunch",
      entry: {
        mealType: "lunch",
        title: "Dal Roti Sabzi Plate",
        notes: "Preset item-wise lunch.",
        portionSize: "4 food items",
        mealTime,
        dateKey,
        foodItems: [
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "roti")!, 2),
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "dal")!),
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "sabzi")!),
        ],
        source: "ai_suggestion",
      },
    },
    {
      id: "smart-snack",
      mealType: "snack",
      title: "Banana + Milk Snack",
      description: "Simple snack with visible item calories, sugar and protein contribution.",
      actionLabel: "Add snack",
      entry: {
        mealType: "snack",
        title: "Banana and Milk Snack",
        notes: "Preset item-wise snack.",
        portionSize: "2 food items",
        mealTime,
        dateKey,
        foodItems: [
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "banana")!),
          foodItemFromPreset(FOOD_PRESETS.find((preset) => preset.id === "milk")!),
        ],
        source: "ai_suggestion",
      },
    },
  ];
}

function buildTimeline(entries: NutritionEntryDoc[], summary: NutritionSummaryDoc): NutritionTimelineItem[] {
  const mealItems = entries.slice(0, 8).map((entry) => ({
    id: entry.id,
    title: entry.title,
    subtitle: `${entry.calories} kcal • ${entry.foodItems.length} item${entry.foodItems.length === 1 ? "" : "s"} • ${entry.protein}g protein`,
    time: entry.mealTime ? new Date(entry.mealTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today",
    tone: "neutral" as const,
  }));

  return [
    {
      id: "summary",
      title: `Nutrition score ${summary.nutritionScore}%`,
      subtitle: summary.aiSummary,
      time: "AI",
      tone: summary.nutritionScore >= 70 ? "positive" : "warning",
    },
    ...mealItems,
  ];
}

function calculateWeeklyAverage(summaries: NutritionSummaryDoc[], todayScore: number) {
  const scores = [todayScore, ...summaries.slice(0, 6).map((summary) => summary.nutritionScore)].filter((score) => score > 0);
  if (scores.length === 0) return todayScore;
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function calculateMonthlyTrend(summaries: NutritionSummaryDoc[], todayScore: number): NutritionTrend {
  const recent = [todayScore, ...summaries.slice(0, 6).map((summary) => summary.nutritionScore)];
  const older = summaries.slice(7, 21).map((summary) => summary.nutritionScore);

  if (older.length < 3) return "stable";

  const recentAvg = recent.reduce((total, score) => total + score, 0) / Math.max(recent.length, 1);
  const olderAvg = older.reduce((total, score) => total + score, 0) / older.length;

  if (recentAvg >= olderAvg + 8) return "improving";
  if (recentAvg <= olderAvg - 8) return "needs_attention";
  return "stable";
}

export async function getNutritionDashboard(userId: string, dateKey = todayKey()): Promise<NutritionDashboard> {
  if (!userId) throw new Error("Please login again.");

  const [entries, historicalSummaries, savedGoal] = await Promise.all([
    getNutritionEntriesForDate(userId, dateKey),
    getNutritionSummariesByUser(userId, 30),
    getNutritionGoal(userId),
  ]);

  const goal = savedGoal || defaultGoal(userId);
  if (!savedGoal) await saveNutritionGoal(goal);

  const mealGroups = buildMealGroups(entries);
  const summary = buildSummary(userId, dateKey, entries, goal, historicalSummaries);
  await saveNutritionSummary(summary);

  const weeklyAverageScore = calculateWeeklyAverage(historicalSummaries, summary.nutritionScore);
  const monthlyTrend = calculateMonthlyTrend(historicalSummaries, summary.nutritionScore);
  const suggestions = buildSuggestions(dateKey);

  return {
    userId,
    dateKey,
    generatedAt: nowIso(),
    entries,
    mealGroups,
    foodPresets: getNutritionFoodPresets(),
    goal,
    summary,
    metrics: buildMetrics(summary, goal),
    insights: buildInsights(summary, entries, mealGroups),
    suggestions,
    timeline: buildTimeline(entries, summary),
    nutritionScore: summary.nutritionScore,
    mealBalanceScore: summary.mealBalanceScore,
    weeklyAverageScore,
    monthlyTrend,
    healthyEatingStreak: summary.healthyEatingStreak,
    aiCoachContext: `Nutrition score ${summary.nutritionScore}. Logged ${entries.length} meals with item-level calories. Protein gap ${summary.proteinGap}g. Sugar ${summary.sugarStatus}. Sodium ${summary.sodiumStatus}.`,
    aiMemoryContext: `User logged ${entries.length} itemized nutrition entries on ${dateKey}. Current healthy eating streak is ${summary.healthyEatingStreak}.`,
    wellnessIntelligenceContext: `Nutrition can influence wellness score through meal balance ${summary.mealBalanceScore} and weekly nutrition average ${weeklyAverageScore}.`,
    notificationContext: summary.proteinGap > 20 ? "Suggest a protein-rich meal reminder." : "Nutrition routine is on track.",
  };
}

export async function getNutritionHistory(userId: string): Promise<NutritionEntryDoc[]> {
  return getNutritionEntriesByUser(userId, 80);
}

export async function createNutritionEntry(input: NutritionEntryInput): Promise<NutritionEntryDoc> {
  return saveNutritionEntry(input);
}

export async function applyNutritionSuggestion(
  userId: string,
  suggestion: NutritionSuggestion
): Promise<NutritionEntryDoc> {
  return saveNutritionEntry({ ...suggestion.entry, userId });
}

export async function increaseNutritionPortion(entry: NutritionEntryDoc): Promise<void> {
  await updateNutritionEntryPortion(entry, 1.25);
}

export async function reduceNutritionPortion(entry: NutritionEntryDoc): Promise<void> {
  await updateNutritionEntryPortion(entry, 0.75);
}

export async function removeNutritionEntry(entryId: string): Promise<void> {
  await deleteNutritionEntry(entryId);
}
