import { saveOrReinforceMemory } from "../../repositories";
import { extractMemoriesFromConversation } from "./memoryExtractor";

type ProcessConversationInput = {
  userId: string;
  userMessage: string;
  assistantMessage: string;
};

export async function processConversationMemory({
  userId,
  userMessage,
  assistantMessage,
}: ProcessConversationInput): Promise<void> {
  try {
    const extracted = extractMemoriesFromConversation({
      userId,
      userMessage,
      assistantMessage,
    });

    if (extracted.length === 0) return;

    await Promise.all(
      extracted.map((memory) => saveOrReinforceMemory(memory))
    );
  } catch (error) {
    console.warn("AI memory intelligence skipped:", error);
  }
}