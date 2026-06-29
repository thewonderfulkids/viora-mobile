import { DashboardData } from "../dashboardService";
import { AICoachTone } from "../../types";
import { WellnessIntelligenceDashboard } from "../../types";

export function resolveAICoachTone({
  dashboard,
  intelligence,
}: {
  dashboard: DashboardData;
  intelligence: WellnessIntelligenceDashboard;
}): AICoachTone {
  const stressLevel = dashboard.user?.stressLevel ?? "Moderate";

  if (stressLevel === "High" || stressLevel === "Very High") {
    return "calming";
  }

  if (intelligence.riskLevel === "high") {
    return "corrective";
  }

  if (intelligence.dailyWellnessIndex >= 75) {
    return "motivational";
  }

  return "encouraging";
}

export function describeAICoachTone(tone: AICoachTone) {
  switch (tone) {
    case "calming":
      return "calm, reassuring, gentle, and stress-sensitive";
    case "corrective":
      return "direct, practical, safety-aware, and non-judgmental";
    case "motivational":
      return "energetic, positive, goal-focused, and momentum-building";
    case "encouraging":
    default:
      return "supportive, clear, practical, and friendly";
  }
}
