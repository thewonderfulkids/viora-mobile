import { useCallback, useEffect, useMemo, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
  applyGoalProgress,
  archiveGoalById,
  archiveHabitById,
  completeHabitToday,
  createGoalFromInput,
  createHabitFromInput,
  deleteGoalById,
  deleteHabitById,
  getGoalHabitDashboard,
  undoHabitToday,
} from "../services/goalsHabits";
import {
  GoalDoc,
  GoalHabitDashboard,
  GoalInput,
  GoalSuggestion,
  HabitDoc,
  HabitInput,
} from "../types";

export function useGoalHabitDashboard() {
  const [dashboard, setDashboard] = useState<GoalHabitDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = auth.currentUser?.uid || "";

  const todayCompletedHabitIds = useMemo(() => {
    if (!dashboard) return new Set<string>();
    const todayKey = new Date().toISOString().slice(0, 10);

    return new Set(
      dashboard.completions
        .filter((item) => item.dateKey === todayKey && item.status === "completed")
        .map((item) => item.habitId)
    );
  }, [dashboard]);

  const refresh = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      setRefreshing(false);
      setError("Please login again.");
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const result = await getGoalHabitDashboard(currentUser.uid);
      setDashboard(result);
    } catch (error: any) {
      setError(error?.message || "Unable to load goals and habits.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runMutation = useCallback(
    async (task: () => Promise<void>) => {
      setSaving(true);
      setError(null);

      try {
        await task();
        await refresh();
      } catch (error: any) {
        setError(error?.message || "Unable to update goals and habits.");
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const createGoal = useCallback(
    async (input: Omit<GoalInput, "userId">) => {
      if (!userId) return;
      await runMutation(() => createGoalFromInput({ ...input, userId }));
    },
    [runMutation, userId]
  );

  const createHabit = useCallback(
    async (input: Omit<HabitInput, "userId">) => {
      if (!userId) return;
      await runMutation(() => createHabitFromInput({ ...input, userId }));
    },
    [runMutation, userId]
  );

  const applySuggestion = useCallback(
    async (suggestion: GoalSuggestion) => {
      if (suggestion.type === "goal" && suggestion.goal) {
        await createGoal(suggestion.goal);
      }

      if (suggestion.type === "habit" && suggestion.habit) {
        await createHabit(suggestion.habit);
      }
    },
    [createGoal, createHabit]
  );

  const increaseGoalProgress = useCallback(
    async (goal: GoalDoc) => {
      const step = goal.unit === "ml" ? 250 : goal.unit === "minutes" ? 10 : 1;
      await runMutation(() => applyGoalProgress(goal, goal.currentValue + step));
    },
    [runMutation]
  );

  const completeHabit = useCallback(
    async (habit: HabitDoc) => {
      const isCompleted = todayCompletedHabitIds.has(habit.id);
      await runMutation(() => (isCompleted ? undoHabitToday(habit) : completeHabitToday(habit)));
    },
    [runMutation, todayCompletedHabitIds]
  );

  const archiveGoal = useCallback(
    async (goalId: string) => {
      await runMutation(() => archiveGoalById(goalId));
    },
    [runMutation]
  );

  const archiveHabit = useCallback(
    async (habitId: string) => {
      await runMutation(() => archiveHabitById(habitId));
    },
    [runMutation]
  );

  const removeGoal = useCallback(
    async (goalId: string) => {
      await runMutation(() => deleteGoalById(goalId));
    },
    [runMutation]
  );

  const removeHabit = useCallback(
    async (habitId: string) => {
      await runMutation(() => deleteHabitById(habitId));
    },
    [runMutation]
  );

  return {
    dashboard,
    loading,
    refreshing,
    saving,
    error,
    todayCompletedHabitIds,
    refresh,
    createGoal,
    createHabit,
    applySuggestion,
    increaseGoalProgress,
    completeHabit,
    archiveGoal,
    archiveHabit,
    removeGoal,
    removeHabit,
  };
}
