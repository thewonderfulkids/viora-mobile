export type WellnessHistoryRecord = {
  id: string;
  userId: string;
  date: string;

  waterMl: number;
  sleepMinutes: number;
  yogaMinutes: number;
  musicMinutes: number;

  wellnessScore: number;

  createdAt: string;
};