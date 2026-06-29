import { DashboardData } from "../services/dashboardService";
import { AIMemoryContext } from "../services/ai/memoryContextBuilder";
import { WellnessIntelligenceDashboard } from "./wellnessIntelligence";
import { AIConversationMessage, AIConversationThread } from "../services/ai/conversationService";

export type AICoachTone = "encouraging" | "corrective" | "motivational" | "calming";

export type AICoachQuickActionKind =
  | "hydration"
  | "sleep"
  | "yoga"
  | "stress"
  | "daily_review"
  | "goal_check";

export type AICoachQuickAction = {
  id: string;
  kind: AICoachQuickActionKind;
  label: string;
  prompt: string;
  priority: number;
};

export type AICoachFollowUpSuggestion = {
  id: string;
  label: string;
  prompt: string;
};

export type AICoachContextSnapshot = {
  wellnessScore: number;
  dailyWellnessIndex: number;
  primaryFocus: string;
  recommendedTone: AICoachTone;
  riskLevel: "low" | "medium" | "high";
  memoryCount: number;
  summary: string;
  updatedAt: string;
};

export type AICoachContextBundle = {
  uid: string;
  dashboard: DashboardData;
  memoryContext: AIMemoryContext;
  wellnessIntelligence: WellnessIntelligenceDashboard;
  recentMessages: AIConversationMessage[];
  contextSnapshot: AICoachContextSnapshot;
  quickActions: AICoachQuickAction[];
  followUps: AICoachFollowUpSuggestion[];
};

export type AICoachAskInput = {
  uid: string;
  question: string;
  conversationId: string;
  dashboard: DashboardData;
};

export type AICoachAskResult = {
  reply: string;
  contextSnapshot: AICoachContextSnapshot;
  quickActions: AICoachQuickAction[];
  followUps: AICoachFollowUpSuggestion[];
};

export type AICoachHistoryState = {
  messages: AIConversationMessage[];
  threads: AIConversationThread[];
};
