import { AIMemoryRecord, MemoryImportance } from "../../types/aiMemory";

function getImportanceScore(importance: MemoryImportance): number {
  switch (importance) {
    case "critical":
      return 40;
    case "high":
      return 30;
    case "medium":
      return 20;
    case "low":
    default:
      return 10;
  }
}

function getRecencyScore(dateValue: string | null): number {
  if (!dateValue) return 0;

  const time = new Date(dateValue).getTime();

  if (Number.isNaN(time)) return 0;

  const daysOld = Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));

  if (daysOld <= 1) return 20;
  if (daysOld <= 7) return 16;
  if (daysOld <= 30) return 10;
  if (daysOld <= 90) return 5;

  return 2;
}

function getFrequencyScore(occurrenceCount: number): number {
  if (occurrenceCount >= 10) return 20;
  if (occurrenceCount >= 5) return 15;
  if (occurrenceCount >= 3) return 10;
  if (occurrenceCount >= 2) return 6;

  return 2;
}

function getConfidenceScore(confidence: number): number {
  const safeConfidence =
    typeof confidence === "number" && !Number.isNaN(confidence)
      ? confidence
      : 0.7;

  return Math.round(Math.min(Math.max(safeConfidence, 0), 1) * 20);
}

export function calculateMemoryRank(memory: AIMemoryRecord): number {
  if (!memory.isActive || memory.isArchived) return 0;

  const pinnedBoost = memory.isPinned ? 15 : 0;

  return (
    pinnedBoost +
    getImportanceScore(memory.importance) +
    getConfidenceScore(memory.confidence) +
    getRecencyScore(memory.lastMentionedAt || memory.updatedAt) +
    getFrequencyScore(memory.occurrenceCount)
  );
}

export function rankMemories(memories: AIMemoryRecord[]): AIMemoryRecord[] {
  return [...memories].sort(
    (a, b) => calculateMemoryRank(b) - calculateMemoryRank(a)
  );
}