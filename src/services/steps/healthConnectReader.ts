import { Platform } from "react-native";
import type { BackgroundAggregate, BackgroundWindow } from "./backgroundStepWindow";

type ActiveSession = { uid: string; sessionId: string; consent: boolean };

async function nativeReader() {
  if (Platform.OS !== "android") return null;
  try {
    const native = await import("react-native-health-connect");
    if (!(await native.initialize())) return null;
    return native;
  } catch {
    return null;
  }
}

/** Invoke only from an explicit user action, never on login or app startup. */
export async function requestHealthStepAccess(): Promise<boolean> {
  try {
    const native = await nativeReader();
    if (!native) return false;
    const granted = await native.requestPermission([{ accessType: "read", recordType: "Steps" }]);
    return granted.some(p => p.accessType === "read" && p.recordType === "Steps");
  } catch {
    return false;
  }
}

/** Read a closed background interval on resume; never request historical daily totals. */
export async function readBackgroundAggregate(
  window: BackgroundWindow,
  active: () => ActiveSession | null,
): Promise<BackgroundAggregate | null> {
  const valid = () => {
    const a = active();
    return !!a && a.consent && a.uid === window.uid && a.sessionId === window.sessionId;
  };
  if (!valid() || !Number.isSafeInteger(window.startMs) || !Number.isSafeInteger(window.endMs) ||
      window.startMs < window.dayStartMs || window.endMs > window.dayEndMs ||
      window.startMs >= window.endMs || window.endMs > Date.now()) return null;
  try {
    const native = await nativeReader();
    if (!native || !valid()) return null;
    const permissions = await native.getGrantedPermissions();
    if (!valid() || !permissions.some(p => p.accessType === "read" && p.recordType === "Steps")) return null;
    const result = await native.aggregateRecord({
      recordType: "Steps",
      timeRangeFilter: {
        operator: "between",
        startTime: new Date(window.startMs).toISOString(),
        endTime: new Date(window.endMs).toISOString(),
      },
    });
    if (!valid() || !Number.isSafeInteger(result.COUNT_TOTAL) || result.COUNT_TOTAL < 0) return null;
    return { window, steps: result.COUNT_TOTAL };
  } catch {
    return null;
  }
}
