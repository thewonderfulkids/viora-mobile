import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { Pedometer } from "expo-sensors";
import { AppState, AppStateStatus, Platform } from "react-native";

import { auth } from "../../firebase/firebaseConfig";

const STORAGE_PREFIX = "@viora/steps/by-user";
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

type Subscription = { remove: () => void };
type Day = { key: string; steps: number; ready: boolean; pendingWrite: boolean; loaded: Promise<void> };
type Session = {
  uid: string;
  actor: NonNullable<typeof auth.currentUser>;
  snapshot: StepCounterSnapshot;
  day: Day | null;
  initialized: Promise<void>;
  watch: Subscription | null;
  watchVersion: number;
  permissionVersion: number;
  prompting: boolean;
  goalVersion: number;
};

function emptySnapshot(loading: boolean): StepCounterSnapshot {
  return { dateKey: getDateKey(), steps: 0, goal: DEFAULT_GOAL, supported: null,
    permission: "undetermined", active: false, loading, error: null };
}

// Ownerless device-wide totals are intentionally not read or reassigned.
const signedOut = emptySnapshot(false);
const pending = emptySnapshot(true);
const listeners = new Set<Listener>();
const writes = new Map<string, Promise<void>>();
let session: Session | null = null;
let unsubscribeAuth: (() => void) | null = null;
let appSubscription: Subscription | null = null;
let foreground = false;
let observerVersion = 0;

function keyFor(uid: string, suffix: string) {
  return `${STORAGE_PREFIX}/${encodeURIComponent(uid)}/${suffix}`;
}

function current(owner: Session) {
  return session === owner && auth.currentUser === owner.actor;
}

function notify() {
  const value = getStepCounterSnapshot();
  listeners.forEach((listener) => listener(value));
}

function update(owner: Session, value: Partial<StepCounterSnapshot>) {
  if (!current(owner)) return;
  owner.snapshot = { ...owner.snapshot, ...value };
  notify();
}

function enqueueWrite(key: string, apply: () => Promise<void>) {
  const next = (writes.get(key) ?? Promise.resolve()).catch(() => undefined).then(apply);
  writes.set(key, next);
  void next.finally(() => {
    if (writes.get(key) === next) writes.delete(key);
  }).catch(() => undefined);
  return next;
}

function write(key: string, value: number) {
  return enqueueWrite(key, () => AsyncStorage.setItem(key, String(value)));
}

async function read(key: string) {
  await writes.get(key)?.catch(() => undefined);
  return AsyncStorage.getItem(key);
}

