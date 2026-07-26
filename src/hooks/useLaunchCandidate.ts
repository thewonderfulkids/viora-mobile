import { useCallback, useEffect, useState } from "react";

import { buildLaunchReadinessDashboard, getLastLaunchAudit } from "../services";
import { LaunchAuditSnapshot, LaunchReadinessDashboard } from "../types";

export function useLaunchCandidate() {
  const [dashboard, setDashboard] = useState<LaunchReadinessDashboard | null>(null);
  const [lastAudit, setLastAudit] = useState<LaunchAuditSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    try {
      setError(null);
      if (asRefresh) setRefreshing(true);
      else setLoading(true);

      const [nextDashboard, previousAudit] = await Promise.all([
        buildLaunchReadinessDashboard(),
        getLastLaunchAudit(),
      ]);

      setDashboard(nextDashboard);
      setLastAudit(previousAudit);
    } catch (err: any) {
      setError(err?.message || "Unable to run launch readiness checks.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return {
    dashboard,
    lastAudit,
    loading,
    refreshing,
    error,
    refresh,
  };
}
