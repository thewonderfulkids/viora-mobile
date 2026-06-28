import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { getTodayKey } from "../firebase/firestoreHelpers";
import { DailyStatsDoc, UserDoc } from "../firebase/firestoreTypes";

export type DashboardData = {
  user: UserDoc | null;
  todayStats: DailyStatsDoc;
  wellnessScore: number;
  greeting: string;
  tasks: {
    icon: string;
    title: string;
    text: string;
  }[];
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning 👋";
  if (hour < 17) return "Good Afternoon 👋";
  return "Good Evening 👋";
}

function createEmptyTodayStats(uid: string): DailyStatsDoc {
  const now = new Date().toISOString();

  return {
    uid,
    dateKey: getTodayKey(),
    waterMl: 0,
    sleepMinutes: 0,
    yogaMinutes: 0,
    musicMinutes: 0,
    isDeleted: false,
    createdAt: now,
    updatedAt: now,
  };
}

function calculateWellnessScore(stats: DailyStatsDoc) {
  let score = 30;

  if (stats.waterMl >= 1500) score += 20;
  if (stats.sleepMinutes >= 360) score += 20;
  if (stats.yogaMinutes >= 10) score += 15;
  if (stats.musicMinutes >= 10) score += 15;

  return Math.min(score, 100);
}

function buildTasks(user: UserDoc | null, stats: DailyStatsDoc) {
  const waterGoal = user?.waterGoalMl || 2500;
  const goal = user?.goal || "Healthy Lifestyle";
  const stressLevel = user?.stressLevel || "Moderate";

  return [
    {
      icon: "💧",
      title: `Drink ${Math.round(waterGoal / 1000)}L Water`,
      text: `${stats.waterMl} ml done today. Keep sipping through the day.`,
    },
    {
      icon: "🧘",
      title: "10 min Morning Yoga",
      text:
        goal === "Stress Relief"
          ? "Gentle yoga to calm your nervous system"
          : "Improve flexibility and energy",
    },
    {
      icon: "👀",
      title: "2 min Eye Relaxation",
      text: "Perfect for screen-heavy days",
    },
    {
      icon: "🎵",
      title:
        stressLevel === "Very High" || stressLevel === "High"
          ? "Calming Sound Therapy"
          : "Sleep Sound Therapy",
      text: "Relax your mind before sleep",
    },
  ];
}

async function safeGetTodayStats(uid: string): Promise<DailyStatsDoc> {
  const todayKey = getTodayKey();
  const todayStatsRef = doc(db, COLLECTIONS.dailyStats, `${uid}_${todayKey}`);

  try {
    const statsSnap = await getDoc(todayStatsRef);

    if (statsSnap.exists()) {
      return statsSnap.data() as DailyStatsDoc;
    }

    return createEmptyTodayStats(uid);
  } catch (error) {
    console.log("Today stats read skipped:", error);
    return createEmptyTodayStats(uid);
  }
}

export async function getDashboardData(uid: string): Promise<DashboardData> {
  const userRef = doc(db, COLLECTIONS.users, uid);

  const [userSnap, todayStats] = await Promise.all([
    getDoc(userRef),
    safeGetTodayStats(uid),
  ]);

  const user = userSnap.exists() ? (userSnap.data() as UserDoc) : null;

  return {
    user,
    todayStats,
    wellnessScore: calculateWellnessScore(todayStats),
    greeting: getGreeting(),
    tasks: buildTasks(user, todayStats),
  };
}