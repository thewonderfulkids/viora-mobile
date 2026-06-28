import { AIProvider, AIProviderRequest, AIProviderResponse } from "./AIProvider";
import { VioraCloudAIProvider } from "./VioraCloudAIProvider";

class AIService {
  private provider: AIProvider;

  constructor(provider: AIProvider = new VioraCloudAIProvider()) {
    this.provider = provider;
  }

  async generateWellnessAdvice(
    request: AIProviderRequest
  ): Promise<AIProviderResponse> {
    const question = request.question.trim();

    if (!question) {
      throw new Error("Please enter a wellness question.");
    }

    return this.provider.generateWellnessAdvice({
      ...request,
      question,
    });
  }
}

export const aiService = new AIService();