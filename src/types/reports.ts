import { PremiumPlanCode } from "./premium";

export type ReportRange = "daily" | "weekly" | "monthly";
export type ReportCategory = "wellness" | "nutrition" | "mental" | "goals" | "doctor";
export type ReportTone = "positive" | "warning" | "neutral";
export type ReportExportStatus = "ready" | "queued" | "failed";

export type ReportAccessLevel = {
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  doctor: boolean;
  aiSummary: boolean;
  exportPdf: boolean;
};

export type ReportMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: ReportTone;
};

export type ReportInsight = {
  id: string;
  title: string;
  message: string;
  tone: ReportTone;
  category: ReportCategory;
};

export type ReportTrendPoint = {
  id: string;
  label: string;
  value: number;
  helper: string;
};

export type ReportSectionSummary = {
  id: string;
  title: string;
  score: number;
  summary: string;
  metrics: ReportMetric[];
  trend: ReportTrendPoint[];
};

export type HealthReportDoc = {
  id: string;
  userId: string;
  range: ReportRange;
  category: ReportCategory;
  title: string;
  subtitle: string;
  score: number;
  startDate: string;
  endDate: string;
  aiSummary: string;
  highlights: string[];
  risks: string[];
  sections: ReportSectionSummary[];
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  premiumOnly: boolean;
  minimumPlanCode: PremiumPlanCode;
};

export type ReportExportRecord = {
  id: string;
  userId: string;
  reportId: string;
  reportTitle: string;
  range: ReportRange;
  status: ReportExportStatus;
  format: "pdf";
  fileName: string;
  htmlSnapshot: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportOption = {
  id: string;
  title: string;
  subtitle: string;
  range: ReportRange;
  category: ReportCategory;
  minimumPlanCode: PremiumPlanCode;
  locked: boolean;
  ctaLabel: string;
};

export type ReportCenterDashboard = {
  activePlanCode: PremiumPlanCode;
  access: ReportAccessLevel;
  selectedRange: ReportRange;
  heroScore: number;
  heroSummary: string;
  reports: HealthReportDoc[];
  activeReport: HealthReportDoc;
  reportOptions: ReportOption[];
  exports: ReportExportRecord[];
  doctorFriendlyNote: string;
};
