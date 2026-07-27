import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { getRotatingReminderBody } from "./messages";
import {
  PremiumNotificationSettings,
  PremiumReminder,
  PremiumReminderCategory,
  ReminderDeliveryRecord,
} from "./types";

const REMINDERS_KEY = "@viora/premium-reminders-v2";
const SETTINGS_KEY = "@viora/premium-reminder-settings-v2";
const ANALYTICS_KEY = "@viora/premium-reminder-analytics-v2";

const DEFAULT_SETTINGS: PremiumNotificationSettings = {
  quietHoursEnabled: true,
  quietStartHour: 22,
  quietEndHour: 7,
};

const CATEGORY_META: Record<
  PremiumReminderCategory,
  { title: string; deepLink: string }
> = {
  hydration: { title: "Time to hydrate", deepLink: "/hydration" },
  meditation: { title: "A mindful pause", deepLink: "/meditation" },
  sleep: { title: "Begin your wind-down", deepLink: "/sleep" },
  workout: { title: "Move with Viora", deepLink: "/home-workout" },
  steps: { title: "Keep moving", deepLink: "/steps" },
  habit: { title: "Your habit check-in", deepLink: "/goals-habits" },
  morning: { title: "Good morning", deepLink: "/(tabs)" },
  night: { title: "Evening reflection", deepLink: "/mental-wellness" },
};

function createId() {
  return `viora-reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function ensurePremiumNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("viora-premium-reminders", {
    name: "Viora Wellness Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 120, 250],
    lightColor: "#0B7A57",
    sound: "default",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestPremiumNotificationPermission() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    await ensurePremiumNotificationChannel();
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) {
    await ensurePremiumNotificationChannel();
  }
  return requested.granted;
}

export async function getPremiumNotificationSettings() {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;

  try {
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<PremiumNotificationSettings>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function savePremiumNotificationSettings(
  settings: PremiumNotificationSettings,
) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function getPremiumReminders(): Promise<PremiumReminder[]> {
  const raw = await AsyncStorage.getItem(REMINDERS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as PremiumReminder[];
  } catch {
    return [];
  }
}

async function saveReminders(reminders: PremiumReminder[]) {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

async function addAnalytics(records: ReminderDeliveryRecord[]) {
  const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
  const existing = raw ? (JSON.parse(raw) as ReminderDeliveryRecord[]) : [];
  await AsyncStorage.setItem(
    ANALYTICS_KEY,
    JSON.stringify([...records, ...existing].slice(0, 500)),
  );
}

export async function getReminderAnalytics() {
  const raw = await AsyncStorage.getItem(ANALYTICS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as ReminderDeliveryRecord[];
  } catch {
    return [];
  }
}

async function cancelNotificationIds(ids: string[]) {
  await Promise.all(
    ids.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined),
    ),
  );
}

export async function deletePremiumReminder(id: string) {
  const reminders = await getPremiumReminders();
  const target = reminders.find((item) => item.id === id);

  if (target) {
    await cancelNotificationIds(target.notificationIds);
  }

  await saveReminders(reminders.filter((item) => item.id !== id));
}

function isInsideQuietHours(
  hour: number,
  settings: PremiumNotificationSettings,
) {
  if (!settings.quietHoursEnabled) return false;

  if (settings.quietStartHour === settings.quietEndHour) return false;

  if (settings.quietStartHour < settings.quietEndHour) {
    return hour >= settings.quietStartHour && hour < settings.quietEndHour;
  }

  return hour >= settings.quietStartHour || hour < settings.quietEndHour;
}

export async function upsertPremiumReminder(input: {
  id?: string;
  category: PremiumReminderCategory;
  hour: number;
  minute: number;
  weekdays: number[];
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
}) {
  const permissionGranted = await requestPremiumNotificationPermission();
  if (!permissionGranted) {
    throw new Error("Notification permission was not granted.");
  }

  const settings = await getPremiumNotificationSettings();
  if (isInsideQuietHours(input.hour, settings)) {
    throw new Error("This reminder time falls inside your quiet hours.");
  }

  const reminders = await getPremiumReminders();
  const previous = input.id
    ? reminders.find((item) => item.id === input.id)
    : undefined;

  if (previous) {
    await cancelNotificationIds(previous.notificationIds);
  }

  const id = previous?.id ?? createId();
  const meta = CATEGORY_META[input.category];
  const title = meta.title;
  const body = getRotatingReminderBody(input.category);
  const notificationIds: string[] = [];
  const analytics: ReminderDeliveryRecord[] = [];

  if (input.enabled) {
    const weekdays = input.weekdays.length > 0 ? input.weekdays : [1, 2, 3, 4, 5, 6, 7];

    for (const weekday of weekdays) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: input.sound ? "default" : undefined,
          data: {
            deepLink: meta.deepLink,
            reminderId: id,
            category: input.category,
          },
          ...(Platform.OS === "android"
            ? {
                priority: Notifications.AndroidNotificationPriority.HIGH,
                vibrate: input.vibration ? [0, 250, 120, 250] : undefined,
              }
            : {}),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour: input.hour,
          minute: input.minute,
          ...(Platform.OS === "android"
            ? { channelId: "viora-premium-reminders" }
            : {}),
        },
      });

      notificationIds.push(notificationId);
      analytics.push({
        id: `${id}-${weekday}`,
        reminderId: id,
        category: input.category,
        scheduledFor: `weekday:${weekday} ${String(input.hour).padStart(2, "0")}:${String(input.minute).padStart(2, "0")}`,
        status: "scheduled",
      });
    }
  }

  const reminder: PremiumReminder = {
    id,
    category: input.category,
    title,
    body,
    hour: input.hour,
    minute: input.minute,
    enabled: input.enabled,
    weekdays: input.weekdays,
    deepLink: meta.deepLink,
    sound: input.sound,
    vibration: input.vibration,
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    notificationIds,
  };

  await saveReminders([
    reminder,
    ...reminders.filter((item) => item.id !== id),
  ]);

  if (analytics.length > 0) {
    await addAnalytics(analytics);
  }

  return reminder;
}

export async function togglePremiumReminder(id: string, enabled: boolean) {
  const reminders = await getPremiumReminders();
  const target = reminders.find((item) => item.id === id);
  if (!target) return;

  return upsertPremiumReminder({
    id: target.id,
    category: target.category,
    hour: target.hour,
    minute: target.minute,
    weekdays: target.weekdays,
    enabled,
    sound: target.sound,
    vibration: target.vibration,
  });
}

export async function seedRecommendedReminders() {
  const reminders = await getPremiumReminders();
  if (reminders.length > 0) return reminders;

  const defaults = [
    { category: "morning" as const, hour: 8, minute: 0, weekdays: [1,2,3,4,5,6,7] },
    { category: "hydration" as const, hour: 11, minute: 0, weekdays: [1,2,3,4,5,6,7] },
    { category: "steps" as const, hour: 18, minute: 0, weekdays: [1,2,3,4,5,6,7] },
    { category: "night" as const, hour: 22, minute: 0, weekdays: [1,2,3,4,5,6,7] },
  ];

  for (const item of defaults) {
    try {
      await upsertPremiumReminder({
        ...item,
        enabled: false,
        sound: true,
        vibration: true,
      });
    } catch {
      // Seeding should never block the Notification Center.
    }
  }

  return getPremiumReminders();
}
