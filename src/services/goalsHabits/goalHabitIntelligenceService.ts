import { getTodayKey } from "../../firebase/firestoreHelpers";
import {
  archiveGoal,
  archiveHabit,
  completeHabitForDate,
  deleteGoal,
  deleteHabit,
  getGoalsByUser,
  getHabitCompletionsByUser,
  getHabitsByUser,
  removeHabitCompletion,
  saveGoal,
  saveHabit,
  updateGoalProgress,
} from "../../repositories/goalHabitRepository";
import {
  GoalDoc,
  GoalHabitDashboard,
  GoalHabitStat,
  GoalInput,
  GoalInsight,
  GoalPrediction,
  GoalSuggestion,
  HabitAnalytics,
  HabitDoc,
  HabitInput,
} from "../../types/goalsHabits";

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(dateKey: string) {
  const target = new Date(`${dateKey}T00:00:00`);
  const today = new Date(`${getTodayKey()}T00:00:00`);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function progressPercent(goal: GoalDoc) {
  if (goal.targetValue <= 0) return 0;
  return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
}

function predictionForGoal(goal: GoalDoc): GoalPrediction {
  const percent = progressPercent(goal);
  const daysRemaining = daysBetween(goal.targetDate);

  if (goal.status === "completed" || percent >= 100) {
    return {
      goalId: goal.id,
      status: "completed",
      progressPercent: 100,
      daysRemaining: Math.max(daysRemaining, 0),
      message: `${goal.title} is complete. Keep the habit alive with a maintenance routine.`,
    };
  }

  if (daysRemaining < 0) {
    return {
      goalId: goal.id,
      status: "at_risk",
      progressPercent: percent,
      daysRemaining,
      message: `${goal.title} target date has passed. Adjust the target or restart with a smaller milestone.`,
    };
  }

  if (percent >= 70 || daysRemaining >= 14) {
    return {
      goalId: goal.id,
      status: "on_track",
      progressPercent: percent,
      daysRemaining,
      message: `${goal.title} looks on track. Maintain your current rhythm.`,
    };
  }

  if (percent >= 35) {
    return {
      goalId: goal.id,
      status: "needs_attention",
      progressPercent: percent,
      daysRemaining,
      message: `${goal.title} needs a little more consistency this week.`,
    };
  }

  return {
    goalId: goal.id,
    status: "at_risk",
    progressPercent: percent,
    daysRemaining,
    message: `${goal.title} is at risk. Break it into a smaller daily habit.`,
  };
}

function buildHabitAnalytics(habits: HabitDoc[], completedHabitIds: Set<string>): HabitAnalytics[] {
  return habits.map((habit) => {
    const completedCount = completedHabitIds.has(habit.id) ? 1 : 0;
    const expectedCount = habit.frequency === "daily" ? 7 : habit.frequency === "weekly" ? 1 : 1;
    const consistencyPercent = Math.min(
      Math.round(((habit.streak + completedCount) / Math.max(expectedCount, 1)) * 100),
      100
    );

    return {
      habitId: habit.id,
      completedCount,
      missedCount: completedCount > 0 ? 0 : 1,
      consistencyPercent,
      streak: habit.streak,
      bestStreak: habit.bestStreak,
    };
  });
}

function buildStats({
  activeGoals,
  activeHabits,
  completedGoals,
  consistencyScore,
}: {
  activeGoals: GoalDoc[];
  activeHabits: HabitDoc[];
  completedGoals: GoalDoc[];
  consistencyScore: number;
}): GoalHabitStat[] {
  return [
    {
      label: "Active Goals",
      value: String(activeGoals.length),
      helper: "Goals currently in progress",
    },
    {
      label: "Active Habits",
      value: String(activeHabits.length),
      helper: "Routines Viora is tracking",
    },
    {
      label: "Consistency",
      value: `${consistencyScore}%`,
      helper: "Habit rhythm this period",
    },
    {
      label: "Completed",
      value: String(completedGoals.length),
      helper: "Goals successfully finished",
    },
  ];
}

function buildInsights({
  activeGoals,
  activeHabits,
  predictions,
  consistencyScore,
}: {
  activeGoals: GoalDoc[];
  activeHabits: HabitDoc[];
  predictions: GoalPrediction[];
  consistencyScore: number;
}): GoalInsight[] {
  const insights: GoalInsight[] = [];

  if (activeGoals.length === 0) {
    insights.push({
      id: "goal-empty",
      title: "Start with one clear goal",
      message: "Pick one measurable wellness goal so Viora can connect your habits, AI coach and reminders.",
      tone: "neutral",
    });
  }

  if (activeHabits.length === 0) {
    insights.push({
      id: "habit-empty",
      title: "Build your first habit loop",
      message: "A tiny daily routine is enough to create momentum. Start with hydration, sleep or movement.",
      tone: "neutral",
    });
  }

  const riskyGoal = predictions.find((item) => item.status === "at_risk");
  if (riskyGoal) {
    insights.push({
      id: `risk-${riskyGoal.goalId}`,
      title: "Goal needs attention",
      message: riskyGoal.message,
      tone: "warning",
    });
  }

  if (consistencyScore >= 70) {
    insights.push({
      id: "consistency-good",
      title: "Strong habit rhythm",
      message: "Your consistency is building. Viora can now make better AI recommendations from your behavior.",
      tone: "positive",
    });
  }

  return insights.slice(0, 5);
}

function buildSuggestions(userId: string, activeGoals: GoalDoc[], activeHabits: HabitDoc[]): GoalSuggestion[] {
  const targetDate = toDateKey(addDays(new Date(), 30));
  const hasHydration = [...activeGoals, ...activeHabits].some((item) => item.category === "hydration");
  const hasSleep = [...activeGoals, ...activeHabits].some((item) => item.category === "sleep");
  const hasMovement = [...activeGoals, ...activeHabits].some((item) => item.category === "movement");

  const suggestions: GoalSuggestion[] = [];

  if (!hasHydration) {
    suggestions.push({
      id: "hydration-goal",
      type: "goal",
      title: "Reach 2.5L hydration daily",
      description: "A 30-day hydration goal connected with reminders and AI coach nudges.",
      category: "hydration",
      actionLabel: "Add Goal",
      goal: {
        title: "Reach 2.5L hydration daily",
        description: "Build a consistent hydration baseline for energy and focus.",
        category: "hydration",
        targetValue: 2500,
        currentValue: 0,
        unit: "ml",
        targetDate,
        source: "ai_suggestion",
      },
    });
  }

  if (!hasSleep) {
    suggestions.push({
      id: "sleep-habit",
      type: "habit",
      title: "Wind down before sleep",
      description: "Create a simple nightly wind-down habit to improve recovery.",
      category: "sleep",
      actionLabel: "Add Habit",
      habit: {
        title: "10 min sleep wind-down",
        description: "No screens, calming music or breathing before bed.",
        category: "sleep",
        frequency: "daily",
        targetPerPeriod: 1,
        reminderTime: "22:15",
        source: "ai_suggestion",
      },
    });
  }

  if (!hasMovement) {
    suggestions.push({
      id: "movement-habit",
      type: "habit",
      title: "10 min daily movement",
      description: "A realistic starter habit for yoga, walking or stretching.",
      category: "movement",
      actionLabel: "Add Habit",
      habit: {
        title: "10 min daily movement",
        description: "Yoga, walking or stretching to keep the body active.",
        category: "movement",
        frequency: "daily",
        targetPerPeriod: 1,
        reminderTime: "07:00",
        source: "ai_suggestion",
      },
    });
  }

  return suggestions.map((item) => ({ ...item, id: `${userId}_${item.id}` }));
}

function buildSummary(activeGoals: GoalDoc[], activeHabits: HabitDoc[], consistencyScore: number) {
  if (activeGoals.length === 0 && activeHabits.length === 0) {
    return "Set one goal and one habit to activate Viora's habit intelligence engine.";
  }

  if (consistencyScore >= 70) {
    return "Your wellness routine is gaining momentum. Keep the current habit loop stable this week.";
  }

  return "Your goals are ready, but the next improvement is consistency. Focus on completing one small habit today.";
}

export async function getGoalHabitDashboard(userId: string): Promise<GoalHabitDashboard> {
  const startDateKey = toDateKey(addDays(new Date(), -30));
  const [goals, habits, completions] = await Promise.all([
    getGoalsByUser(userId),
    getHabitsByUser(userId),
    getHabitCompletionsByUser({ userId, startDateKey }),
  ]);

  const activeGoals = goals.filter((item) => item.status === "active");
  const activeHabits = habits.filter((item) => item.status === "active");
  const completedGoals = goals.filter((item) => item.status === "completed");
  const archivedGoals = goals.filter((item) => item.status === "archived");
  const todayKey = getTodayKey();
  const completedToday = new Set(
    completions
      .filter((item) => item.dateKey === todayKey && item.status === "completed")
      .map((item) => item.habitId)
  );
  const habitAnalytics = buildHabitAnalytics(activeHabits, completedToday);
  const consistencyScore = activeHabits.length === 0
    ? 0
    : Math.round(
        habitAnalytics.reduce((total, item) => total + item.consistencyPercent, 0) / activeHabits.length
      );
  const predictions = activeGoals.map(predictionForGoal);
  const completionScore = goals.length === 0 ? 0 : Math.round((completedGoals.length / goals.length) * 100);
  const suggestions = buildSuggestions(userId, activeGoals, activeHabits);
  const weeklySummary = buildSummary(activeGoals, activeHabits, consistencyScore);
  const monthlySummary = `${completedGoals.length} completed goals, ${activeGoals.length} active goals and ${activeHabits.length} active habits are currently shaping your wellness plan.`;

  return {
    userId,
    generatedAt: new Date().toISOString(),
    goals,
    habits,
    completions,
    activeGoals,
    activeHabits,
    completedGoals,
    archivedGoals,
    statistics: buildStats({ activeGoals, activeHabits, completedGoals, consistencyScore }),
    insights: buildInsights({ activeGoals, activeHabits, predictions, consistencyScore }),
    suggestions,
    predictions,
    habitAnalytics,
    consistencyScore,
    completionScore,
    weeklySummary,
    monthlySummary,
    aiCoachContext: `Goals: ${activeGoals.map((item) => item.title).join(", ") || "none"}. Habits: ${activeHabits.map((item) => item.title).join(", ") || "none"}. Consistency: ${consistencyScore}%.`,
    aiMemoryContext: `Remember habit consistency ${consistencyScore}% and active focus areas: ${activeHabits.map((item) => item.category).join(", ") || "none"}.`,
    notificationContext: activeHabits
      .filter((item) => item.reminderTime)
      .map((item) => `${item.title} at ${item.reminderTime}`)
      .join("; "),
  };
}

export async function createGoalFromInput(input: GoalInput): Promise<void> {
  await saveGoal(input);
}

export async function createHabitFromInput(input: HabitInput): Promise<void> {
  await saveHabit(input);
}

export async function applyGoalProgress(goal: GoalDoc, nextValue: number): Promise<void> {
  await updateGoalProgress(goal, nextValue);
}

export async function completeHabitToday(habit: HabitDoc): Promise<void> {
  await completeHabitForDate({ habit, dateKey: getTodayKey() });
}

export async function undoHabitToday(habit: HabitDoc): Promise<void> {
  await removeHabitCompletion({ habit, dateKey: getTodayKey() });
}

export async function archiveGoalById(goalId: string): Promise<void> {
  await archiveGoal(goalId);
}

export async function archiveHabitById(habitId: string): Promise<void> {
  await archiveHabit(habitId);
}

export async function deleteGoalById(goalId: string): Promise<void> {
  await deleteGoal(goalId);
}

export async function deleteHabitById(habitId: string): Promise<void> {
  await deleteHabit(habitId);
}
