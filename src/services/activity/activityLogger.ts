import { logWellnessActivity } from "./activityService";

type BaseActivityInput = {
  userId: string;
  note?: string | null;
  metadata?: Record<string, unknown>;
};

export const ActivityLogger = {
  hydration: async ({
    userId,
    amountMl,
    direction,
  }: BaseActivityInput & {
    amountMl: number;
    direction: "add" | "remove";
  }) => {
    return logWellnessActivity({
      userId,
      type: "hydration",
      value: amountMl,
      unit: "ml",
      source: "manual",
      note: direction === "add" ? "Hydration added" : "Hydration removed",
      metadata: { direction },
    });
  },

  sleep: async ({
    userId,
    minutes,
    sleepStart,
    sleepEnd,
    quality,
  }: BaseActivityInput & {
    minutes: number;
    sleepStart: string;
    sleepEnd: string;
    quality: string;
  }) => {
    return logWellnessActivity({
      userId,
      type: "sleep",
      value: minutes,
      unit: "minutes",
      source: "manual",
      note: "Sleep logged",
      metadata: { sleepStart, sleepEnd, quality },
    });
  },

  yoga: async ({
    userId,
    minutes,
    sessionId,
    title,
    steps,
  }: BaseActivityInput & {
    minutes: number;
    sessionId: string;
    title: string;
    steps: number;
  }) => {
    return logWellnessActivity({
      userId,
      type: "yoga",
      value: minutes,
      unit: "minutes",
      source: "manual",
      note: "Yoga session completed",
      metadata: { sessionId, title, steps },
    });
  },

  aiChat: async ({
    userId,
    question,
    conversationId,
    model,
  }: BaseActivityInput & {
    question: string;
    conversationId: string;
    model: string;
  }) => {
    return logWellnessActivity({
      userId,
      type: "ai_chat",
      value: 1,
      unit: "count",
      source: "ai",
      note: question,
      metadata: { conversationId, model },
    });
  },
};