export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type NutritionSource = "manual" | "ai_suggestion" | "system" | "preset";

export type NutritionTrend = "improving" | "stable" | "needs_attention";

export type NutritionTone = "positive" | "warning" | "neutral";

export type FoodUnit = "slice" | "bowl" | "cup" | "ml" | "gram" | "piece" | "tsp" | "tbsp" | "serving";

export type FoodNutrition = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
};

export type NutritionFoodItem = FoodNutrition & {
  id: string;
  name: string;
  quantity: number;
  unit: FoodUnit;
  servingLabel: string;
  source: NutritionSource;
};

export type NutritionFoodItemInput = Omit<NutritionFoodItem, "id"> & {
  id?: string;
};

export type FoodPreset = FoodNutrition & {
  id: string;
  name: string;
  defaultQuantity: number;
  unit: FoodUnit;
  servingLabel: string;
  category: "indian" | "drink" | "protein" | "snack" | "basic";
};

export type NutritionEntryDoc = FoodNutrition & {
  id: string;
  userId: string;
  mealType: MealType;
  title: string;
  notes: string;
  portionSize: string;
  mealTime: string;
  dateKey: string;
  source: NutritionSource;
  foodItems: NutritionFoodItem[];
  premiumOnly: boolean;
  familyAccountReady: boolean;
  voiceReady: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type NutritionEntryInput = {
  userId: string;
  mealType: MealType;
  title?: string;
  notes?: string;
  portionSize?: string;
  mealTime?: string;
  dateKey?: string;
  source?: NutritionSource;
  foodItems: NutritionFoodItemInput[];
};

export type NutritionGoalDoc = {
  id: string;
  userId: string;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugarLimit: number;
  sodiumLimit: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type NutritionSummaryDoc = FoodNutrition & {
  id: string;
  userId: string;
  dateKey: string;
  nutritionScore: number;
  mealBalanceScore: number;
  healthyEatingStreak: number;
  caloriesRemaining: number;
  proteinGap: number;
  sugarStatus: "low" | "balanced" | "high";
  sodiumStatus: "balanced" | "high";
  hydrationCorrelation: "supportive" | "needs_water" | "unknown";
  aiSummary: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type NutritionMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: NutritionTone;
};

export type NutritionInsight = {
  id: string;
  title: string;
  message: string;
  tone: NutritionTone;
};

export type NutritionSuggestion = {
  id: string;
  mealType: MealType;
  title: string;
  description: string;
  actionLabel: string;
  entry: Omit<NutritionEntryInput, "userId">;
};

export type NutritionTimelineItem = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  tone: NutritionTone;
};

export type NutritionMealGroup = FoodNutrition & {
  mealType: MealType;
  title: string;
  entries: NutritionEntryDoc[];
};

export type NutritionDashboard = {
  userId: string;
  dateKey: string;
  generatedAt: string;
  entries: NutritionEntryDoc[];
  mealGroups: NutritionMealGroup[];
  foodPresets: FoodPreset[];
  goal: NutritionGoalDoc;
  summary: NutritionSummaryDoc;
  metrics: NutritionMetric[];
  insights: NutritionInsight[];
  suggestions: NutritionSuggestion[];
  timeline: NutritionTimelineItem[];
  nutritionScore: number;
  mealBalanceScore: number;
  weeklyAverageScore: number;
  monthlyTrend: NutritionTrend;
  healthyEatingStreak: number;
  aiCoachContext: string;
  aiMemoryContext: string;
  wellnessIntelligenceContext: string;
  notificationContext: string;
};
