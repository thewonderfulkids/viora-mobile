import { getHistoryRange } from "../../repositories/historyRepository";

export async function getLast7DaysHistory(userId: string) {
  const end = new Date();

  const start = new Date();

  start.setDate(start.getDate() - 7);

  return getHistoryRange(
    userId,
    start.toISOString(),
    end.toISOString()
  );
}

export async function getLast30DaysHistory(userId: string) {
  const end = new Date();

  const start = new Date();

  start.setDate(start.getDate() - 30);

  return getHistoryRange(
    userId,
    start.toISOString(),
    end.toISOString()
  );
}

export async function getLast90DaysHistory(userId: string) {
  const end = new Date();

  const start = new Date();

  start.setDate(start.getDate() - 90);

  return getHistoryRange(
    userId,
    start.toISOString(),
    end.toISOString()
  );
}