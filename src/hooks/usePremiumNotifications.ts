import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebaseConfig";

import {
  deletePremiumReminder,
  getPremiumNotificationSettings,
  getPremiumReminders,
  PremiumNotificationSettings,
  PremiumReminder,
  savePremiumNotificationSettings,
  seedRecommendedReminders,
  togglePremiumReminder,
  upsertPremiumReminder,
} from "../services/notifications2";

export function usePremiumNotifications() {
  const { user } = useAuth();
  const mounted = useRef(true);
  const isCurrent = useCallback(() => mounted.current && Boolean(user && auth.currentUser === user), [user]);
  const [reminders, setReminders] = useState<PremiumReminder[]>([]);
  const [settings, setSettings] = useState<PremiumNotificationSettings>({
    quietHoursEnabled: true,
    quietStartHour: 22,
    quietEndHour: 7,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isCurrent()) return;
    setLoading(true);
    setError(null);

    try {
      await seedRecommendedReminders(user);
      const [items, nextSettings] = await Promise.all([
        getPremiumReminders(user),
        getPremiumNotificationSettings(user),
      ]);
      if (!isCurrent()) return;
      setReminders(items);
      setSettings(nextSettings);
    } catch (reason) {
      if (isCurrent()) setError(reason instanceof Error ? reason.message : "Could not load reminders.");
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, [isCurrent, user]);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    return () => { mounted.current = false; };
  }, [isCurrent, refresh, user]);

  const toggle = useCallback(async (id: string, enabled: boolean) => {
    if (!isCurrent()) return;
    setError(null);
    try {
      await togglePremiumReminder(id, enabled, user);
      await refresh();
    } catch (reason) {
      if (isCurrent()) setError(reason instanceof Error ? reason.message : "Could not update reminder.");
    }
  }, [isCurrent, refresh, user]);

  const remove = useCallback(async (id: string) => {
    if (!isCurrent()) return;
    await deletePremiumReminder(id, user);
    await refresh();
  }, [isCurrent, refresh, user]);

  const saveSettings = useCallback(async (next: PremiumNotificationSettings) => {
    if (!isCurrent()) return;
    try {
      await savePremiumNotificationSettings(next, user);
      if (isCurrent()) setSettings(next);
    } catch (reason) {
      if (isCurrent()) setError(reason instanceof Error ? reason.message : "Could not update quiet hours.");
    }
  }, [isCurrent, user]);

  return {
    reminders,
    settings,
    loading,
    error,
    refresh,
    toggle,
    remove,
    saveSettings,
    upsertPremiumReminder: (input: Parameters<typeof upsertPremiumReminder>[0]) => upsertPremiumReminder(input, user),
  };
}
