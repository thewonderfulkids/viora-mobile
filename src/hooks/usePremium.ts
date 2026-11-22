import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getPremiumDashboard } from "../services/premium";
import { PaymentProvider, PremiumDashboard, PremiumPlanCode } from "../types/premium";

export function usePremium() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PremiumDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingPlanCode, setProcessingPlanCode] = useState<PremiumPlanCode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.uid || "";

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (!userId) {
      setDashboard(null);
      setError("Please login to view premium plans.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setError(null);
      const result = await getPremiumDashboard(userId);
      setDashboard(result);
    } catch (err: any) {
      setError(err?.message || "Unable to load premium membership.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    load("initial");
  }, [load]);

  const refresh = useCallback(async () => {
    await load("refresh");
  }, [load]);

  const startPlanCheckout = useCallback(async (planCode: PremiumPlanCode, provider: PaymentProvider = "manual") => {
    if (!userId) {
      setError("Please login to continue.");
      return;
    }

    try {
      setProcessingPlanCode(planCode);
      setError(null);
      throw new Error("Premium checkout is not yet available. No payment has been charged and no subscription has been activated.");
    } catch (err: any) {
      setError(err?.message || "Unable to start payment.");
    } finally {
      setProcessingPlanCode(null);
    }
  }, [load, userId]);

  const activePlanCode = dashboard?.currentPlan.code || "FREE";

  return useMemo(() => ({
    dashboard,
    loading,
    refreshing,
    error,
    processingPlanCode,
    activePlanCode,
    refresh,
    startPlanCheckout,
  }), [activePlanCode, dashboard, error, loading, processingPlanCode, refresh, refreshing, startPlanCheckout]);
}
