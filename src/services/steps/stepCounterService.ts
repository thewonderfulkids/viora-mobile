import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pedometer } from "expo-sensors";
import { AppState, AppStateStatus, Platform } from "react-native";

const STORAGE_PREFIX = "@viora/steps";
const DEFAULT_GOAL = 8000;

export type StepPermissionState =
  | "undetermined"
  | "granted"
  | "denied"
  | "unavailable";

export type StepCounterSnapshot = {
  dateKey: string;
  steps: number;
  goal: number;
  supported: boolean | null;
  permission: StepPermissionState;
  active: boolean;
  loading: boolean;
  error: string | null;
};

type Listener = (snapshot: StepCounterSnapshot) => void;

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function stepKey(dateKey: string) {
  return `${STORAGE_PREFIX}/daily/${dateKey}`;
}

const GOAL_KEY = `${STORAGE_PREFIX}/goal`;

let snapshot: StepCounterSnapshot = {
  dateKey: getDateKey(),
  steps: 0,
  goal: DEFAULT_GOAL,
  supported: null,
  permission: "undetermined",
  active: false,
  loading: true,
  error: null,
};

const listeners = new Set<Listener>();
let pedometerSubscription: { remove: () => void } | null = null;
let lastSensorSteps = 0;
let initialized = false;
let appStateSubscription: { remove: () => void } | null = null;

function emit(next: Partial<StepCounterSnapshot> = {}) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener(snapshot));
}

async function persistSteps() {
  await AsyncStorage.setItem(stepKey(snapshot.dateKey), String(snapshot.steps));
}

async function ensureCurrentDate() {
  const currentDateKey = getDateKey();
  if (snapshot.dateKey === currentDateKey) return;

  stopWatching();
  lastSensorSteps = 0;
  const stored = await AsyncStorage.getItem(stepKey(currentDateKey));
  emit({
    dateKey: currentDateKey,
    steps: Math.max(0, Number(stored) || 0),
    error: null,
  });
}

async function loadStoredState() {
  const dateKey = getDateKey();
  const [storedSteps, storedGoal] = await Promise.all([
    AsyncStorage.getItem(stepKey(dateKey)),
    AsyncStorage.getItem(GOAL_KEY),
  ]);

  emit({
    dateKey,
    steps: Math.max(0, Number(storedSteps) || 0),
    goal: Math.max(1000, Number(storedGoal) || DEFAULT_GOAL),
  });
}

async function readPermission(): Promise<StepPermissionState> {
  if (Platform.OS === "web") return "unavailable";

  try {
    const result = await Pedometer.getPermissionsAsync();
    if (result.granted) return "granted";
    if (result.status === "denied") return "denied";
    return "undetermined";
  } catch {
    return "undetermined";
  }
}

function stopWatching() {
  pedometerSubscription?.remove();
  pedometerSubscription = null;
  lastSensorSteps = 0;
  emit({ active: false });
}

async function startWatching() {
  await ensureCurrentDate();

  if (snapshot.supported !== true || snapshot.permission !== "granted") {
    stopWatching();
    return;
  }

  if (pedometerSubscription) return;

  lastSensorSteps = 0;
  pedometerSubscription = Pedometer.watchStepCount((result) => {
    const sensorSteps = Math.max(0, result.steps || 0);
    const delta = Math.max(0, sensorSteps - lastSensorSteps);
    lastSensorSteps = sensorSteps;

    if (delta <= 0) return;

    emit({ steps: snapshot.steps + delta, active: true, error: null });
    void persistSteps();
  });

  emit({ active: true, error: null });
}

async function initialize() {
  if (initialized) return;
  initialized = true;

  try {
    await loadStoredState();
    const supported = Platform.OS !== "web" && (await Pedometer.isAvailableAsync());
    const permission = supported ? await readPermission() : "unavailable";

    emit({
      supported,
      permission,
      loading: false,
      error: supported ? null : "Step sensor is not available on this device.",
    });

    if (supported && permission === "granted") {
      await startWatching();
    }

    appStateSubscription = AppState.addEventListener(
      "change",
      (state: AppStateStatus) => {
        if (state === "active") {
          void ensureCurrentDate().then(startWatching);
        } else {
          stopWatching();
        }
      },
    );
  } catch {
    emit({
      loading: false,
      active: false,
      error: "Viora could not start the step counter.",
    });
  }
}

export function subscribeToStepCounter(listener: Listener) {
  listeners.add(listener);
  listener(snapshot);
  void initialize();

  return () => {
    listeners.delete(listener);
  };
}

export function getStepCounterSnapshot() {
  return snapshot;
}

export async function requestStepPermission() {
  if (Platform.OS === "web" || snapshot.supported === false) {
    emit({ permission: "unavailable" });
    return false;
  }

  try {
    const result = await Pedometer.requestPermissionsAsync();
    const permission: StepPermissionState = result.granted
      ? "granted"
      : result.status === "denied"
        ? "denied"
        : "undetermined";

    emit({ permission, error: result.granted ? null : "Activity permission was not granted." });

    if (result.granted) {
      await startWatching();
      return true;
    }

    return false;
  } catch {
    emit({
      permission: "denied",
      error: "Viora could not request activity permission.",
    });
    return false;
  }
}

export async function setDailyStepGoal(goal: number) {
  const normalized = Math.min(50000, Math.max(1000, Math.round(goal / 500) * 500));
  await AsyncStorage.setItem(GOAL_KEY, String(normalized));
  emit({ goal: normalized });
}

export function refreshStepCounter() {
  return ensureCurrentDate().then(startWatching);
}

export function disposeStepCounter() {
  stopWatching();
  appStateSubscription?.remove();
  appStateSubscription = null;
  initialized = false;
}
