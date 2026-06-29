import {
    createAIMemory,
    createConversationSummary,
    findExistingMemory,
    getActiveAIMemories,
    getLatestConversationSummaries,
    getWellnessProfile,
    markMemoryUsed,
    reinforceMemory,
    upsertWellnessProfile,
} from "../services/ai/memoryService";
import { getAIMemoryDashboard } from "../services/ai/memoryDashboardService";
import {
    AIMemoryRecord,
    ConversationSummary,
    CreateConversationSummaryInput,
    CreateMemoryInput,
    UpsertWellnessProfileInput,
    UserWellnessProfile,
    AIMemoryDashboard,
} from "../types";

type GetRelevantMemoriesOptions = {
  maxResults?: number;
};

export async function saveMemory(
  input: CreateMemoryInput
): Promise<AIMemoryRecord> {
  return createAIMemory(input);
}

export async function getRelevantMemories(
  userId: string,
  options?: GetRelevantMemoriesOptions
): Promise<AIMemoryRecord[]> {
  return getActiveAIMemories(userId, options?.maxResults ?? 12);
}

export async function markRelevantMemoryUsed(memoryId: string): Promise<void> {
  await markMemoryUsed(memoryId);
}

export async function saveConversationSummary(
  input: CreateConversationSummaryInput
): Promise<ConversationSummary> {
  return createConversationSummary(input);
}

export async function getRecentConversationSummaries(
  userId: string,
  maxResults = 5
): Promise<ConversationSummary[]> {
  return getLatestConversationSummaries(userId, maxResults);
}

export async function getUserWellnessProfile(
  userId: string
): Promise<UserWellnessProfile | null> {
  return getWellnessProfile(userId);
}

export async function updateUserWellnessProfile(
  input: UpsertWellnessProfileInput
): Promise<UserWellnessProfile> {
  return upsertWellnessProfile(input);
}

export async function saveOrReinforceMemory(
  memory: CreateMemoryInput
): Promise<void> {
  const existing = await findExistingMemory({
    userId: memory.userId,
    category: memory.category,
    title: memory.title,
  });

  if (existing) {
    await reinforceMemory({
      memoryId: existing.id,
      currentConfidence: existing.confidence,
      occurrenceCount:
        typeof (existing as any).occurrenceCount === "number"
          ? (existing as any).occurrenceCount
          : 0,
    });

    return;
  }

  await createAIMemory(memory);
}
export async function getMemoryDashboard(
  userId: string
): Promise<AIMemoryDashboard> {
  return getAIMemoryDashboard(userId);
}
