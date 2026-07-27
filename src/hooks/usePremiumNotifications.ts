import { useCallback, useEffect, useState } from "react";

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
  const [reminders, setReminders] = useState<PremiumReminder[]>([]);
  const [settings, setSettings] = useState<PremiumNotificationSettings>({
    quietHoursEnabled: true,
    quietStartHour: 22,
    quietEndHour: 7,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await seedRecommendedReminders();
      const [items, nextSettings] = await Promise.all([
        getPremiumReminders(),
        getPremiumNotificationSettings(),
      ]);
      setReminders(items);
      setSettings(nextSettings);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load reminders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggle = useCallback(async (id: string, enabled: boolean) => {
    setError(null);
    try {
      await togglePremiumReminder(id, enabled);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update reminder.");
    }
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deletePremiumReminder(id);
    await refresh();
  }, [refresh]);

  const saveSettings = useCallback(async (next: PremiumNotificationSettings) => {
    await savePremiumNotificationSettings(next);
    setSettings(next);
  }, []);

  return {
    reminders,
    settings,
    loading,
    error,
    refresh,
    toggle,
    remove,
    saveSettings,
    upsertPremiumReminder,
  };
}
