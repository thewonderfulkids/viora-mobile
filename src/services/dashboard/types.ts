import { DashboardAnalytics } from "../analytics";
import { DashboardData } from "../dashboardService";

export type DashboardViewModel = {
  dashboard: DashboardData;
  analytics: DashboardAnalytics;
};