import { auth } from "../../firebase/firebaseConfig";
import {
  getLatestWellnessReminders,
  getSmartReminderSettings,
  saveSmartReminderSettings,
  saveWellnessReminders,
  updateWellnessReminderStatus,
} from "../../repositories/notificationRepository";
import {
  SmartNotificationDashboard,
  SmartNotificationStat,
  SmartReminderSettings,
  SmartReminderSettingsInput,
  WellnessReminder,
  WellnessReminderStatus,
} from "../../types";
import { buildSmartReminders } from "./reminderEngine";
import { syncNativeWellnessReminders } from "./nativeNotificationService";

type Owner = NonNullable<typeof auth.currentUser>;
let dashboardVersion = 0;
function assertOwner(owner: Owner | null, uid: string): asserts owner is Owner {
  if (!owner || auth.currentUser !== owner || owner.uid !== uid) {
    throw new Error("Sign in again to manage Smart reminders.");
  }
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Soon";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildStats(
  settings: SmartReminderSettings,
  reminders: WellnessReminder[]
): SmartNotificationStat[] {
  const activeCount = reminders.filter((item) => item.status === "scheduled").length;
  const completedCount = reminders.filter((item) => item.status === "completed").length;
  const smartCount = reminders.filter((item) => item.source === "ai_memory").length;

  return [
    {
      label: "Engine",
      value: settings.enabled ? "On" : "Off",
      helper: settings.enabled ? "Smart reminders active" : "All reminders paused",
    },
    {
      label: "Active",
      value: String(activeCount),
      helper: "Scheduled wellness nudges",
    },
    {
      label: "AI Powered",
      value: String(smartCount),
      helper: "Generated from AI memory",
    },
    {
      label: "Completed",
      value: String(completedCount),
      helper: "Healthy actions finished",
    },
  ];
}

function mergeGeneratedWithExisting(
  generated: WellnessReminder[],
  existing: WellnessReminder[]
): WellnessReminder[] {
  const existingById = new Map(existing.map((item) => [item.id, item]));

  return generated.map((item) => {
    const existingItem = existingById.get(item.id);

    if (!existingItem) return item;

    return {
      ...item,
      status: existingItem.status,
      completedAt: existingItem.completedAt,
      dismissedAt: existingItem.dismissedAt,
      createdAt: existingItem.createdAt,
      updatedAt: existingItem.updatedAt,
    };
  });
}

export async function getSmartNotificationDashboard(
  userId: string,
  owner = auth.currentUser,
): Promise<SmartNotificationDashboard> {
  assertOwner(owner, userId);
  const version = ++dashboardVersion;
  const isCurrent = () => auth.currentUser === owner && dashboardVersion === version;
  const assertCurrent = () => {
    if (!isCurrent()) throw new Error("Smart reminder refresh is no longer current.");
  };
  const settings = await getSmartReminderSettings(userId, assertCurrent);
  assertCurrent();
  if (settings.userId !== userId) throw new Error("Smart reminder settings are unavailable.");
  const [existingReminders, generatedReminders] = await Promise.all([
    getLatestWellnessReminders(userId, 30),
    buildSmartReminders(userId, settings),
  ]);

  assertCurrent();
  const reminders = mergeGeneratedWithExisting(
    generatedReminders.filter(item => item.userId === userId),
    existingReminders.filter(item => item.userId === userId),
  );

  if (reminders.length > 0) {
    await saveWellnessReminders(reminders);
  }

  assertCurrent();
  await syncNativeWellnessReminders(reminders, settings, owner, isCurrent);
  assertCurrent();

  const activeReminders = reminders.filter((item) => item.status === "scheduled");
  const completedReminders = reminders.filter((item) => item.status === "completed");
  const dismissedReminders = reminders.filter((item) => item.status === "dismissed");
  const nextReminder = activeReminders[0] ?? null;

  return {
    userId,
    generatedAt: new Date().toISOString(),
    settings,
    reminders,
    activeReminders,
    completedReminders,
    dismissedReminders,
    statistics: buildStats(settings, reminders),
    nextReminder: nextReminder
      ? {
          ...nextReminder,
          message: `${nextReminder.message} Scheduled at ${formatTime(nextReminder.scheduledFor)}.`,
        }
      : null,
  };
}

export async function updateSmartNotificationSettings(
  input: SmartReminderSettingsInput,
  owner = auth.currentUser,
): Promise<SmartReminderSettings> {
  assertOwner(owner, input.userId);
  ++dashboardVersion;
  return saveSmartReminderSettings(input, () => assertOwner(owner, input.userId));
}

export async function setWellnessReminderStatus(
  reminderId: string,
  status: WellnessReminderStatus,
  owner = auth.currentUser,
): Promise<void> {
  assertOwner(owner, owner?.uid ?? "");
  ++dashboardVersion;
  await updateWellnessReminderStatus(reminderId, status);
}
