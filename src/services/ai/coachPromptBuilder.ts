import { AICoachContextBundle } from "../../types/aiCoach";
import { buildAIContext } from "./aiContextComposer";
import { describeAICoachTone } from "./coachToneService";
import { buildWellnessPrompt } from "./promptBuilder";

function buildRecentConversationText(context: AICoachContextBundle) {
  if (context.recentMessages.length === 0) {
    return "No active conversation history for this thread yet.";
  }

  return context.recentMessages
    .slice(-8)
    .map((item) => `${item.role.toUpperCase()}: ${item.summary || item.message}`)
    .join("\n");
}

export function buildContextAwareCoachPrompt({
  context,
  question,
}: {
  context: AICoachContextBundle;
  question: string;
}) {
  const intelligenceContext = buildAIContext({
    memoryContext: context.memoryContext,
    intelligence: context.wellnessIntelligence.coreIntelligence,
  });

  const basePrompt = buildWellnessPrompt(context.dashboard, {
    memoryContext: context.memoryContext,
    intelligenceContext,
  });

  const tone = describeAICoachTone(context.contextSnapshot.recommendedTone);
  const recentConversation = buildRecentConversationText(context);
  const quickActionText = context.quickActions
    .map((item) => `• ${item.label}: ${item.prompt}`)
    .join("\n");

  return `${basePrompt}

========================
AI COACH 2.0 CONTEXT
========================

Coach tone to use:
${tone}

Context snapshot:
- Wellness Score: ${context.contextSnapshot.wellnessScore}/100
- Daily Wellness Index: ${context.contextSnapshot.dailyWellnessIndex}/100
- Main Focus: ${context.contextSnapshot.primaryFocus}
- Risk Level: ${context.contextSnapshot.riskLevel}
- Active Memories: ${context.contextSnapshot.memoryCount}
- Summary: ${context.contextSnapshot.summary}

Recent conversation in this thread:
${recentConversation}

Available quick actions the app may show:
${quickActionText}

AI Coach 2.0 rules:
- Answer the user's exact question first.
- Use memory, wellness intelligence, current daily stats, and recent conversation only when relevant.
- Do not claim access to sensors, doctors, medical tests, or hidden data.
- For risky sleep, stress, dehydration, or low activity patterns, be practical but not alarming.
- Keep the response useful for mobile UI.
- End with one clear follow-up question or next action.
- Keep response under 220 words.

Current user question:
${question}`;
}
