import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { auth } from "../../firebase/firebaseConfig";

import { getRotatingReminderBody } from "./messages";
import {
  PremiumNotificationSettings,
  PremiumReminder,
  PremiumReminderCategory,
  ReminderDeliveryRecord,
} from "./types";

const LEGACY_REMINDERS_KEY = "@viora/premium-reminders-v2";
const SOURCE = "viora-premium-reminder-v3";
type Owner = NonNullable<typeof auth.currentUser>;

function accountKey(owner: Owner, data: string) {
  return `@viora/premium-v3/${encodeURIComponent(owner.uid)}/${data}`;
}

function checkOwner(owner: Owner | null): asserts owner is Owner {
  if (!owner || auth.currentUser !== owner) {
    throw new Error("Sign in again before changing this reminder.");
  }
}

// A single device-wide queue serializes native reconcile, edit, and delete.
let work: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const next = work.then(task);
  work = next.catch(() => undefined);
  return next;
}

async function readJson(key: string): Promise<unknown> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function list<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export const DEFAULT_PREMIUM_NOTIFICATION_SETTINGS: PremiumNotificationSettings = {
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

async function loadSettings(owner: Owner): Promise<PremiumNotificationSettings> {
  const value = await readJson(accountKey(owner, "settings"));
  return { ...DEFAULT_PREMIUM_NOTIFICATION_SETTINGS, ...(value as Partial<PremiumNotificationSettings> | null) };
}

export async function getPremiumNotificationSettings(owner = auth.currentUser) {
  const next = owner && auth.currentUser === owner ? await loadSettings(owner) : null;
  return auth.currentUser === owner && next ? next : { ...DEFAULT_PREMIUM_NOTIFICATION_SETTINGS };
}

export function savePremiumNotificationSettings(settings: PremiumNotificationSettings, owner = auth.currentUser) {
  return serial(async () => {
    checkOwner(owner);
    await AsyncStorage.setItem(accountKey(owner, "settings"), JSON.stringify(settings));
  });
}

async function loadReminders(owner: Owner) {
  return list<PremiumReminder>(await readJson(accountKey(owner, "reminders")));
}

export async function getPremiumReminders(owner = auth.currentUser): Promise<PremiumReminder[]> {
  if (!owner || auth.currentUser !== owner) return [];
  const rows = await loadReminders(owner);
  return auth.currentUser === owner ? rows : [];
}

async function saveReminders(owner: Owner, reminders: PremiumReminder[]) {
  await AsyncStorage.setItem(accountKey(owner, "reminders"), JSON.stringify(reminders));
}

async function addAnalytics(owner: Owner, records: ReminderDeliveryRecord[]) {
  const key = accountKey(owner, "analytics");
  const existing = list<ReminderDeliveryRecord>(await readJson(key));
  await AsyncStorage.setItem(key, JSON.stringify([...records, ...existing].slice(0, 500)));
}

export async function getReminderAnalytics(owner = auth.currentUser) {
  if (!owner || auth.currentUser !== owner) return [];
  const rows = list<ReminderDeliveryRecord>(await readJson(accountKey(owner, "analytics")));
  return auth.currentUser === owner ? rows : [];
}

async function cancelNotificationIds(ids: string[]) {
  await Promise.all(ids.map(id => Notifications.cancelScheduledNotificationAsync(id)));
}

export function deletePremiumReminder(id: string, owner = auth.currentUser) {
  return serial(async () => {
    checkOwner(owner);
    const reminders = await loadReminders(owner);
    checkOwner(owner);
    const target = reminders.find(item => item.id === id);
    if (!target) return;
    await cancelNotificationIds(target.notificationIds);
    checkOwner(owner);
    await saveReminders(owner, reminders.filter(item => item.id !== id));
  });
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

type ReminderInput = Pick<PremiumReminder, "category" | "hour" | "minute" | "weekdays" |
  "enabled" | "sound" | "vibration"> & { id?: string };

function deliveryDays(days: number[]) {
  return days.length ? [...new Set(days)] : [1, 2, 3, 4, 5, 6, 7];
}

async function scheduleReminder(owner: Owner, reminder: PremiumReminder, ids: string[]) {
  const records: ReminderDeliveryRecord[] = [];
  for (const weekday of deliveryDays(reminder.weekdays)) {
    checkOwner(owner);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.body,
        sound: reminder.sound ? "default" : undefined,
        data: {
          source: SOURCE,
          actionRoute: reminder.deepLink,
          userId: owner.uid,
          reminderId: reminder.id,
          category: reminder.category,
        },
        ...(Platform.OS === "android" ? {
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: reminder.vibration ? [0, 250, 120, 250] : undefined,
        } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: reminder.hour,
        minute: reminder.minute,
        ...(Platform.OS === "android" ? { channelId: "viora-premium-reminders" } : {}),
      },
    });
    ids.push(notificationId);
    checkOwner(owner);
    records.push({
      id: `${reminder.id}-${weekday}`, reminderId: reminder.id, category: reminder.category,
      scheduledFor: `weekday:${weekday} ${String(reminder.hour).padStart(2, "0")}:${String(reminder.minute).padStart(2, "0")}`,
      status: "scheduled",
    });
  }
  return records;
}

