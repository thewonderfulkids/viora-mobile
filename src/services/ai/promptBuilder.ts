import { DashboardData } from "../dashboardService";
import { AIMemoryContext } from "./memoryContextBuilder";

type PromptOptions = {
  memoryContext?: AIMemoryContext | null;
  intelligenceContext?: string | null;
};

export function buildWellnessPrompt(
  dashboard: DashboardData,
  options?: PromptOptions
): string {
  const user = dashboard.user;
  const stats = dashboard.todayStats;

  const contextualSection =
    options?.intelligenceContext?.trim()
      ? `

========================
AI WELLNESS CONTEXT
========================

${options.intelligenceContext}

`
      : options?.memoryContext
        ? `

========================
LONG TERM USER MEMORY
========================

${options.memoryContext.contextText}

`
        : "";

  return `
You are Viora AI, a professional wellness coach.

Today's user profile:

Goal: ${user?.goal ?? "Healthy Lifestyle"}
Stress Level: ${user?.stressLevel ?? "Moderate"}

Today's activity:

Water:
${stats.waterMl} ml

Sleep:
${stats.sleepMinutes} minutes

Yoga:
${stats.yogaMinutes} minutes

Music:
${stats.musicMinutes} minutes

Wellness Score:
${dashboard.wellnessScore}/100

${contextualSection}

Instructions:

- Personalize your answer using AI wellness context whenever available.
- If long-term context is unavailable, answer only from today's dashboard.
- Never invent user history.
- Prefer recent memories, high-confidence memories, and current wellness intelligence.
- Encourage healthy habits.
- Avoid repeating identical advice from previous summaries.
- Keep tone supportive, practical, and non-judgmental.

Give:

1. Overall summary
2. Positive encouragement
3. Three practical recommendations
4. One motivational closing sentence

Keep response under 200 words.
`;
}