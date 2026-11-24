import { DashboardData } from "../dashboardService";
import { aiService } from "./AIService";
import { runManagedAIRequest } from "./requestManager";

export async function generateWellnessAdvice({
  question,
  coachContext,
  expectedUid,
  dashboard,
}: {
  question: string;
  coachContext?: string;
  expectedUid?: string;
  dashboard: DashboardData;
}) {
  const result = await runManagedAIRequest({
    operation: "generateWellnessAdvice",
    timeoutMs: 35000,
    maxRetries: 1,
    execute: async () => {
      const response = await aiService.generateWellnessAdvice({
        question,
        coachContext,
        expectedUid,
        dashboard,
        mode: "wellness",
      });

      return response.answer;
    },
  });

  return result.data;
}