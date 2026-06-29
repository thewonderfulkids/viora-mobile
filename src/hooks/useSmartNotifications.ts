import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import { useAuth } from "../context/AuthContext";
import {
  getSmartNotificationDashboard,
  setWellnessReminderStatus,
  updateSmartNotificationSettings,
} from "../services/notifications";
import {
  SmartNotificationDashboard,
  SmartReminderSettingsInput,
  WellnessReminderStatus,
} from "../types";

type UseSmartNotificationsResult = {
  data: SmartNotificationDashboard | null;
  loading: boolean;
  refreshing: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateSettings: (input: Omit<SmartReminderSettingsInput, "userId">) => Promise<void>;
  updateReminderStatus: (reminderId: string, status: WellnessReminderStatus) => Promise<void>;
};

export function useSmartNotifications(): UseSmartNotificationsResult {
  const { user } = useAuth();

  const [data, setData] = useState<SmartNotificationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!user?.uid) {
        setData(null);
        setLoading(false);
        return;
      }

      try {
        if (mode === "initial") setLoading(true);
        if (mode === "refresh") setRefreshing(true);

        setError(null);
        const dashboard = await getSmartNotificationDashboard(user.uid);
        setData(dashboard);
      } catch (err: any) {
        setError(err?.message || "Unable to load smart notifications.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.uid]
  );

  useEffect(() => {
    loadDashboard("initial");
  }, [loadDashboard]);

  const refresh = useCallback(async () => {
    await loadDashboard("refresh");
  }, [loadDashboard]);

  const updateSettings = useCallback(
    async (input: Omit<SmartReminderSettingsInput, "userId">) => {
      if (!user?.uid) {
        Alert.alert("Login required", "Please login again.");
        return;
      }

      try {
        setSaving(true);
        await updateSmartNotificationSettings({ userId: user.uid, ...input });
        await loadDashboard("refresh");
      } catch (err: any) {
        Alert.alert("Unable to save settings", err?.message || "Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [loadDashboard, user?.uid]
  );

  const updateReminderStatus = useCallback(
    async (reminderId: string, status: WellnessReminderStatus) => {
      try {
        setSaving(true);
        await setWellnessReminderStatus(reminderId, status);
        await loadDashboard("refresh");
      } catch (err: any) {
        Alert.alert("Unable to update reminder", err?.message || "Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [loadDashboard]
  );

  return {
    data,
    loading,
    refreshing,
    saving,
    error,
    refresh,
    updateSettings,
    updateReminderStatus,
  };
}
