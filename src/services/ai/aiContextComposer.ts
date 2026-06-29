import { WellnessIntelligence } from "../../types";
import { AIMemoryContext } from "./memoryContextBuilder";

type BuildAIContextInput = {
  memoryContext: AIMemoryContext;
  intelligence: WellnessIntelligence;
};

export function buildAIContext({
  memoryContext,
  intelligence,
}: BuildAIContextInput): string {
  return `
========================
LONG TERM MEMORY
========================

${memoryContext.contextText}

========================
WELLNESS INTELLIGENCE
========================

Overall Trend:
${intelligence.overallTrend}

Hydration:
${intelligence.hydrationStatus}

Sleep:
${intelligence.sleepStatus}

Stress:
${intelligence.stressStatus}

Recommended Focus:
${intelligence.recommendedFocus}

Achievements:

${intelligence.achievements.map((x) => `• ${x}`).join("\n")}

Risk Signals:

${intelligence.riskSignals.map((x) => `• ${x}`).join("\n")}

Coach Insight:

${intelligence.coachInsight}
`;
}