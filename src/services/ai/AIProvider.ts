import { DashboardData } from "../dashboardService";
import { AICoachMode } from "./aiTypes";

export type AIProviderName =
  | "viora-cloud"
  | "openai"
  | "gemini"
  | "claude"
  | "azure-openai"
  | "local-llm";

export type AIProviderRequest = {
  question: string;
  dashboard: DashboardData;
  mode?: AICoachMode;
  conversationId?: string;
};

export type AIProviderResponse = {
  answer: string;
  provider: AIProviderName;
  model?: string;
};

export interface AIProvider {
  readonly name: AIProviderName;

  generateWellnessAdvice(
    request: AIProviderRequest
  ): Promise<AIProviderResponse>;
}