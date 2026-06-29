import { ActivityLogger } from "../activity";
import { DashboardData } from "../dashboardService";
import {
  getAICoachThreads,
  saveAICoachMessage,
} from "../../repositories/aiCoachRepository";
import { AICoachAskResult } from "../../types/aiCoach";
import { buildAICoachContextBundle } from "./coachContextService";
import { buildContextAwareCoachPrompt } from "./coachPromptBuilder";
import { processConversationMemory } from "./memoryIntelligenceService";
import { processConversationSummary } from "./conversationSummaryService";
import { generateWellnessAdvice } from "./remoteAIService";

export async function askContextAwareWellnessCoach({
  uid,
  question,
  conversationId,
  dashboard,
}: {
  uid: string;
  question: string;
  conversationId: string;
  dashboard: DashboardData;
}): Promise<AICoachAskResult> {
  const cleanQuestion = question.trim();

  if (!cleanQuestion) {
    throw new Error("Please enter a wellness question.");
  }

  const context = await buildAICoachContextBundle({
    uid,
    dashboard,
    conversationId,
  });

  await saveAICoachMessage({
    uid,
    role: "user",
    message: cleanQuestion,
    conversationId,
    dashboard,
  });

  const prompt = buildContextAwareCoachPrompt({
    context,
    question: cleanQuestion,
  });

  const reply = await generateWellnessAdvice({
    question: prompt,
    dashboard,
  });

  await saveAICoachMessage({
    uid,
    role: "assistant",
    message: reply,
    conversationId,
    dashboard,
    model: "gpt-5.5",
  });

  await ActivityLogger.aiChat({
    userId: uid,
    question: cleanQuestion,
    conversationId,
    model: "gpt-5.5",
  });

  processConversationMemory({
    userId: uid,
    userMessage: cleanQuestion,
    assistantMessage: reply,
  });

  processConversationSummary({
    userId: uid,
    conversationId,
  });

  await getAICoachThreads({ uid });

  return {
    reply,
    contextSnapshot: context.contextSnapshot,
    quickActions: context.quickActions,
    followUps: context.followUps,
  };
}

export async function getCurrentAICoachContext({
  uid,
  dashboard,
  conversationId,
}: {
  uid: string;
  dashboard: DashboardData;
  conversationId: string;
}) {
  return buildAICoachContextBundle({ uid, dashboard, conversationId });
}
