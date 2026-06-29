import { useCallback, useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
  applyNutritionSuggestion,
  createNutritionEntry,
  getNutritionDashboard,
  increaseNutritionPortion,
  reduceNutritionPortion,
  removeNutritionEntry,
} from "../services";
import { NutritionDashboard, NutritionEntryDoc, NutritionEntryInput, NutritionSuggestion } from "../types";

export function useNutrition() {
  const [dashboard, setDashboard] = useState<NutritionDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const result = await getNutritionDashboard(currentUser.uid);
      setDashboard(result);
    } catch (error: any) {
      setError(error?.message || "Unable to load nutrition intelligence.");
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
        setError(error?.message || "Unable to update nutrition.");
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const addEntry = useCallback(
    async (input: Omit<NutritionEntryInput, "userId">) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      await runMutation(async () => {
        await createNutritionEntry({ ...input, userId: currentUser.uid });
      });
    },
    [runMutation]
  );

  const addSuggestion = useCallback(
    async (suggestion: NutritionSuggestion) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      await runMutation(async () => {
        await applyNutritionSuggestion(currentUser.uid, suggestion);
      });
    },
    [runMutation]
  );

  const increasePortion = useCallback(
    async (entry: NutritionEntryDoc) => {
      await runMutation(() => increaseNutritionPortion(entry));
    },
    [runMutation]
  );

  const reducePortion = useCallback(
    async (entry: NutritionEntryDoc) => {
      await runMutation(() => reduceNutritionPortion(entry));
    },
    [runMutation]
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      await runMutation(() => removeNutritionEntry(entryId));
    },
    [runMutation]
  );

  return {
    dashboard,
    loading,
    refreshing,
    saving,
    error,
    refresh,
    addEntry,
    addSuggestion,
    increasePortion,
    reducePortion,
    deleteEntry,
  };
}
