import { saveConversationSummary } from "../../repositories";
import { getAIConversationMessagesByConversationId } from "./conversationService";

type ProcessConversationSummaryInput = {
  userId: string;
  conversationId: string;
};

function buildSummaryFromMessages(
  messages: { role: string; message: string }[]
) {
  const compact = messages
    .slice(-8)
    .map((item) => `${item.role}: ${item.message}`)
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();

  return compact.slice(0, 700);
}

function extractKeyTopics(text: string) {
  const normalized = text.toLowerCase();

  const topics = [
    normalized.includes("sleep") ? "sleep" : null,
    normalized.includes("water") || normalized.includes("hydration")
      ? "hydration"
      : null,
    normalized.includes("stress") || normalized.includes("anxiety")
      ? "stress"
      : null,
    normalized.includes("yoga") ? "yoga" : null,
    normalized.includes("music") ? "music therapy" : null,
    normalized.includes("weight") || normalized.includes("fat")
      ? "weight management"
      : null,
  ].filter(Boolean) as string[];

  return Array.from(new Set(topics)).slice(0, 6);
}

export async function processConversationSummary({
  userId,
  conversationId,
}: ProcessConversationSummaryInput): Promise<void> {
  try {
    if (!userId || !conversationId) return;

    const messages = await getAIConversationMessagesByConversationId({
      uid: userId,
      conversationId,
    });

    if (messages.length < 6) return;

    if (messages.length % 6 !== 0) return;

    const summary = buildSummaryFromMessages(messages);

    if (!summary) return;

    await saveConversationSummary({
      userId,
      conversationId,
      summary,
      keyTopics: extractKeyTopics(summary),
      extractedMemories: [],
      moodSignal: summary.toLowerCase().includes("stress") ? "stress" : null,
      riskSignal: summary.toLowerCase().includes("panic") ? "panic" : null,
    });
  } catch (error) {
    console.warn("Conversation summary skipped:", error);
  }
}