export type WellnessAIInput = {
  question: string;
  coachContext?: string;
  dashboard: {
    user?: {
      goal?: string;
      stressLevel?: string;
      lifestyle?: string;
    } | null;
    todayStats: {
      waterMl: number;
      sleepMinutes: number;
      yogaMinutes: number;
      musicMinutes: number;
    };
    wellnessScore: number;
  };
};

export type WellnessAIResponse = {
  answer: string;
};