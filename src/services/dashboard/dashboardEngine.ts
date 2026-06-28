import { buildDashboardAnalytics } from "../analytics";
import { DashboardData } from "../dashboardService";
import { DashboardViewModel } from "./types";

export function buildDashboardViewModel(
  dashboard: DashboardData
): DashboardViewModel {

  const analytics =
    buildDashboardAnalytics(dashboard);

  return {
    dashboard,
    analytics,
  };
}