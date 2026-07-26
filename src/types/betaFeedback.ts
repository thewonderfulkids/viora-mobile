import { AppDiagnostics } from "./sync";

export type BetaFeedbackCategory = "bug" | "ui" | "sync" | "notifications" | "wellness_intelligence" | "other";
export type BetaFeedbackSeverity = "low" | "medium" | "high" | "critical";
export type BetaFeedbackStatus = "open" | "reviewing" | "resolved";

export type BetaFeedbackInput = {
  userId: string;
  title: string;
  details: string;
  category: BetaFeedbackCategory;
  severity: BetaFeedbackSeverity;
  currentScreen?: string;
};

export type BetaFeedbackRecord = BetaFeedbackInput & {
  id: string;
  status: BetaFeedbackStatus;
  diagnostics: AppDiagnostics;
  createdAt: string;
  updatedAt: string;
  serverUpdatedAt?: unknown;
};
