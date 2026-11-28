import { useCallback, useEffect, useMemo, useState } from "react";

import { changeAppLanguage } from "../i18n/LanguageProvider";
import { useAuth } from "../context/AuthContext";
import { useDashboard } from "./useDashboard";
import { getSettingsDashboard, saveSettingsPreferences } from "../services/settings";
import { SettingsDashboard, SettingsPreferencePatch } from "../types";

export function useSettingsCenter() {
  const { user } = useAuth();
  const { data } = useDashboard();
  const [dashboard, setDashboard] = useState<SettingsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.uid || "";
  const displayName = data?.user?.fullName || user?.email?.split("@")[0] || "";

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    if (!userId) {
      setDashboard(null);
      setError("Please login to manage settings.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setError(null);
      const result = await getSettingsDashboard({ user, displayName });
      setDashboard(result);
    } catch (err: any) {
      setError(err?.message || "Unable to load settings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [displayName, user, userId]);

  useEffect(() => {
    load("initial");
  }, [load]);

  const refresh = useCallback(async () => {
    await load("refresh");
  }, [load]);

  const updatePreferences = useCallback(async (patch: SettingsPreferencePatch) => {
    if (!userId) {
      setError("Please login to save settings.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await saveSettingsPreferences(userId, patch);
      if (patch.language !== undefined && (updated.language === "en" || updated.language === "hi")) {
        await changeAppLanguage(updated.language);
      }
      setDashboard((current) => current ? {
        ...current,
        preferences: updated,
        privacySummary: {
          aiMemoryEnabled: updated.aiMemoryEnabled,
          aiPersonalizationEnabled: updated.aiPersonalizationEnabled,
          dataExportRequestedAt: updated.dataExportRequestedAt,
          deleteAccountRequestedAt: updated.deleteAccountRequestedAt,
        },
        accountSummary: {
          ...current.accountSummary,
          aiMemoryStatus: updated.aiMemoryEnabled ? "On" : "Paused",
          notificationStatus: updated.smartNotificationsEnabled ? "On" : "Paused",
        },
      } : current);
    } catch (err: any) {
      setError(err?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }, [userId]);

  return useMemo(() => ({
    dashboard,
    loading,
    saving,
    refreshing,
    error,
    refresh,
    updatePreferences,
  }), [dashboard, error, loading, refresh, refreshing, saving, updatePreferences]);
}
