import { getGoalsByUser, getHabitsByUser, getMoodEntriesByUser, getNutritionEntriesByUser, getReportExportsByUser, getReportsByUser, saveHealthReport, saveReportExport } from "../../repositories";
import { getPremiumDashboard } from "../premium";
import { HealthReportDoc, ReportCenterDashboard, ReportMetric, ReportOption, ReportRange, ReportSectionSummary } from "../../types";

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function clampScore(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function average(values: number[]) {
  const clean = values.filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function metric(id: string, label: string, value: string, helper: string, tone: ReportMetric["tone"] = "neutral"): ReportMetric {
  return { id, label, value, helper, tone };
}

function rangeDates(range: ReportRange) {
  if (range === "daily") return { startDate: todayKey(), endDate: todayKey() };
  if (range === "weekly") return { startDate: daysAgo(6), endDate: todayKey() };
  return { startDate: daysAgo(29), endDate: todayKey() };
}

function buildNutritionSection(entries: Awaited<ReturnType<typeof getNutritionEntriesByUser>>): ReportSectionSummary {
  const recent = entries.slice(0, 30);
  const calories = recent.reduce((sum, item) => sum + item.calories, 0);
  const protein = recent.reduce((sum, item) => sum + item.protein, 0);
  const sugar = recent.reduce((sum, item) => sum + item.sugar, 0);
  const avgCalories = Math.round(average(recent.map((item) => item.calories)));
  const score = clampScore(70 + Math.min(protein / 10, 15) - Math.max(sugar / 50, 0));

  return {
    id: "nutrition",
    title: "Nutrition Analytics",
    score,
    summary: recent.length ? `Logged ${recent.length} meals with ${Math.round(calories).toLocaleString("en-IN")} kcal total and ${Math.round(protein)}g protein.` : "Start logging meals to activate nutrition report analytics.",
    metrics: [
      metric("calories", "Calories", `${Math.round(calories).toLocaleString("en-IN")} kcal`, `${avgCalories} kcal average per meal`, score >= 70 ? "positive" : "neutral"),
      metric("protein", "Protein", `${Math.round(protein)}g`, "Protein supports recovery and satiety", protein > 60 ? "positive" : "warning"),
      metric("sugar", "Sugar", `${Math.round(sugar)}g`, "Watch sugar-heavy snacks and drinks", sugar > 120 ? "warning" : "positive"),
    ],
    trend: recent.slice(0, 7).reverse().map((item) => ({ id: item.id, label: item.dateKey.slice(5), value: item.calories, helper: item.title })),
  };
}

function buildMoodSection(entries: Awaited<ReturnType<typeof getMoodEntriesByUser>>): ReportSectionSummary {
  const recent = entries.slice(0, 30);
  const moodScore = clampScore(average(recent.map((item) => item.moodLevel * 20)));
  const stressAvg = average(recent.map((item) => item.stressLevel));
  const energyAvg = average(recent.map((item) => item.energyLevel));

  return {
    id: "mental",
    title: "Mental Wellness Analytics",
    score: recent.length ? moodScore : 0,
    summary: recent.length ? `Average mood is ${Math.round(moodScore)} with stress at ${stressAvg.toFixed(1)}/10 and energy at ${energyAvg.toFixed(1)}/10.` : "Add mood check-ins to unlock emotional wellness reporting.",
    metrics: [
      metric("mood", "Mood Score", `${Math.round(moodScore)}/100`, "Based on recent mood check-ins", moodScore >= 70 ? "positive" : "warning"),
      metric("stress", "Stress", `${stressAvg.toFixed(1)}/10`, "Lower is better", stressAvg > 6 ? "warning" : "positive"),
      metric("energy", "Energy", `${energyAvg.toFixed(1)}/10`, "Daily energy signal", energyAvg >= 6 ? "positive" : "neutral"),
    ],
    trend: recent.slice(0, 7).reverse().map((item) => ({ id: item.id, label: item.dateKey.slice(5), value: item.moodLevel * 20, helper: item.emotions.join(", ") || "Mood" })),
  };
}

function buildGoalsSection(goals: Awaited<ReturnType<typeof getGoalsByUser>>, habits: Awaited<ReturnType<typeof getHabitsByUser>>): ReportSectionSummary {
  const activeGoals = goals.filter((item) => item.status === "active");
  const completedGoals = goals.filter((item) => item.status === "completed");
  const avgProgress = average(activeGoals.map((item) => item.targetValue > 0 ? (item.currentValue / item.targetValue) * 100 : 0));
  const avgStreak = average(habits.map((item) => item.streak));
  const score = clampScore((avgProgress * 0.65) + Math.min(avgStreak * 6, 35));

  return {
    id: "goals",
    title: "Goals & Habit Analytics",
    score,
    summary: activeGoals.length || habits.length ? `${activeGoals.length} active goals, ${habits.length} active habits and ${completedGoals.length} completed goals are included in this report.` : "Create one goal and one habit to activate goal reporting.",
    metrics: [
      metric("active_goals", "Active Goals", String(activeGoals.length), "Goals currently in progress", activeGoals.length ? "positive" : "neutral"),
      metric("habits", "Habits", String(habits.length), "Habit routines being tracked", habits.length ? "positive" : "neutral"),
      metric("streak", "Avg Streak", `${Math.round(avgStreak)} days`, "Consistency indicator", avgStreak >= 3 ? "positive" : "warning"),
    ],
    trend: activeGoals.slice(0, 6).map((item) => ({ id: item.id, label: item.title.slice(0, 8), value: clampScore(item.targetValue > 0 ? (item.currentValue / item.targetValue) * 100 : 0), helper: item.category })),
  };
}

function buildWellnessSection(sections: ReportSectionSummary[]): ReportSectionSummary {
  const score = clampScore(average(sections.map((item) => item.score).filter(Boolean)) || 50);

  return {
    id: "wellness",
    title: "Overall Wellness Summary",
    score,
    summary: score >= 75 ? "Your wellness rhythm looks strong. Keep protecting sleep, meals and mood check-ins." : "Your report shows room to improve consistency across meals, mood, goals and habits.",
    metrics: [
      metric("score", "Wellness Score", `${score}/100`, "Composite report score", score >= 75 ? "positive" : "warning"),
      metric("sections", "Tracked Areas", String(sections.filter((item) => item.score > 0).length), "Nutrition, mood, goals and habits", "neutral"),
      metric("readiness", "Doctor-ready", "Yes", "Summary format is ready for Sprint 20 exports", "positive"),
    ],
    trend: sections.map((item) => ({ id: item.id, label: item.title.split(" ")[0], value: item.score, helper: item.summary })),
  };
}

function accessForPlan(planCode: string) {
  const isPlus = ["PLUS_MONTHLY", "PLUS_YEARLY", "PRO_YEARLY", "ELITE_FAMILY_YEARLY"].includes(planCode);
  const isPro = ["PRO_YEARLY", "ELITE_FAMILY_YEARLY"].includes(planCode);
  const isElite = planCode === "ELITE_FAMILY_YEARLY";

  return {
    daily: true,
    weekly: isPlus,
    monthly: isPro,
    doctor: isElite,
    aiSummary: isPlus,
    exportPdf: isPlus,
  };
}

function reportOptions(access: ReturnType<typeof accessForPlan>): ReportOption[] {
  return [
    { id: "daily", title: "Daily Wellness Report", subtitle: "Today's wellness summary and risk flags.", range: "daily", category: "wellness", minimumPlanCode: "FREE", locked: !access.daily, ctaLabel: access.daily ? "Open" : "Upgrade" },
    { id: "weekly", title: "Weekly AI Report", subtitle: "7-day wellness, mood, nutrition and habit trend.", range: "weekly", category: "wellness", minimumPlanCode: "PLUS_YEARLY", locked: !access.weekly, ctaLabel: access.weekly ? "Open" : "Upgrade" },
    { id: "monthly", title: "Monthly Health Report", subtitle: "30-day progress and professional analytics.", range: "monthly", category: "wellness", minimumPlanCode: "PRO_YEARLY", locked: !access.monthly, ctaLabel: access.monthly ? "Open" : "Upgrade" },
    { id: "doctor", title: "Doctor-friendly Report", subtitle: "Clean summary format for consultations.", range: "monthly", category: "doctor", minimumPlanCode: "ELITE_FAMILY_YEARLY", locked: !access.doctor, ctaLabel: access.doctor ? "Open" : "Upgrade" },
  ];
}

function buildReport(userId: string, range: ReportRange, sections: ReportSectionSummary[], minimumPlanCode: HealthReportDoc["minimumPlanCode"]): HealthReportDoc {
  const { startDate, endDate } = rangeDates(range);
  const wellness = buildWellnessSection(sections);
  const highlights = sections.filter((item) => item.score >= 70).map((item) => `${item.title}: ${item.score}/100`);
  const risks = sections.filter((item) => item.score > 0 && item.score < 55).map((item) => `${item.title} needs attention`);
  const timestamp = nowIso();

  return {
    id: `${userId}_${range}_${endDate}`,
    userId,
    range,
    category: "wellness",
    title: `${range[0].toUpperCase()}${range.slice(1)} Wellness Report`,
    subtitle: `${startDate} to ${endDate}`,
    score: wellness.score,
    startDate,
    endDate,
    aiSummary: `${wellness.summary} Nutrition, mood, and habit signals are combined into this Viora AI report.`,
    highlights: highlights.length ? highlights : ["Start logging daily data to create stronger highlights."],
    risks: risks.length ? risks : ["No major risk flags detected from available data."],
    sections: [wellness, ...sections],
    generatedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
    premiumOnly: minimumPlanCode !== "FREE",
    minimumPlanCode,
  };
}

export async function getReportCenter(userId: string, selectedRange: ReportRange = "daily"): Promise<ReportCenterDashboard> {
  if (!userId) throw new Error("Login is required to load reports.");

  const [premium, savedReports, exports, nutritionEntries, moodEntries, goals, habits] = await Promise.all([
    getPremiumDashboard(userId),
    getReportsByUser(userId),
    getReportExportsByUser(userId),
    getNutritionEntriesByUser(userId),
    getMoodEntriesByUser(userId),
    getGoalsByUser(userId),
    getHabitsByUser(userId),
  ]);

  const access = accessForPlan(premium.currentPlan.code);
  const sections = [
    buildNutritionSection(nutritionEntries),
    buildMoodSection(moodEntries),
    buildGoalsSection(goals, habits),
  ];

  const daily = buildReport(userId, "daily", sections, "FREE");
  const weekly = buildReport(userId, "weekly", sections, "PLUS_YEARLY");
  const monthly = buildReport(userId, "monthly", sections, "PRO_YEARLY");
  const reports = [daily, weekly, monthly, ...savedReports.filter((item) => ![daily.id, weekly.id, monthly.id].includes(item.id))];
  const activeReport = reports.find((item) => item.range === selectedRange) || daily;

  return {
    activePlanCode: premium.currentPlan.code,
    access,
    selectedRange,
    heroScore: activeReport.score,
    heroSummary: activeReport.aiSummary,
    reports,
    activeReport,
    reportOptions: reportOptions(access),
    exports,
    doctorFriendlyNote: access.doctor ? "Doctor-friendly reports are enabled for your plan." : "Doctor-friendly reports unlock with Viora Elite Family.",
  };
}

export async function saveGeneratedReport(report: HealthReportDoc) {
  return saveHealthReport(report);
}

export function buildReportHtml(report: HealthReportDoc) {
  const sections = report.sections.map((section) => `<h2>${section.title} — ${section.score}/100</h2><p>${section.summary}</p>`).join("");
  return `<html><body><h1>${report.title}</h1><p>${report.subtitle}</p><h2>AI Summary</h2><p>${report.aiSummary}</p>${sections}</body></html>`;
}

export async function createReportExport(userId: string, report: HealthReportDoc) {
  const fileName = `viora-${report.range}-report-${report.endDate}.pdf`;
  return saveReportExport({
    userId,
    reportId: report.id,
    reportTitle: report.title,
    range: report.range,
    status: "ready",
    format: "pdf",
    fileName,
    htmlSnapshot: buildReportHtml(report),
  });
}
