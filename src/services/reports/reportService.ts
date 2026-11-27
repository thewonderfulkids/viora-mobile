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
      metric("readiness", "Doctor-ready", "Yes", "Summary format is ready for report exports", "positive"),
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

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function scoreTone(score: number) {
  if (score >= 75) return "positive";
  if (score >= 55) return "neutral";
  return "warning";
}

function scoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Balanced";
  if (score > 0) return "Needs Attention";
  return "Not Enough Data";
}

function safeBarWidth(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

function formatReportDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderList(items: string[], emptyText: string, tone: "positive" | "warning") {
  const listItems = (items.length ? items : [emptyText])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  return `<ul class="clean-list ${tone}">${listItems}</ul>`;
}

function renderMetricCards(section: ReportSectionSummary) {
  if (!section.metrics.length) {
    return `<div class="empty-card">More metrics will appear when more wellness data is logged.</div>`;
  }

  return `
    <div class="metric-grid">
      ${section.metrics.map((item) => `
        <div class="metric-card ${item.tone}">
          <div class="metric-label">${escapeHtml(item.label)}</div>
          <div class="metric-value">${escapeHtml(item.value)}</div>
          <div class="metric-helper">${escapeHtml(item.helper)}</div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderTrendRows(section: ReportSectionSummary) {
  if (!section.trend.length) {
    return `<div class="empty-card">Trend data will appear here after more check-ins.</div>`;
  }

  return `
    <div class="trend-list">
      ${section.trend.slice(0, 8).map((item) => {
        const width = safeBarWidth(item.value);
        return `
          <div class="trend-row">
            <div class="trend-main">
              <span class="trend-label">${escapeHtml(item.label)}</span>
              <span class="trend-helper">${escapeHtml(item.helper)}</span>
            </div>
            <div class="trend-track"><div class="trend-fill" style="width:${width}%"></div></div>
            <div class="trend-value">${width}</div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderSection(section: ReportSectionSummary) {
  const tone = scoreTone(section.score);

  return `
    <section class="report-section">
      <div class="section-header">
        <div>
          <p class="eyebrow">Wellness Area</p>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        <div class="mini-score ${tone}">
          <strong>${escapeHtml(section.score)}</strong>
          <span>/100</span>
        </div>
      </div>
      <p class="section-summary">${escapeHtml(section.summary)}</p>
      ${renderMetricCards(section)}
      <h3>Trend Snapshot</h3>
      ${renderTrendRows(section)}
    </section>
  `;
}

export function buildReportHtml(report: HealthReportDoc) {
  const overallTone = scoreTone(report.score);
  const generatedOn = formatReportDate(report.generatedAt);
  const startDate = formatReportDate(report.startDate);
  const endDate = formatReportDate(report.endDate);
  const sections = report.sections.map(renderSection).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(report.title)}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 16mm 18mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: #f4fbf7;
      color: #10251c;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid #dbeee5;
    }

    .hero {
      padding: 28px;
      background: linear-gradient(135deg, #0b6e4f 0%, #13a579 58%, #a8f0d1 100%);
      color: #ffffff;
      position: relative;
    }

    .brand-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
      margin-bottom: 28px;
    }

    .brand {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 0.2px;
    }

    .tagline {
      margin-top: 4px;
      color: rgba(255, 255, 255, 0.86);
      font-weight: 700;
    }

    .report-chip {
      border: 1px solid rgba(255, 255, 255, 0.42);
      background: rgba(255, 255, 255, 0.18);
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 170px 1fr;
      gap: 24px;
      align-items: center;
    }

    .score-ring {
      width: 154px;
      height: 154px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.18);
      border: 12px solid rgba(255, 255, 255, 0.55);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 18px 40px rgba(8, 74, 52, 0.25);
    }

    .score-ring strong {
      font-size: 48px;
      line-height: 1;
      font-weight: 950;
    }

    .score-ring span {
      font-size: 12px;
      font-weight: 900;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.9px;
    }

    h1 {
      margin: 0;
      font-size: 31px;
      line-height: 1.12;
      letter-spacing: -0.6px;
    }

    .subtitle {
      margin: 10px 0 0;
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      font-weight: 800;
    }

    .meta-grid {
      margin-top: 18px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .meta-card {
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.16);
      border: 1px solid rgba(255, 255, 255, 0.28);
      padding: 12px;
    }

    .meta-label {
      display: block;
      font-size: 10px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.78);
      font-weight: 900;
    }

    .meta-value {
      display: block;
      margin-top: 4px;
      color: #ffffff;
      font-size: 13px;
      font-weight: 900;
    }

    .content {
      padding: 26px;
      background: #ffffff;
    }

    .summary-card {
      border-radius: 22px;
      border: 1px solid #dbeee5;
      background: #f6fcf9;
      padding: 20px;
      margin-bottom: 20px;
    }

    .eyebrow {
      margin: 0 0 5px;
      color: #0b6e4f;
      font-size: 10px;
      font-weight: 950;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .summary-card h2,
    .report-section h2 {
      margin: 0;
      color: #10251c;
      font-size: 20px;
      line-height: 1.2;
    }

    .summary-card p,
    .section-summary {
      margin: 10px 0 0;
      color: #52665d;
      font-weight: 700;
    }

    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-bottom: 22px;
    }

    .list-card {
      border-radius: 20px;
      border: 1px solid #e3efe9;
      padding: 18px;
      background: #ffffff;
      break-inside: avoid;
    }

    .list-card h3,
    .report-section h3 {
      margin: 0 0 12px;
      color: #10251c;
      font-size: 15px;
      font-weight: 950;
    }

    .clean-list {
      margin: 0;
      padding-left: 18px;
      color: #52665d;
      font-weight: 750;
    }

    .clean-list li {
      margin-bottom: 8px;
    }

    .clean-list.positive li::marker {
      color: #0b8f67;
    }

    .clean-list.warning li::marker {
      color: #e29b22;
    }

    .report-section {
      border-radius: 24px;
      border: 1px solid #dbeee5;
      background: #ffffff;
      padding: 22px;
      margin-top: 18px;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
    }

    .mini-score {
      min-width: 78px;
      border-radius: 18px;
      padding: 10px 12px;
      text-align: center;
      border: 1px solid #dbeee5;
      background: #f6fcf9;
    }

    .mini-score strong {
      display: block;
      font-size: 25px;
      line-height: 1;
      color: #0b6e4f;
    }

    .mini-score span {
      color: #789188;
      font-weight: 900;
      font-size: 11px;
    }

    .mini-score.warning strong {
      color: #b76d00;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
      margin-bottom: 18px;
    }

    .metric-card {
      border-radius: 18px;
      border: 1px solid #e3efe9;
      background: #f8fcfa;
      padding: 14px;
      min-height: 104px;
    }

    .metric-card.positive {
      border-color: #c7eadb;
      background: #f1fbf6;
    }

    .metric-card.warning {
      border-color: #ffe1ad;
      background: #fff8eb;
    }

    .metric-label {
      color: #6d8078;
      font-size: 11px;
      font-weight: 950;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .metric-value {
      margin-top: 8px;
      color: #10251c;
      font-size: 21px;
      font-weight: 950;
      line-height: 1.15;
    }

    .metric-helper {
      margin-top: 7px;
      color: #60756c;
      font-size: 11px;
      font-weight: 700;
    }

    .trend-list {
      display: grid;
      gap: 9px;
    }

    .trend-row {
      display: grid;
      grid-template-columns: 132px 1fr 38px;
      gap: 10px;
      align-items: center;
      padding: 10px;
      border-radius: 16px;
      background: #f8fcfa;
      border: 1px solid #edf5f1;
    }

    .trend-label {
      display: block;
      color: #10251c;
      font-size: 12px;
      font-weight: 950;
    }

    .trend-helper {
      display: block;
      color: #789188;
      font-size: 10px;
      font-weight: 750;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .trend-track {
      height: 8px;
      border-radius: 999px;
      background: #e7f2ec;
      overflow: hidden;
    }

    .trend-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #0b6e4f, #13a579);
    }

    .trend-value {
      color: #0b6e4f;
      font-size: 12px;
      font-weight: 950;
      text-align: right;
    }

    .empty-card {
      border-radius: 18px;
      border: 1px dashed #cfe6dc;
      background: #f8fcfa;
      padding: 14px;
      color: #60756c;
      font-weight: 800;
      margin-top: 12px;
    }

    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e4f1eb;
      color: #6f837a;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
    }

    .footer strong {
      color: #0b6e4f;
    }

    /* Compact, print-safe report layout. */
    @media print {
      body { background: #fff; }
      .page { max-width: none; border: 0; border-radius: 0; overflow: visible; }
      .hero { break-inside: avoid; page-break-inside: avoid; }
      .report-section, .list-card, .summary-card { break-inside: auto; page-break-inside: auto; }
      .section-header, h2, h3 { break-after: avoid; page-break-after: avoid; }
      .metric-card, .trend-row, .clean-list li { break-inside: avoid; page-break-inside: avoid; }
      .two-column, .metric-grid, .trend-list { display: block; }
      .metric-card { display: inline-block; vertical-align: top; width: 31%; margin: 0 1% 8px 0; }
      .list-card, .trend-row { margin-bottom: 8px; }
    }
    body { font-family: "Noto Sans Devanagari", "Nirmala UI", Mangal, Arial, sans-serif; overflow-wrap: anywhere; }
    .hero { background: #0b6e4f; padding: 18px; }
    .brand-row { margin-bottom: 14px; }
    .hero-grid { grid-template-columns: 100px minmax(0, 1fr); gap: 14px; }
    .score-ring { width: 94px; height: 94px; border-width: 5px; box-shadow: none; text-align: center; }
    .score-ring strong { font-size: 32px; }
    .score-ring span { font-size: 9px; }
    h1 { font-size: 24px; }
    .meta-card { padding: 7px; min-width: 0; }
    .content { padding: 16px; }
    .report-section { padding: 14px; }
    .metric-card { min-height: 0; padding: 10px; }
    .trend-row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(38px, auto); }
    .trend-helper { white-space: normal; overflow: visible; text-overflow: clip; }
  </style>
</head>
<body>
  <main class="page">
    <header class="hero">
      <div class="brand-row">
        <div>
          <div class="brand">Viora</div>
          <div class="tagline">AI-powered wellness report</div>
        </div>
        <div class="report-chip">${escapeHtml(report.range.toUpperCase())} REPORT</div>
      </div>

      <div class="hero-grid">
        <div class="score-ring">
          <strong>${escapeHtml(report.score)}</strong>
          <span>${escapeHtml(scoreLabel(report.score))}</span>
        </div>
        <div>
          <h1>${escapeHtml(report.title)}</h1>
          <p class="subtitle">${escapeHtml(report.subtitle)}</p>
          <div class="meta-grid">
            <div class="meta-card"><span class="meta-label">From</span><span class="meta-value">${escapeHtml(startDate)}</span></div>
            <div class="meta-card"><span class="meta-label">To</span><span class="meta-value">${escapeHtml(endDate)}</span></div>
            <div class="meta-card"><span class="meta-label">Generated</span><span class="meta-value">${escapeHtml(generatedOn)}</span></div>
          </div>
        </div>
      </div>
    </header>

    <section class="content">
      <div class="summary-card">
        <p class="eyebrow">AI Summary</p>
        <h2>Your wellness snapshot</h2>
        <p>${escapeHtml(report.aiSummary)}</p>
      </div>

      <div class="two-column">
        <div class="list-card">
          <h3>Highlights</h3>
          ${renderList(report.highlights, "More highlights will appear as you log daily wellness activity.", "positive")}
        </div>
        <div class="list-card">
          <h3>Risk Flags</h3>
          ${renderList(report.risks, "No major risk flags detected from available data.", "warning")}
        </div>
      </div>

      ${sections}

      <div class="footer">
        <strong>Viora Wellness Report</strong> - This report is generated from self-tracked wellness data and AI summaries. It is not a medical diagnosis. Please consult a qualified professional for medical advice.
      </div>
    </section>
  </main>
</body>
</html>`;
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
