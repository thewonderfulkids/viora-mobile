import { useMemo } from "react";

import { useDashboard } from "./useDashboard";
import { buildDashboardIntelligence } from "../services/dashboardIntelligence";

export function useDashboardIntelligence() {
  const dashboardState = useDashboard();

  const intelligence = useMemo(() => {
    if (!dashboardState.data) return null;
    return buildDashboardIntelligence(dashboardState.data);
  }, [dashboardState.data]);

  return {
    ...dashboardState,
    intelligence,
  };
}
