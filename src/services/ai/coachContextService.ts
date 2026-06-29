import { DashboardData } from "../dashboardService";
import { buildAIMemoryContext } from "./memoryContextBuilder";
import { buildWellnessIntelligenceDashboard } from "./wellnessIntelligenceService";
import { getAICoachConversation } from "../../repositories/aiCoachRepository";
import {
  AICoachContextBundle,
  AICoachContextSnapshot,
  AICoachFollowUpSuggestion,
  AICoachQuickAction,
} from "../../types/aiCoach";
import { resolveAICoachTone } from "./coachToneService";

function buildSnapshot(bundle: Omit<AICoachContextBundle, "contextSnapshot" | "quickActions" | "followUps">): AICoachContextSnapshot {
  const tone = resolveAICoachTone({
    dashboard: bundle.dashboard,
    intelligence: bundle.wellnessIntelligence,
  });

  return {
    wellnessScore: bundle.dashboard.wellnessScore,
    dailyWellnessIndex: bundle.wellnessIntelligence.dailyWellnessIndex,
    primaryFocus: bundle.wellnessIntelligence.primaryFocus,
    recommendedTone: tone,
    riskLevel: bundle.wellnessIntelligence.riskLevel,
    memoryCount: bundle.memoryContext.memories.length,
    summary: bundle.wellnessIntelligence.summary,
    updatedAt: new Date().toISOString(),
  };
}

function action(id: string, kind: AICoachQuickAction["kind"], label: string, prompt: string, priority: number): AICoachQuickAction {
  return { id, kind, label, prompt, priority };
}

export function buildAICoachQuickActions({
  dashboard,
  snapshot,
}: {
  dashboard: DashboardData;
  snapshot: AICoachContextSnapshot;
}): AICoachQuickAction[] {
  const actions: AICoachQuickAction[] = [
    action("daily-review", "daily_review", "Review today", "Review my wellness progress today and tell me the next best step.", 80),
    action("goal-check", "goal_check", "Goal check", "Check my current wellness goal and suggest a realistic action for today.", 70),
  ];

  if (snapshot.primaryFocus === "hydration" || dashboard.todayStats.waterMl < (dashboard.user?.waterGoalMl || 2500) * 0.6) {
    actions.push(action("hydration-plan", "hydration", "Hydration plan", "Make a simple hydration plan for the rest of today.", 95));
  }

  if (snapshot.primaryFocus === "sleep" || dashboard.todayStats.sleepMinutes < 360) {
    actions.push(action("sleep-reset", "sleep", "Sleep reset", "Help me improve my sleep routine tonight.", 92));
  }

  if (snapshot.primaryFocus === "stress" || dashboard.user?.stressLevel === "High" || dashboard.user?.stressLevel === "Very High") {
    actions.push(action("stress-relief", "stress", "Calm me down", "Give me a short stress relief plan I can do now.", 94));
  }

  if (snapshot.primaryFocus === "yoga" || dashboard.todayStats.yogaMinutes < 10) {
    actions.push(action("quick-yoga", "yoga", "Quick yoga", "Suggest a 10 minute yoga or stretching routine for today.", 78));
  }

  return actions.sort((a, b) => b.priority - a.priority).slice(0, 6);
}

export function buildAICoachFollowUps(snapshot: AICoachContextSnapshot): AICoachFollowUpSuggestion[] {
  const focusLabel = snapshot.primaryFocus.replace(/_/g, " ");

  return [
    {
      id: "why-focus",
      label: "Why this focus?",
      prompt: `Why is ${focusLabel} my main focus right now?`,
    },
    {
      id: "smallest-step",
      label: "Smallest step",
      prompt: `What is the smallest useful step I can take for ${focusLabel} today?`,
    },
    {
      id: "tomorrow-plan",
      label: "Tomorrow plan",
      prompt: "Create a simple wellness plan for tomorrow based on my current pattern.",
    },
  ];
}

export async function buildAICoachContextBundle({
  uid,
  dashboard,
  conversationId,
}: {
  uid: string;
  dashboard: DashboardData;
  conversationId: string;
}): Promise<AICoachContextBundle> {
  const memoryContext = await buildAIMemoryContext({
    userId: uid,
    maxMemories: 10,
    maxSummaries: 4,
  });

  const [wellnessIntelligence, recentMessages] = await Promise.all([
    buildWellnessIntelligenceDashboard({
      userId: uid,
      dashboard,
      profile: memoryContext.profile,
      memories: memoryContext.memories,
      summaries: memoryContext.recentSummaries,
      persistSnapshot: false,
    }),
    getAICoachConversation({ uid, conversationId }),
  ]);

  const baseBundle = {
    uid,
    dashboard,
    memoryContext,
    wellnessIntelligence,
    recentMessages: recentMessages.slice(-10),
  };

  const contextSnapshot = buildSnapshot(baseBundle);
  const quickActions = buildAICoachQuickActions({ dashboard, snapshot: contextSnapshot });
  const followUps = buildAICoachFollowUps(contextSnapshot);

  return {
    ...baseBundle,
    contextSnapshot,
    quickActions,
    followUps,
  };
}