async function upsert(owner: Owner, input: ReminderInput) {
  checkOwner(owner);
  const reminders = await loadReminders(owner);
  const previous = input.id ? reminders.find(item => item.id === input.id) : undefined;
  if (input.id && !previous) throw new Error("This reminder is not available for this account.");
  const meta = CATEGORY_META[input.category];
  const notificationIds: string[] = [];
  const reminder: PremiumReminder = {
    ...input, id: previous?.id ?? createId(), title: meta.title, body: getRotatingReminderBody(input.category),
    deepLink: meta.deepLink, createdAt: previous?.createdAt ?? new Date().toISOString(), notificationIds,
  };
  let analytics: ReminderDeliveryRecord[] = [];
  try {
    if (input.enabled) {
      const settings = await loadSettings(owner);
      checkOwner(owner);
      if (isInsideQuietHours(input.hour, settings)) throw new Error("This reminder time falls inside your quiet hours.");
      const granted = await requestPremiumNotificationPermission();
      checkOwner(owner);
      if (!granted) throw new Error("Notification permission was not granted.");
      analytics = await scheduleReminder(owner, reminder, notificationIds);
    }
    checkOwner(owner);
    await saveReminders(owner, [reminder, ...reminders.filter(item => item.id !== reminder.id)]);
  } catch (error) {
    await cancelNotificationIds(notificationIds).catch(() => undefined);
    throw error;
  }
  // If persistence succeeds right as Auth changes, keep the owner-scoped
  // preference but remove its native jobs. The next matching login restores it.
  if (auth.currentUser !== owner) await cancelNotificationIds(notificationIds);
  if (previous) await cancelNotificationIds(previous.notificationIds);
  if (analytics.length) await addAnalytics(owner, analytics);
  checkOwner(owner);
  return reminder;
}

export function upsertPremiumReminder(input: ReminderInput, owner = auth.currentUser) {
  return serial(async () => { checkOwner(owner); return upsert(owner, input); });
}

export function togglePremiumReminder(id: string, enabled: boolean, owner = auth.currentUser) {
  return serial(async () => {
    checkOwner(owner);
    const target = (await loadReminders(owner)).find(item => item.id === id);
    checkOwner(owner);
    if (!target) return;
    return upsert(owner, { ...target, enabled });
  });
}

export function seedRecommendedReminders(owner = auth.currentUser) {
  return serial(async () => {
    if (!owner || auth.currentUser !== owner) return [];
    const reminders = await loadReminders(owner);
    if (auth.currentUser !== owner) return [];
    if (reminders.length) return reminders;
    const defaults = [
      { category: "morning" as const, hour: 8 }, { category: "hydration" as const, hour: 11 },
      { category: "steps" as const, hour: 18 }, { category: "night" as const, hour: 22 },
    ];
    const rows = defaults.map(({ category, hour }): PremiumReminder => ({
      id: createId(), category, hour, minute: 0, weekdays: deliveryDays([]),
      enabled: false, sound: true, vibration: true, createdAt: new Date().toISOString(),
      title: CATEGORY_META[category].title, body: getRotatingReminderBody(category),
      deepLink: CATEGORY_META[category].deepLink, notificationIds: [],
    }));
    await saveReminders(owner, rows);
    return auth.currentUser === owner ? rows : [];
  });
}

