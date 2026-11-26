import type { BackgroundWindow } from "./backgroundStepWindow";

export type HealthCheckpoint = {
  window: BackgroundWindow;
  applied: number;
  expires: number;
};

/** Only closed, previously consented intervals may be recovered. */
export function decodeHealthCheckpoints(raw: string | null, uid: string, now: number): HealthCheckpoint[] {
  if (!raw || !uid || raw.length > 262144) return [];
  try {
    const rows: unknown = JSON.parse(raw);
    if (!Array.isArray(rows) || rows.length > 512) return [];
    const result: HealthCheckpoint[] = [];
    for (const row of rows) {
      const w = row?.window;
      if (!w || w.uid !== uid || typeof w.sessionId !== "string" || !w.sessionId ||
          ![w.startMs, w.endMs, w.dayStartMs, w.dayEndMs, row.applied, row.expires].every(Number.isSafeInteger) ||
          w.dayStartMs > w.startMs || w.startMs >= w.endMs || w.endMs > w.dayEndMs ||
          w.endMs > now || row.applied < 0 || row.expires < now ||
          row.expires > w.endMs + 86400000) continue;
      result.push({ window: { uid, sessionId: w.sessionId, startMs: w.startMs, endMs: w.endMs,
        dayStartMs: w.dayStartMs, dayEndMs: w.dayEndMs }, applied: row.applied, expires: row.expires });
    }
    result.sort((a,b) => a.window.startMs - b.window.startMs);
    if (result.some((r,i) => i > 0 && result[i-1].window.endMs > r.window.startMs)) return [];
    return result;
  } catch { return []; }
}

/** A single storage value holds both the daily count and its applied checkpoints.
 * Legacy numeric totals remain readable. Never write count and checkpoint separately.
 */
export function decodeStepDay(raw: string | null, uid: string, now: number): { steps: number; checkpoints: HealthCheckpoint[] } {
  if (!raw) return { steps: 0, checkpoints: [] };
  try {
    const value = JSON.parse(raw);
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0)
      return { steps: value, checkpoints: [] };
    if (value?.version !== 1 || !Number.isSafeInteger(value.steps) || value.steps < 0)
      throw new Error("Invalid step day");
    return { steps: value.steps, checkpoints: decodeHealthCheckpoints(JSON.stringify(value.checkpoints), uid, now) };
  } catch { throw new Error("Invalid stored step day"); }
}

export function encodeStepDay(steps: number, checkpoints: HealthCheckpoint[]): string {
  if (!Number.isSafeInteger(steps) || steps < 0) throw new Error("Invalid step count");
  return JSON.stringify({ version: 1, steps, checkpoints });
}
