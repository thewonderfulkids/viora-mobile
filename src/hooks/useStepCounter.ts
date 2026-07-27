import { useCallback, useEffect, useState } from "react";

import {
  getStepCounterSnapshot,
  refreshStepCounter,
  requestStepPermission,
  setDailyStepGoal,
  StepCounterSnapshot,
  subscribeToStepCounter,
} from "../services/steps";

export function useStepCounter() {
  const [state, setState] = useState<StepCounterSnapshot>(
    getStepCounterSnapshot(),
  );

  useEffect(() => subscribeToStepCounter(setState), []);

  const requestPermission = useCallback(
    () => requestStepPermission(),
    [],
  );

  const setGoal = useCallback(
    (goal: number) => setDailyStepGoal(goal),
    [],
  );

  const refresh = useCallback(
    () => refreshStepCounter(),
    [],
  );

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