function count(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

function selectDay(owner: Session, date = getDateKey()): Day {
  if (owner.day?.key === date) return owner.day;
  const storageKey = keyFor(owner.uid, `daily/${date}`);
  const day: Day = { key: date, steps: 0, ready: false, pendingWrite: false, loaded: Promise.resolve() };
  owner.day = day;
  day.loaded = read(storageKey).then((stored) => {
    day.steps += count(stored);
    day.ready = true;
    if (owner.day === day) update(owner, { dateKey: date, steps: day.steps, loading: false });
  }).catch(() => {
    if (owner.day === day) update(owner, { loading: false, error: "Viora could not load today's steps." });
  });
  update(owner, { dateKey: date, steps: 0, loading: true });
  return day;
}

function stopWatching(owner: Session) {
  owner.watchVersion += 1;
  const watch = owner.watch;
  owner.watch = null;
  watch?.remove();
  if (owner.snapshot.active) update(owner, { active: false });
}

function startWatching(owner: Session) {
  if (!current(owner) || !foreground || owner.snapshot.supported !== true ||
      owner.snapshot.permission !== "granted" || owner.watch) return;
  let lastSensorSteps = 0;
  const version = ++owner.watchVersion;
  let subscription: Subscription;
  try {
    subscription = Pedometer.watchStepCount((result) => {
      if (!current(owner) || !foreground || owner.watchVersion !== version) return;
      const sensorSteps = count(result.steps);
      const delta = Math.max(0, sensorSteps - lastSensorSteps);
      lastSensorSteps = sensorSteps;
      // Expo gives a cumulative count, not event timestamps. Attribute the
      // received foreground delta to the local date on receipt.
      const day = selectDay(owner);
      if (!delta) return;
      day.steps += delta;
      const storageKey = keyFor(owner.uid, `daily/${day.key}`);
      if (day.ready) {
        void write(storageKey, day.steps).catch(() => undefined);
      } else if (!day.pendingWrite) {
        day.pendingWrite = true;
        // Preserve already-received deltas under their original account/day
        // during a slow midnight read, even if the UI's session changes.
        void enqueueWrite(storageKey, async () => {
          await day.loaded;
          if (day.ready) await AsyncStorage.setItem(storageKey, String(day.steps));
        }).catch(() => undefined);
      }
      update(owner, { steps: day.steps, active: true });
    });
  } catch {
    update(owner, { active: false, error: "Viora could not start the step counter." });
    return;
  }
  if (!current(owner) || !foreground || owner.watchVersion !== version) {
    subscription.remove();
    return;
  }
  owner.watch = subscription;
  update(owner, { active: true, error: null });
}

async function updatePermission(owner: Session, ask: boolean) {
  if (!current(owner)) return false;
  if (Platform.OS === "web" || owner.snapshot.supported !== true) return false;
  if (owner.prompting) return false;
  const version = ++owner.permissionVersion;
  if (ask) owner.prompting = true;
  let permission: StepPermissionState = "undetermined";
  try {
    const result = await (ask ? Pedometer.requestPermissionsAsync() : Pedometer.getPermissionsAsync());
    permission = result.granted ? "granted" : result.status === "denied" ? "denied" : "undetermined";
  } catch {
    if (ask) permission = "denied";
  } finally {
    if (ask) owner.prompting = false;
  }
  if (!current(owner) || owner.permissionVersion !== version) return false;
  if (permission !== "granted") stopWatching(owner);
  update(owner, { permission, error: ask && permission !== "granted" ? "Activity permission was not granted." : null });
  if (permission === "granted") startWatching(owner);
  return permission === "granted";
}

async function initialize(owner: Session) {
  try {
    const goalVersion = owner.goalVersion;
    const [storedGoal, supported] = await Promise.all([
      read(keyFor(owner.uid, "goal")),
      Platform.OS !== "web" ? Pedometer.isAvailableAsync() : Promise.resolve(false),
      selectDay(owner).loaded,
    ]);
    if (!current(owner)) return;
    update(owner, { supported, permission: supported ? "undetermined" : "unavailable",
      ...(owner.goalVersion === goalVersion ? { goal: Math.max(1000, count(storedGoal) || DEFAULT_GOAL) } : {}),
      ...(supported ? {} : { error: "Step sensor is not available on this device." }),
    });
    if (supported) await updatePermission(owner, false);
  } catch {
    update(owner, { loading: false, active: false, error: "Viora could not start the step counter." });
  }
}

function replaceSession(actor: typeof auth.currentUser) {
  if ((session?.actor ?? null) === actor) return;
  const previous = session;
  session = null;
  if (previous) stopWatching(previous);
  if (actor) {
    const owner: Session = { uid: actor.uid, actor, snapshot: emptySnapshot(true), day: null,
      initialized: Promise.resolve(), watch: null, watchVersion: 0, permissionVersion: 0, prompting: false, goalVersion: 0 };
    session = owner;
    owner.initialized = Promise.resolve().then(() => current(owner) ? initialize(owner) : undefined);
  }
  notify();
}

export function subscribeToStepCounter(listener: Listener) {
  listeners.add(listener);
  if (!unsubscribeAuth) {
    foreground = AppState.currentState === "active" || AppState.currentState == null;
    const version = ++observerVersion;
    unsubscribeAuth = onAuthStateChanged(auth, () => {
      if (listeners.size > 0 && version === observerVersion) replaceSession(auth.currentUser);
    });
    appSubscription = AppState.addEventListener("change", (state: AppStateStatus) => {
      foreground = state === "active";
      if (foreground) void refreshStepCounter(auth.currentUser?.uid);
      else if (session) stopWatching(session);
    });
  }
  listener(getStepCounterSnapshot());
  return () => {
    listeners.delete(listener);
    if (!listeners.size) disposeStepCounter();
  };
}

export function getStepCounterSnapshot(expectedUid: string | null = auth.currentUser?.uid ?? null) {
  if (!expectedUid || auth.currentUser?.uid !== expectedUid) return signedOut;
  return session?.uid === expectedUid && current(session) ? session.snapshot : pending;
}

export async function requestStepPermission(expectedUid: string | null) {
  const owner = session;
  if (!owner || owner.uid !== expectedUid || !current(owner)) return false;
  await owner.initialized;
  return updatePermission(owner, true);
}

export async function setDailyStepGoal(goal: number, expectedUid: string | null) {
  const owner = session;
  if (!owner || owner.uid !== expectedUid || !current(owner) || !Number.isFinite(goal)) return;
  const normalized = Math.min(50000, Math.max(1000, Math.round(goal / 500) * 500));
  const version = ++owner.goalVersion;
  await write(keyFor(owner.uid, "goal"), normalized);
  if (owner.goalVersion === version) update(owner, { goal: normalized });
}

export async function refreshStepCounter(expectedUid?: string | null) {
  const owner = session;
  if (!owner || owner.uid !== expectedUid || !current(owner)) return;
  await owner.initialized;
  if (!current(owner)) return;
  await selectDay(owner).loaded;
  if (foreground) await updatePermission(owner, false);
}

export function disposeStepCounter() {
  observerVersion += 1;
  unsubscribeAuth?.();
  unsubscribeAuth = null;
  appSubscription?.remove();
  appSubscription = null;
  foreground = false;
  replaceSession(null);
}
