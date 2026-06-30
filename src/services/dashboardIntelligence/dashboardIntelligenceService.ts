import { DashboardData } from "../dashboardService";
import {
  DashboardAchievement,
  DashboardBriefing,
  DashboardIntelligence,
  DashboardPriority,
  DashboardSmartAction,
  DashboardTimelineItem,
  DashboardTrendMetric,
} from "../../types/dashboardIntelligence";

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function priorityFromProgress(progress: number): DashboardPriority {
  if (progress < 45) return "high";
  if (progress < 75) return "medium";
  return "low";
}

function buildBriefing(data: DashboardData): DashboardBriefing {
  const name = data.user?.fullName?.split(" ")?.[0] || "there";
  const waterGoal = data.user?.waterGoalMl || 2500;
  const waterPercent = clampPercent((data.todayStats.waterMl / waterGoal) * 100);
  const sleepHours = Math.round(data.todayStats.sleepMinutes / 60);
  const yogaMinutes = data.todayStats.yogaMinutes;

  let focus = "Maintain your wellness rhythm";
  let recommendation = "Keep your hydration, movement and sleep routine consistent today.";

  if (waterPercent < 60) {
    focus = "Hydration recovery";
    recommendation = "Start with 300–500 ml water now and spread the remaining goal through the day.";
  } else if (data.todayStats.sleepMinutes < 360) {
    focus = "Sleep recovery";
    recommendation = "Plan a calmer evening and aim for an earlier bedtime tonight.";
  } else if (yogaMinutes < 10) {
    focus = "Gentle movement";
    recommendation = "A short 10-minute yoga session will improve today's balance score.";
  }

  return {
    greeting: `${data.greeting}, ${name}`,
    headline: `Your wellness score is ${data.wellnessScore}/100 today`,
    summary: `You have logged ${data.todayStats.waterMl} ml water, ${sleepHours}h sleep and ${yogaMinutes} min yoga today. Viora is prioritizing ${focus.toLowerCase()} for your next best action.`,
    focus,
    recommendation,
  };
}

function buildTrends(data: DashboardData): DashboardTrendMetric[] {
  const waterGoal = data.user?.waterGoalMl || 2500;
  const hydration = clampPercent((data.todayStats.waterMl / waterGoal) * 100);
  const sleep = clampPercent((data.todayStats.sleepMinutes / 480) * 100);
  const yoga = clampPercent((data.todayStats.yogaMinutes / 30) * 100);
  const mindfulness = clampPercent((data.todayStats.musicMinutes / 20) * 100);

  return [
    {
      id: "hydration",
      label: "Hydration",
      value: `${hydration}%`,
      detail: `${data.todayStats.waterMl} ml of ${waterGoal} ml`,
      progress: hydration,
      priority: priorityFromProgress(hydration),
    },
    {
      id: "sleep",
      label: "Sleep",
      value: `${Math.round(data.todayStats.sleepMinutes / 60)}h`,
      detail: "Target 7–8 hours",
      progress: sleep,
      priority: priorityFromProgress(sleep),
    },
    {
      id: "movement",
      label: "Movement",
      value: `${data.todayStats.yogaMinutes} min`,
      detail: "Yoga and mobility today",
      progress: yoga,
      priority: priorityFromProgress(yoga),
    },
    {
      id: "mindfulness",
      label: "Mindfulness",
      value: `${data.todayStats.musicMinutes} min`,
      detail: "Music therapy and relaxation",
      progress: mindfulness,
      priority: priorityFromProgress(mindfulness),
    },
  ];
}

function buildSmartActions(data: DashboardData): DashboardSmartAction[] {
  const waterGoal = data.user?.waterGoalMl || 2500;
  const hydration = clampPercent((data.todayStats.waterMl / waterGoal) * 100);

  const actions: DashboardSmartAction[] = [];

  if (hydration < 75) {
    actions.push({
      id: "log-water",
      kind: "hydration",
      title: "Log Water",
      subtitle: "Update your hydration target for today.",
      route: "/hydration",
      priority: hydration < 45 ? "high" : "medium",
    });
  }

  actions.push(
    {
      id: "log-food",
      kind: "nutrition",
      title: "Log Meal",
      subtitle: "Add breakfast, lunch, dinner or snack items.",
      route: "/nutrition",
      priority: "medium",
    },
    {
      id: "ask-ai",
      kind: "aiCoach",
      title: "Ask AI Coach",
      subtitle: "Get a personalized recommendation for your day.",
      route: "/ai-coach",
      priority: "low",
    },
    {
      id: "view-reports",
      kind: "reports",
      title: "View Reports",
      subtitle: "Open daily, weekly and monthly wellness reports.",
      route: "/reports",
      priority: "low",
    },
    {
      id: "check-goals",
      kind: "goals",
      title: "Goals & Habits",
      subtitle: "Review streaks, targets and habit completions.",
      route: "/goals-habits",
      priority: "low",
    },
  );

  return actions.slice(0, 6);
}

function buildTimeline(data: DashboardData): DashboardTimelineItem[] {
  return [
    {
      id: "morning-hydration",
      timeLabel: "Morning",
      title: "Hydration Check",
      description: `${data.todayStats.waterMl} ml logged today. Keep sipping steadily.`,
      completed: data.todayStats.waterMl >= 500,
      route: "/hydration",
    },
    {
      id: "daily-nutrition",
      timeLabel: "Meal time",
      title: "Nutrition Logging",
      description: "Add your meal items to improve calorie and macro intelligence.",
      completed: false,
      route: "/nutrition",
    },
    {
      id: "movement-session",
      timeLabel: "Anytime",
      title: "Movement Session",
      description: "Complete yoga or home mobility to strengthen today's score.",
      completed: data.todayStats.yogaMinutes >= 10,
      route: "/yoga",
    },
    {
      id: "evening-review",
      timeLabel: "Evening",
      title: "AI Review",
      description: "Ask Viora to summarize your day and suggest tomorrow's focus.",
      completed: false,
      route: "/ai-coach",
    },
  ];
}

function buildAchievements(data: DashboardData): DashboardAchievement[] {
  const achievements: DashboardAchievement[] = [
    {
      id: "score",
      title: "Wellness Score",
      description: "Your live combined wellness score.",
      value: `${data.wellnessScore}/100`,
    },
    {
      id: "water",
      title: "Hydration Logged",
      description: "Water intake captured today.",
      value: `${data.todayStats.waterMl} ml`,
    },
  ];

  if (data.todayStats.yogaMinutes > 0) {
    achievements.push({
      id: "movement",
      title: "Movement Done",
      description: "Yoga or mobility minutes logged.",
      value: `${data.todayStats.yogaMinutes} min`,
    });
  }

  if (data.todayStats.musicMinutes > 0) {
    achievements.push({
      id: "mindfulness",
      title: "Mindfulness Done",
      description: "Relaxation or sound therapy completed.",
      value: `${data.todayStats.musicMinutes} min`,
    });
  }

  return achievements;
}

export function buildDashboardIntelligence(data: DashboardData): DashboardIntelligence {
  return {
    wellnessScore: data.wellnessScore,
    briefing: buildBriefing(data),
    trends: buildTrends(data),
    smartActions: buildSmartActions(data),
    timeline: buildTimeline(data),
    achievements: buildAchievements(data),
    familySnapshot: {
      enabled: true,
      title: "Family Wellness",
      description: "Open family wellness to review members, invites and shared AI insights.",
      route: "/family-wellness",
      memberCount: 0,
    },
  };
}
