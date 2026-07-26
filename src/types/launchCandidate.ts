export type LaunchCheckStatus = "pass" | "warning" | "blocked";

export type LaunchCheckCategory =
  | "build"
  | "navigation"
  | "android"
  | "firebase"
  | "offline"
  | "intelligence"
  | "support";

export type LaunchReadinessCheck = {
  id: string;
  category: LaunchCheckCategory;
  title: string;
  description: string;
  status: LaunchCheckStatus;
  owner: "system" | "qa" | "release";
  action?: string;
};

export type LaunchReadinessSummary = {
  total: number;
  passed: number;
  warnings: number;
  blocked: number;
  score: number;
  statusLabel: string;
  generatedAt: string;
};

export type LaunchReadinessDashboard = {
  summary: LaunchReadinessSummary;
  checks: LaunchReadinessCheck[];
  apkChecklist: string[];
  finalCommands: string[];
};

export type LaunchAuditSnapshot = {
  id: string;
  generatedAt: string;
  summary: LaunchReadinessSummary;
  checks: LaunchReadinessCheck[];
};
