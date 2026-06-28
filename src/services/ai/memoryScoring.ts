export function calculateReinforcedConfidence(
  currentConfidence: number,
  occurrenceCount: number
): number {
  const safeConfidence =
    typeof currentConfidence === "number" && !Number.isNaN(currentConfidence)
      ? currentConfidence
      : 0.7;

  const safeOccurrenceCount =
    typeof occurrenceCount === "number" && !Number.isNaN(occurrenceCount)
      ? occurrenceCount
      : 0;

  const boost = Math.max(0.01, 0.05 - safeOccurrenceCount * 0.005);

  return Math.min(Number((safeConfidence + boost).toFixed(2)), 0.99);
}