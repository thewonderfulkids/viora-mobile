import { getMemoryDashboard } from "../../repositories/memoryRepository";
import { getUserProfile } from "../../repositories/userRepository";
import {
  SmartReminderSettings,
  WellnessReminder,
  WellnessReminderPriority,
  WellnessReminderType,
} from "../../types";

const DAY_MS = 24 * 60 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function parseTimeParts(value: string) {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  return {
    hour: Number.isFinite(hour) ? Math.min(23, Math.max(0, hour)) : 9,
    minute: Number.isFinite(minute) ? Math.min(59, Math.max(0, minute)) : 0,
  };
}

function scheduleForTodayOrTomorrow(timeValue: string) {
  const { hour, minute } = parseTimeParts(timeValue);
  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  if (date.getTime() <= Date.now()) {
    date.setTime(date.getTime() + DAY_MS);
  }

  return date.toISOString();
}

function stableReminderId(userId: string, type: WellnessReminderType, scheduledFor: string) {
  const dateKey = scheduledFor.slice(0, 10);
  return `${userId}_${type}_${dateKey}`;
}

function getPriorityFromConfidence(confidence?: number): WellnessReminderPriority {
  if (!confidence) return "medium";
  if (confidence >= 0.9) return "high";
  if (confidence >= 0.75) return "medium";
  return "low";
}

function createReminder(params: {
  userId: string;
  type: WellnessReminderType;
  title: string;
  message: string;
  actionLabel: string;
  actionRoute: string;
  priority: WellnessReminderPriority;
  scheduledFor: string;
  source: WellnessReminder["source"];
  cadence: WellnessReminder["cadence"];
  metadata?: WellnessReminder["metadata"];
}): WellnessReminder {
  const now = nowIso();

  return {
    id: stableReminderId(params.userId, params.type, params.scheduledFor),
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    actionLabel: params.actionLabel,
    actionRoute: params.actionRoute,
    priority: params.priority,
    status: "scheduled",
    source: params.source,
    channel: "in_app",
    cadence: params.cadence,
    scheduledFor: params.scheduledFor,
    completedAt: null,
    dismissedAt: null,
    createdAt: now,
    updatedAt: now,
    metadata: {
      familyReady: true,
      voiceReady: true,
      premiumOnly: false,
      ...(params.metadata ?? {}),
    },
  };
}

export async function buildSmartReminders(
  userId: string,
  settings: SmartReminderSettings
): Promise<WellnessReminder[]> {
  if (!settings.enabled) return [];

  const [userProfile, memoryDashboard] = await Promise.all([
    getUserProfile(userId),
    getMemoryDashboard(userId),
  ]);

  const reminders: WellnessReminder[] = [];

  if (settings.hydration.enabled) {
    const waterGoal = userProfile?.waterGoalMl ?? 2500;
    const scheduledFor = scheduleForTodayOrTomorrow(settings.hydration.preferredTime);

    reminders.push(
      createReminder({
        userId,
        type: "hydration",
        title: "Hydration check-in",
        message: `Your daily water target is ${waterGoal} ml. Log your first glass and keep the streak alive.`,
        actionLabel: "Log water",
        actionRoute: "/hydration",
        priority: "medium",
        scheduledFor,
        source: "user_settings",
        cadence: "daily",
        metadata: {
          targetValue: waterGoal,
          targetUnit: "ml",
        },
      })
    );
  }

  if (settings.sleep.enabled) {
    const preferredSleepTime = userProfile?.sleepTime || settings.sleep.preferredTime;
    const scheduledFor = scheduleForTodayOrTomorrow(preferredSleepTime);

    reminders.push(
      createReminder({
        userId,
        type: "sleep",
        title: "Sleep wind-down",
        message: "Start your sleep routine early so tomorrow's wellness score has a better base.",
        actionLabel: "Plan sleep",
        actionRoute: "/sleep",
        priority: userProfile?.goal === "Improve Sleep" ? "high" : "medium",
        scheduledFor,
        source: "user_settings",
        cadence: "daily",
        metadata: {
          targetUnit: "routine",
        },
      })
    );
  }

  if (settings.yoga.enabled) {
    const scheduledFor = scheduleForTodayOrTomorrow(settings.yoga.preferredTime);

    reminders.push(
      createReminder({
        userId,
        type: "yoga",
        title: "Movement session",
        message: "A short yoga or breathing session can improve your day without needing gym equipment.",
        actionLabel: "Start yoga",
        actionRoute: "/yoga",
        priority: userProfile?.goal === "Stay Active" || userProfile?.goal === "Stress Relief" ? "high" : "medium",
        scheduledFor,
        source: "user_settings",
        cadence: "daily",
        metadata: {
          targetUnit: "minutes",
        },
      })
    );
  }

  if (settings.aiMemory.enabled && memoryDashboard.recommendations.length > 0) {
    const topRecommendation = memoryDashboard.recommendations[0];
    const scheduledFor = scheduleForTodayOrTomorrow(settings.aiMemory.preferredTime);

    reminders.push(
      createReminder({
        userId,
        type: "ai_memory",
        title: topRecommendation.title,
        message: topRecommendation.description,
        actionLabel: topRecommendation.actionLabel,
        actionRoute: "/ai-memory",
        priority: topRecommendation.priority,
        scheduledFor,
        source: "ai_memory",
        cadence: "smart",
        metadata: {
          recommendationId: topRecommendation.id,
          confidence: memoryDashboard.confidenceAverage,
          premiumOnly: false,
        },
      })
    );
  }

  if (settings.weeklyInsight.enabled && memoryDashboard.weeklyInsights.length > 0) {
    const topInsight = memoryDashboard.weeklyInsights[0];
    const scheduledFor = scheduleForTodayOrTomorrow(settings.weeklyInsight.preferredTime);

    reminders.push(
      createReminder({
        userId,
        type: "weekly_insight",
        title: topInsight.title,
        message: topInsight.description,
        actionLabel: "View memory",
        actionRoute: "/ai-memory",
        priority: getPriorityFromConfidence(topInsight.confidence),
        scheduledFor,
        source: "ai_memory",
        cadence: "weekly",
        metadata: {
          confidence: topInsight.confidence,
          premiumOnly: true,
        },
      })
    );
  }

  return reminders.sort(
    (a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );
}
