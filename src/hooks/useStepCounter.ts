import { useCallback, useSyncExternalStore } from "react";

import { useAuth } from "../context/AuthContext";

import {
  getStepCounterSnapshot,
  refreshStepCounter,
  requestStepPermission,
  setDailyStepGoal,
  subscribeToStepCounter,
} from "../services/steps";

export function useStepCounter() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const read = useCallback(() => getStepCounterSnapshot(uid), [uid]);
  const state = useSyncExternalStore(subscribeToStepCounter, read, read);
  const requestPermission = useCallback(() => requestStepPermission(uid), [uid]);
  const setGoal = useCallback((goal: number) => setDailyStepGoal(goal, uid), [uid]);
  const refresh = useCallback(() => refreshStepCounter(uid), [uid]);

  const progress =
    state.goal > 0 ? Math.min(1, state.steps / state.goal) : 0;

  const distanceKm = Number((state.steps * 0.000762).toFixed(2));
  const calories = Math.round(state.steps * 0.04);

  return {
    ...state,
    progress,
    distanceKm,
    calories,
    requestPermission,
    setGoal,
    refresh,
  };
}
