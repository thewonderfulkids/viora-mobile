import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebaseConfig";
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
  const mounted = useRef(false);
  const version = useRef(0);
  const isCurrent = useCallback(() => mounted.current && Boolean(user && auth.currentUser === user), [user]);

  const [data, setData] = useState<SmartNotificationDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!user || !isCurrent()) return;
      const ticket = ++version.current;
      const canApply = () => isCurrent() && version.current === ticket;

      try {
        setLoading(mode === "initial");
        setRefreshing(mode === "refresh");
        setError(null);
        const dashboard = await getSmartNotificationDashboard(user.uid, user);
        if (canApply()) setData(dashboard);
      } catch (err: unknown) {
        if (canApply()) setError(err instanceof Error ? err.message : "Unable to load smart notifications.");
      } finally {
        if (canApply()) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [isCurrent, user]
  );

  useEffect(() => {
    mounted.current = true;
    void loadDashboard("initial");
    return () => {
      mounted.current = false;
      version.current += 1;
    };
  }, [loadDashboard]);

  const refresh = useCallback(async () => {
    await loadDashboard("refresh");
  }, [loadDashboard]);

  const updateSettings = useCallback(
    async (input: Omit<SmartReminderSettingsInput, "userId">) => {
      if (!user || !isCurrent()) return;

      try {
        setSaving(true);
        await updateSmartNotificationSettings({ ...input, userId: user.uid }, user);
        await loadDashboard("refresh");
      } catch (err: any) {
        if (isCurrent()) Alert.alert("Unable to save settings", err?.message || "Please try again.");
      } finally {
        if (isCurrent()) setSaving(false);
      }
    },
    [isCurrent, loadDashboard, user]
  );

  const updateReminderStatus = useCallback(
    async (reminderId: string, status: WellnessReminderStatus) => {
      if (!user || !isCurrent() || !data?.reminders.some(item => item.id === reminderId && item.userId === user.uid)) return;
      try {
        setSaving(true);
        await setWellnessReminderStatus(reminderId, status, user);
        await loadDashboard("refresh");
      } catch (err: any) {
        if (isCurrent()) Alert.alert("Unable to update reminder", err?.message || "Please try again.");
      } finally {
        if (isCurrent()) setSaving(false);
      }
    },
    [data, isCurrent, loadDashboard, user]
  );

  const ownsView = Boolean(user && user === auth.currentUser);
  return {
    data: ownsView && data?.userId === user?.uid ? data : null,
    loading: ownsView && loading,
    refreshing: ownsView && refreshing,
    saving: ownsView && saving,
    error: ownsView ? error : null,
    refresh,
    updateSettings,
    updateReminderStatus,
  };
}
