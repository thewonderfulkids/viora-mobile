import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { createFamilyInvite, getFamilyDashboard, pauseFamilyMemberById } from "../services/family";
import { FamilyDashboard, FamilyInviteInput } from "../types";

export function useFamilyDashboard() {
  const { user, userDoc } = useAuth();
  const [dashboard, setDashboard] = useState<FamilyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.uid || "";
  const displayName = userDoc?.fullName || user?.displayName || user?.email?.split("@")[0] || "Viora User";

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (!userId) {
      setDashboard(null);
      setError("Please login to load Family Wellness.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setError(null);
      const result = await getFamilyDashboard(userId, displayName);
      setDashboard(result);
    } catch (err: any) {
      setError(err?.message || "Unable to load Family Wellness.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [displayName, userId]);

  useEffect(() => {
    load("initial");
  }, [load]);

  const refresh = useCallback(async () => load("refresh"), [load]);

  const inviteMember = useCallback(async (input: FamilyInviteInput) => {
    if (!userId) return;
    try {
      setSaving(true);
      setError(null);
      const result = await createFamilyInvite(userId, displayName, input);
      setDashboard(result);
    } catch (err: any) {
      setError(err?.message || "Unable to invite member.");
    } finally {
      setSaving(false);
    }
  }, [displayName, userId]);

  const pauseMember = useCallback(async (memberId: string) => {
    if (!userId) return;
    try {
      setSaving(true);
      setError(null);
      const result = await pauseFamilyMemberById(userId, displayName, memberId);
      setDashboard(result);
    } catch (err: any) {
      setError(err?.message || "Unable to update family member.");
    } finally {
      setSaving(false);
    }
  }, [displayName, userId]);

  return useMemo(() => ({
    dashboard,
    loading,
    refreshing,
    saving,
    error,
    refresh,
    inviteMember,
    pauseMember,
  }), [dashboard, error, inviteMember, loading, pauseMember, refresh, refreshing, saving]);
}
