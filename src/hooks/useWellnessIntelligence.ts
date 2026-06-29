import { useCallback, useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
  buildAIMemoryContext,
  buildWellnessIntelligenceDashboard,
} from "../services/ai";
import { WellnessIntelligenceDashboard } from "../types/wellnessIntelligence";
import { useDashboard } from "./useDashboard";

export function useWellnessIntelligence() {
  const { data } = useDashboard();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intelligence, setIntelligence] =
    useState<WellnessIntelligenceDashboard | null>(null);

  const refresh = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      setRefreshing(false);
      setError("Please login again.");
      return;
    }

    if (!data) {
      setLoading(false);
      setRefreshing(false);
      setError("Dashboard data is not ready yet.");
      return;
    }

    setRefreshing(true);
    setError(null);

    try {
      const memoryContext = await buildAIMemoryContext({
        userId: currentUser.uid,
        maxMemories: 12,
        maxSummaries: 5,
      });

      const result = await buildWellnessIntelligenceDashboard({
        userId: currentUser.uid,
        dashboard: data,
        profile: memoryContext.profile,
        memories: memoryContext.memories,
        summaries: memoryContext.recentSummaries,
        persistSnapshot: true,
      });

      setIntelligence(result);
    } catch (error: any) {
      setError(error?.message || "Unable to generate AI wellness intelligence.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    refreshing,
    error,
    intelligence,
    refresh,
  };
}
