export type WellnessAIInput = {
  question: string;
  dashboard: {
    user?: {
      fullName?: string;
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