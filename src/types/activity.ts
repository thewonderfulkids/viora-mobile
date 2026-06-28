export type ActivityType =
  | "hydration"
  | "sleep"
  | "yoga"
  | "music"
  | "ai_chat"
  | "mood"
  | "food_scan"
  | "voice_ai"
  | "wearable_sync";

export type ActivityUnit =
  | "ml"
  | "minutes"
  | "count"
  | "score"
  | "text"
  | "none";

export type WellnessActivity = {
  id: string;
  userId: string;
  type: ActivityType;
  value: number | string | null;
  unit: ActivityUnit;
  source: "manual" | "ai" | "system" | "wearable";
  note: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type CreateActivityInput = {
  userId: string;
  type: ActivityType;
  value?: number | string | null;
  unit?: ActivityUnit;
  source?: "manual" | "ai" | "system" | "wearable";
  note?: string | null;
  metadata?: Record<string, unknown>;
};