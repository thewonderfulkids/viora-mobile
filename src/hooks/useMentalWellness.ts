import { useCallback, useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
  applyCopingSuggestion,
  createMoodCheckIn,
  getMentalWellnessDashboard,
  removeMoodCheckIn,
} from "../services";
import { CopingSuggestion, MentalWellnessDashboard, MoodEntryInput } from "../types";

export function useMentalWellness() {
  const [dashboard, setDashboard] = useState<MentalWellnessDashboard | null>(null);
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
      const result = await getMentalWellnessDashboard(currentUser.uid);
      setDashboard(result);
    } catch (error: any) {
      setError(error?.message || "Unable to load mental wellness intelligence.");
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
        setError(error?.message || "Unable to update mental wellness.");
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const saveCheckIn = useCallback(
    async (input: Omit<MoodEntryInput, "userId">) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await runMutation(async () => {
        await createMoodCheckIn({ ...input, userId: currentUser.uid });
      });
    },
    [runMutation]
  );

  const saveSuggestion = useCallback(
    async (suggestion: CopingSuggestion) => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await runMutation(async () => {
        await applyCopingSuggestion(currentUser.uid, suggestion);
      });
    },
    [runMutation]
  );

  const deleteCheckIn = useCallback(
    async (entryId: string) => {
      await runMutation(() => removeMoodCheckIn(entryId));
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
    saveCheckIn,
    saveSuggestion,
    deleteCheckIn,
  };
}
