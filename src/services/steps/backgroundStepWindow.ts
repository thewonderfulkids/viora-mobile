/**
 * Native aggregate replacement for an exclusively background interval.
 * Never add a device-wide daily total to foreground pedometer deltas.
 * Session identity is opaque and must change on every auth transition.
 */
export type BackgroundWindow = Readonly<{
  uid: string;
  sessionId: string;
  startMs: number;
  endMs: number;
  dayStartMs: number;
  dayEndMs: number;
}>;

export type BackgroundAggregate = Readonly<{
  window: BackgroundWindow;
  steps: number;
}>;

export function reconcileBackgroundSteps(
  window: BackgroundWindow,
  aggregate: BackgroundAggregate,
  active: { uid: string; sessionId: string; consent: boolean },
  previous: BackgroundAggregate | null,
): number | null {
  if (!active.consent || !active.uid || !active.sessionId ||
      window.uid !== active.uid || window.sessionId !== active.sessionId) return null;
  const times = [window.startMs, window.endMs, window.dayStartMs, window.dayEndMs];
  if (!times.every(Number.isSafeInteger) ||
      window.dayStartMs > window.startMs || window.endMs > window.dayEndMs ||
      window.startMs >= window.endMs) return null;
  const sameWindow = (other: BackgroundWindow) =>
    other.uid === window.uid && other.sessionId === window.sessionId &&
    other.startMs === window.startMs && other.endMs === window.endMs &&
    other.dayStartMs === window.dayStartMs && other.dayEndMs === window.dayEndMs;
  if (!sameWindow(aggregate.window) || !Number.isSafeInteger(aggregate.steps) ||
      aggregate.steps < 0) return null;
  if (previous && (!sameWindow(previous.window) ||
      !Number.isSafeInteger(previous.steps) || previous.steps < 0)) return null;
  // Replace the previous aggregate for this exact interval, not accumulate it.
  return aggregate.steps - (previous?.steps ?? 0);
}