export function reconcilePremiumNotificationSession() {
  return serial(async () => {
    if (Platform.OS !== "android" && Platform.OS !== "ios") return;
    const owner = auth.currentUser;
    const v2 = list<Partial<PremiumReminder>>(await readJson(LEGACY_REMINDERS_KEY).catch(() => null));
    const legacyByNativeId = new Map<string, string>();
    for (const row of v2) {
      if (typeof row?.id !== "string" || !Array.isArray(row.notificationIds)) continue;
      for (const nativeId of row.notificationIds) if (typeof nativeId === "string") legacyByNativeId.set(nativeId, row.id);
    }
    const isLegacy = (request: Notifications.NotificationRequest) => {
      const data = request.content.data;
      return data?.source !== SOURCE && typeof data?.reminderId === "string" &&
        (legacyByNativeId.get(request.identifier) === data.reminderId || data.reminderId.startsWith("viora-reminder-"));
    };
    const [scheduledResult, presentedResult] = await Promise.allSettled([
      Notifications.getAllScheduledNotificationsAsync(), Notifications.getPresentedNotificationsAsync(),
    ]);
    const scheduled = scheduledResult.status === "fulfilled" ? scheduledResult.value : [];
    const presented = presentedResult.status === "fulfilled" ? presentedResult.value : [];
    const rows = owner ? await loadReminders(owner).catch(() => null) : [];
    if (auth.currentUser !== owner) return; // The auth listener queues a newer reconciliation.
    const desiredIds = new Set(rows?.filter(row => row.enabled).flatMap(row => row.notificationIds));
    const keptIds = new Set<string>();
    const cancel: string[] = [];
    for (const job of scheduled) {
      const data = job.content.data;
      if (isLegacy(job)) cancel.push(job.identifier);
      else if (data?.source === SOURCE) {
        if (owner && data.userId === owner.uid && (!rows || desiredIds.has(job.identifier))) keptIds.add(job.identifier);
        else cancel.push(job.identifier);
      }
    }
    const dismiss = presented.filter(({ request }) => isLegacy(request) ||
      (request.content.data?.source === SOURCE && (!owner || request.content.data.userId !== owner.uid)));
    // One native failure must not prevent cleanup of other scheduled or delivered items.
    const cleanup = await Promise.allSettled([
      ...cancel.map(id => Notifications.cancelScheduledNotificationAsync(id)),
      ...dismiss.map(({ request }) => Notifications.dismissNotificationAsync(request.identifier)),
    ]);
    if (scheduledResult.status === "rejected" || presentedResult.status === "rejected" ||
        cleanup.some(result => result.status === "rejected")) throw new Error("Could not reconcile reminders on this device.");
    if (!owner || auth.currentUser !== owner || !rows?.some(row => row.enabled)) return;
    if (!(await Notifications.getPermissionsAsync()).granted || auth.currentUser !== owner) return;
    await ensurePremiumNotificationChannel();
    for (const row of rows) {
      if (!row.enabled || auth.currentUser !== owner) continue;
      if (row.notificationIds.length === deliveryDays(row.weekdays).length &&
          row.notificationIds.every(id => keptIds.has(id))) continue;
      const replacementIds: string[] = [];
      try {
        await scheduleReminder(owner, row, replacementIds);
        checkOwner(owner);
        await saveReminders(owner, rows.map(old => old.id === row.id ? { ...old, notificationIds: replacementIds } : old));
      } catch (error) {
        await cancelNotificationIds(replacementIds).catch(() => undefined);
        throw error;
      }
      const oldIds = row.notificationIds.filter(id => keptIds.has(id));
      row.notificationIds = replacementIds;
      await cancelNotificationIds(oldIds);
      if (auth.currentUser !== owner) await cancelNotificationIds(replacementIds);
    }
  });
}
