import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { auth } from "../../firebase/firebaseConfig";
import { SmartReminderSettings, WellnessReminder } from "../../types";

const ANDROID_CHANNEL_ID = "viora-reminders-v3";

let nativeWork: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const result = nativeWork.then(task);
  nativeWork = result.catch(() => undefined);
  return result;
}

function isSmart(request: Notifications.NotificationRequest) {
  const data = request.content.data;
  return typeof data?.vioraReminderId === "string" || data?.vioraTest === true;
}

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const request = notification.request;
    const show = !isSmart(request) || (!!auth.currentUser && request.content.data?.userId === auth.currentUser.uid);
    return {
      shouldShowAlert: show,
      shouldPlaySound: show,
      shouldSetBadge: false,
      shouldShowBanner: show,
      shouldShowList: show,
    };
  },
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

export function reconcileNativeSmartNotifications() {
  return serial(async () => {
    if (!isNativeRuntime()) return;
    const [pending, presented] = await Promise.allSettled([
      Notifications.getAllScheduledNotificationsAsync(),
      Notifications.getPresentedNotificationsAsync(),
    ]);
    // Read the current auth state after the native reads, not when work queued.
    const { uid } = auth.currentUser ?? {};
    const shouldRemove = (request: Notifications.NotificationRequest) =>
      isSmart(request) && (!uid || request.content.data?.userId !== uid);
    const results = await Promise.allSettled([
      ...(pending.status === "fulfilled" ? pending.value.filter(shouldRemove)
        .map(job => Notifications.cancelScheduledNotificationAsync(job.identifier)) : []),
      ...(presented.status === "fulfilled" ? presented.value.map(item => item.request).filter(shouldRemove)
        .map(job => Notifications.dismissNotificationAsync(job.identifier)) : []),
    ]);
    if (pending.status === "rejected" || presented.status === "rejected" ||
        results.some(result => result.status === "rejected")) throw new Error("Could not reconcile Smart reminders.");
  });
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

export function syncNativeWellnessReminders(
  reminders: WellnessReminder[],
  settings: SmartReminderSettings,
  owner = auth.currentUser,
  stillCurrent = () => true,
): Promise<void> {
  const active = () => Boolean(owner && auth.currentUser === owner &&
    settings.userId === owner.uid && stillCurrent());
  return serial(async () => {
    if (!isNativeRuntime() || !owner || !active()) return;
    const uid = owner.uid;
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (!active()) return;
    // Capture only this owner's repeating/one-shot Smart jobs. Never touch
    // another account, test alert or Premium job through a dashboard refresh.
    const previous = scheduled.filter(job => typeof job.content.data?.vioraReminderId === "string" &&
      job.content.data.userId === uid);
    if (!settings.enabled) {
      const results = await Promise.allSettled(previous.map(job => Notifications.cancelScheduledNotificationAsync(job.identifier)));
      if (results.some(result => result.status === "rejected")) throw new Error("Could not disable all Smart reminders; retry required.");
      return;
    }
    if (!(await requestWellnessNotificationPermission()) || !active()) return;
    const nextIds: string[] = [];
    const seenReminderIds = new Set<string>();
    let committed = false;
    let replacementReady = false;
    try {
      for (const reminder of reminders) {
        if (!active()) return;
        if (reminder.userId !== uid || reminder.status !== "scheduled" || !isFutureDate(reminder.scheduledFor)) continue;
        if (seenReminderIds.has(reminder.id)) continue;
        seenReminderIds.add(reminder.id);
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: buildNotificationBody(reminder),
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: { vioraReminderId: reminder.id, type: reminder.type, actionRoute: reminder.actionRoute, userId: uid },
          },
          trigger: buildNativeTrigger(reminder),
        });
        nextIds.push(notificationId);
      }
      if (!active()) return;
      // Once the full replacement exists, retain it on partial cancellation failure.
      // A subsequent sync enumerates both generations and reconciles them.
      replacementReady = true;
      const cancellations = await Promise.allSettled(previous.map(job => Notifications.cancelScheduledNotificationAsync(job.identifier)));
      committed = active();
      if (cancellations.some(result => result.status === "rejected")) throw new Error("Could not replace all Smart reminders; retry required.");
    } finally {
      if (!committed && (!replacementReady || !active())) await Promise.allSettled(nextIds.map(id => Notifications.cancelScheduledNotificationAsync(id)));
    }
  });
}

export function scheduleWellnessTestNotification(owner = auth.currentUser): Promise<boolean> {
  return serial(async () => {
    if (!isNativeRuntime() || !owner || auth.currentUser !== owner) return false;
    const granted = await requestWellnessNotificationPermission();
    if (!granted || auth.currentUser !== owner) return false;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Viora reminder test",
        body: "Notifications are ready on this device.",
        sound: "default",
        data: { actionRoute: "/smart-notifications", vioraTest: true, userId: owner.uid },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
        repeats: false,
        channelId: ANDROID_CHANNEL_ID,
      } as Notifications.NotificationTriggerInput,
    });

    if (auth.currentUser !== owner) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
      return false;
    }
    return true;
  });
}
