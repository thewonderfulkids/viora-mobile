import { useCallback, useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
    buildAIMemoryContext,
    buildWellnessIntelligence,
    WellnessIntelligence,
} from "../services/ai";
import { useDashboard } from "./useDashboard";

export function useWellnessIntelligence() {
  const { data } = useDashboard();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intelligence, setIntelligence] =
    useState<WellnessIntelligence | null>(null);

  const refresh = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      setError("Please login again.");
      return;
    }

    if (!data) {
      setLoading(false);
      setError("Dashboard data is not ready yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memoryContext = await buildAIMemoryContext({
        userId: currentUser.uid,
        maxMemories: 8,
        maxSummaries: 3,
      });

      const result = buildWellnessIntelligence({
        dashboard: data,
        profile: memoryContext.profile,
        memories: memoryContext.memories,
        summaries: memoryContext.recentSummaries,
      });

      setIntelligence(result);
    } catch (error: any) {
      setError(error?.message || "Unable to generate AI wellness insight.");
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    error,
    intelligence,
    refresh,
  };
}