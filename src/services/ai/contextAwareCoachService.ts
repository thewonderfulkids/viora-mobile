import { ActivityLogger } from "../activity";
import { DashboardData } from "../dashboardService";
import {
  saveAICoachMessage,
} from "../../repositories/aiCoachRepository";
import { AICoachAskResult } from "../../types";
import { buildAICoachContextBundle } from "./coachContextService";
import { buildContextAwareCoachContext } from "./coachPromptBuilder";
import { processConversationMemory } from "./memoryIntelligenceService";
import { processConversationSummary } from "./conversationSummaryService";
import { generateWellnessAdvice } from "./remoteAIService";

export async function askContextAwareWellnessCoach({
  uid,
  question,
  conversationId,
  dashboard,
  questionSaved = false,
  onQuestionSaved,
}: {
  uid: string;
  question: string;
  conversationId: string;
  dashboard: DashboardData;
  questionSaved?: boolean;
  onQuestionSaved?: () => void;
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

  if (!questionSaved) {
    await saveAICoachMessage({
      uid,
      role: "user",
      message: cleanQuestion,
      conversationId,
      dashboard,
    });
    onQuestionSaved?.();
  }

  const coachContext = buildContextAwareCoachContext(context);

  const reply = await generateWellnessAdvice({
    question: cleanQuestion,
    coachContext,
    expectedUid: uid,
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

  void ActivityLogger.aiChat({
    userId: uid,
    question: cleanQuestion,
    conversationId,
    model: "gpt-5.5",
  }).catch(() => undefined);

  void processConversationMemory({
    userId: uid,
    userMessage: cleanQuestion,
    assistantMessage: reply,
  }).catch(() => undefined);

  void processConversationSummary({
    userId: uid,
    conversationId,
  }).catch(() => undefined);

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
