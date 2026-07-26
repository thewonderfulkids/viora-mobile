import { createBetaFeedbackRecord } from "../../repositories";
import { BetaFeedbackCategory, BetaFeedbackInput, BetaFeedbackRecord, BetaFeedbackSeverity } from "../../types";
import { buildAppDiagnostics } from "../sync";

const VALID_CATEGORIES: BetaFeedbackCategory[] = ["bug", "ui", "sync", "notifications", "wellness_intelligence", "other"];
const VALID_SEVERITIES: BetaFeedbackSeverity[] = ["low", "medium", "high", "critical"];

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function cleanText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export async function submitBetaFeedback(input: BetaFeedbackInput): Promise<string> {
  const title = cleanText(input.title, 120);
  const details = input.details.trim().slice(0, 4000);
  const category = VALID_CATEGORIES.includes(input.category) ? input.category : "other";
  const severity = VALID_SEVERITIES.includes(input.severity) ? input.severity : "medium";

  if (!input.userId) throw new Error("Please sign in again before submitting feedback.");
  if (title.length < 4) throw new Error("Please enter a short issue title.");
  if (details.length < 10) throw new Error("Please add at least 10 characters of issue details.");

  const now = new Date().toISOString();
  const record: BetaFeedbackRecord = {
    id: createId("beta_feedback"),
    userId: input.userId,
    title,
    details,
    category,
    severity,
    currentScreen: input.currentScreen?.trim() || "Not provided",
    status: "open",
    diagnostics: buildAppDiagnostics({ isOnline: true, isCheckingNetwork: false, lastCheckedAt: Date.now() }),
    createdAt: now,
    updatedAt: now,
  };

  return createBetaFeedbackRecord(record);
}
