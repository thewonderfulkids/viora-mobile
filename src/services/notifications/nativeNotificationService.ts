import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { SmartReminderSettings, WellnessReminder } from "../../types";

const ANDROID_CHANNEL_ID = "viora-reminders-v3";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function isNativeRuntime() {
  return Platform.OS === "android" || Platform.OS === "ios";
}

function isFutureDate(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time > Date.now();
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Viora Wellness Reminders",
    description: "Hydration, sleep, yoga and AI wellness reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 180, 250],
    lightColor: "#0B6E4F",
    sound: "default",
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function initializeNativeNotificationRuntime(): Promise<void> {
  if (!isNativeRuntime()) return;
  await ensureAndroidChannel();
}

export async function requestWellnessNotificationPermission(): Promise<boolean> {
  if (!isNativeRuntime()) return false;

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  return requested.granted;
}

export async function getWellnessNotificationPermissionStatus() {
  if (!isNativeRuntime()) return "unsupported" as const;
  const permission = await Notifications.getPermissionsAsync();
  return permission.granted ? ("granted" as const) : ("denied" as const);
}

async function cancelExistingVioraReminderNotifications() {
  if (!isNativeRuntime()) return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((item) => Boolean(item.content?.data?.vioraReminderId))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
  );
}

function buildNotificationBody(reminder: WellnessReminder) {
  if (reminder.type === "hydration") {
    return reminder.message || "Time to drink water and keep your hydration streak alive.";
  }

  return reminder.message;
}

function buildNativeTrigger(reminder: WellnessReminder): Notifications.NotificationTriggerInput {
  const date = new Date(reminder.scheduledFor);
  const hour = date.getHours();
  const minute = date.getMinutes();

  if (reminder.cadence === "daily") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: ANDROID_CHANNEL_ID,
    } as Notifications.NotificationTriggerInput;
  }

  if (reminder.cadence === "weekly") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: date.getDay() + 1,
      hour,
      minute,
      channelId: ANDROID_CHANNEL_ID,
    } as Notifications.NotificationTriggerInput;
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date,
    channelId: ANDROID_CHANNEL_ID,
  } as Notifications.NotificationTriggerInput;
}

export async function syncNativeWellnessReminders(
  reminders: WellnessReminder[],
  settings: SmartReminderSettings
): Promise<void> {
  if (!isNativeRuntime()) return;

  await cancelExistingVioraReminderNotifications();

  if (!settings.enabled) return;

  const granted = await requestWellnessNotificationPermission();
  if (!granted) return;

  const activeReminders = reminders.filter(
    (item) => item.status === "scheduled" && isFutureDate(item.scheduledFor)
  );

  await Promise.all(
    activeReminders.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: buildNotificationBody(reminder),
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            vioraReminderId: reminder.id,
            type: reminder.type,
            actionRoute: reminder.actionRoute,
            userId: reminder.userId,
          },
        },
        trigger: buildNativeTrigger(reminder),
      })
    )
  );
}

export async function scheduleWellnessTestNotification(): Promise<boolean> {
  if (!isNativeRuntime()) return false;
  const granted = await requestWellnessNotificationPermission();
  if (!granted) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Viora reminder test",
      body: "Notifications are ready on this device.",
      sound: "default",
      data: { actionRoute: "/smart-notifications", vioraTest: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      repeats: false,
      channelId: ANDROID_CHANNEL_ID,
    } as Notifications.NotificationTriggerInput,
  });

  return true;
}
