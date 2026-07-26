import { useCallback, useEffect, useMemo, useState } from "react";

import { getCategoryProgramContent, getHomeWorkoutContent, getProgramContent } from "../services/programs";
import { AdminManagedContent } from "../types";

export function useProgramContent(mode: "all" | "home_workout" | "meditation" = "all") {
  const [items, setItems] = useState<AdminManagedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const result = mode === "home_workout"
        ? await getHomeWorkoutContent()
        : mode === "meditation"
        ? await getCategoryProgramContent("meditation")
        : await getProgramContent();
      setItems(result);
    } catch (err: any) {
      setError(err?.message || "Unable to load programs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode]);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return useMemo(() => ({ items, loading, refreshing, error, refresh }), [error, items, loading, refresh, refreshing]);
}
