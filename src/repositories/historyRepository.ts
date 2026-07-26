import { WellnessHistoryRecord } from "../types";

export async function getHistoryRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<WellnessHistoryRecord[]> {
  /**
   * History repository
   *
   * Firestore implementation
   * will be added next patch.
   */

  return [];
}