import { DashboardData } from "../dashboardService";
import { aiService } from "./AIService";
import { runManagedAIRequest } from "./requestManager";

export async function generateWellnessAdvice({
  question,
  dashboard,
}: {
  question: string;
  dashboard: DashboardData;
}) {
  const result = await runManagedAIRequest({
    operation: "generateWellnessAdvice",
    timeoutMs: 35000,
    maxRetries: 1,
    execute: async () => {
      const response = await aiService.generateWellnessAdvice({
        question,
        dashboard,
        mode: "wellness",
      });

      return response.answer;
    },
  });

  return result.data;
}