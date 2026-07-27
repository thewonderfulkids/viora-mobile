import {
    collection,
    doc,
    getDocs,
    increment,
    query,
    runTransaction,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { listActiveProgramContent } from "../repositories/adminControlRepository";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { getTodayKey } from "../firebase/firestoreHelpers";
import {
    YogaDifficulty,
    YogaSource,
    YogaType,
} from "../firebase/firestoreTypes";

type CompleteYogaInput = {
  uid: string;
  title: string;
  yogaType: YogaType;
  difficulty: YogaDifficulty;
  durationMinutes: number;
  source?: YogaSource;
};

export type YogaHistoryItem = {
  title: string;
  durationMinutes: number;
  caloriesBurned: number;
  difficulty: YogaDifficulty;
  time: string;
};

export type YogaCatalogStep = {
  id?: string;
  title: string;
  durationSeconds: number;
  videoUrl?: string;
};

export type YogaCatalogItem = {
  id: string;
  title: string;
  yogaType: YogaType;
  difficulty: YogaDifficulty;
  durationMinutes: number;
  caloriesEstimate: number;
  description: string;
  focus: string;
  steps: YogaCatalogStep[];
  videoUrl?: string;
  thumbnailUrl?: string;
  provider?: string;
};

export const YOGA_CATALOG: YogaCatalogItem[] = [
  {
    id: "morning-yoga-10",
    title: "Morning Yoga Flow",
    yogaType: "Yoga",
    difficulty: "Beginner",
    durationMinutes: 10,
    caloriesEstimate: 40,
    description: "A light morning flow to wake up your body.",
    focus: "Energy, mobility and calm breathing",
    steps: [
      { title: "Neck Rolls", durationSeconds: 60 },
      { title: "Shoulder Openers", durationSeconds: 120 },
      { title: "Cat-Cow Stretch", durationSeconds: 180 },
      { title: "Forward Fold", durationSeconds: 120 },
      { title: "Deep Breathing", durationSeconds: 120 },
    ],
  },
  {
    id: "desk-stretch-5",
    title: "Desk Stretch Reset",
    yogaType: "Stretching",
    difficulty: "Beginner",
    durationMinutes: 5,
    caloriesEstimate: 20,
    description: "Quick stretches for screen-heavy workdays.",
    focus: "Neck, shoulder and back relief",
    steps: [
      { title: "Neck Side Stretch", durationSeconds: 60 },
      { title: "Shoulder Circles", durationSeconds: 60 },
      { title: "Wrist Stretch", durationSeconds: 60 },
      { title: "Seated Twist", durationSeconds: 60 },
      { title: "Eye Relaxation", durationSeconds: 60 },
    ],
  },
  {
    id: "stress-breathing-7",
    title: "Stress Relief Breathing",
    yogaType: "Breathing",
    difficulty: "Beginner",
    durationMinutes: 7,
    caloriesEstimate: 10,
    description: "Calm breathing to reduce stress and reset focus.",
    focus: "Stress release and nervous system reset",
    steps: [
      { title: "Comfortable Seated Posture", durationSeconds: 60 },
      { title: "Slow Inhale", durationSeconds: 90 },
      { title: "Hold Gently", durationSeconds: 30 },
      { title: "Slow Exhale", durationSeconds: 90 },
      { title: "Silent Pause", durationSeconds: 30 },
    ],
  },
  {
    id: "energy-workout-15",
    title: "Energy Bodyweight Workout",
    yogaType: "Workout",
    difficulty: "Intermediate",
    durationMinutes: 15,
    caloriesEstimate: 75,
    description: "A simple no-equipment workout for daily energy.",
    focus: "Full body energy and light strength",
    steps: [
      { title: "March In Place", durationSeconds: 180 },
      { title: "Bodyweight Squats", durationSeconds: 240 },
      { title: "Wall Push-ups", durationSeconds: 240 },
      { title: "Standing Side Bends", durationSeconds: 120 },
      { title: "Cooldown Breathing", durationSeconds: 120 },
    ],
  },
];

function getLogId(uid: string, todayKey: string) {
  return `${uid}_${todayKey}_${Date.now()}`;
}

function estimateCalories(durationMinutes: number, difficulty: YogaDifficulty) {
  const perMinute =
    difficulty === "Advanced" ? 6 : difficulty === "Intermediate" ? 5 : 4;

  return Math.round(durationMinutes * perMinute);
}

function formatLogTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getYogaCatalog() {
  return YOGA_CATALOG;
}

export async function completeYogaSession({
  uid,
  title,
  yogaType,
  difficulty,
  durationMinutes,
  source = "manual",
}: CompleteYogaInput) {
  if (!uid) throw new Error("User not found");

  if (!durationMinutes || durationMinutes <= 0) {
    throw new Error("Session duration must be greater than 0");
  }

  const todayKey = getTodayKey();
  const now = new Date().toISOString();
  const caloriesBurned = estimateCalories(durationMinutes, difficulty);

  const logId = getLogId(uid, todayKey);
  const dailyStatsId = `${uid}_${todayKey}`;

  const yogaSessionRef = doc(db, COLLECTIONS.yogaSessions, logId);
  const dailyStatsRef = doc(db, COLLECTIONS.dailyStats, dailyStatsId);

  await runTransaction(db, async (transaction) => {
    const dailyStatsSnap = await transaction.get(dailyStatsRef);

    transaction.set(yogaSessionRef, {
      uid,
      dateKey: todayKey,
      title,
      yogaType,
      difficulty,
      durationMinutes,
      caloriesBurned,
      completed: true,
      source,
      loggedAt: now,
      device: "web",
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (dailyStatsSnap.exists()) {
      transaction.update(dailyStatsRef, {
        yogaMinutes: increment(durationMinutes),
        yogaSessions: increment(1),
        updatedAt: serverTimestamp(),
      });

      return;
    }

    transaction.set(dailyStatsRef, {
      uid,
      dateKey: todayKey,
      waterMl: 0,
      sleepMinutes: 0,
      yogaMinutes: durationMinutes,
      yogaSessions: 1,
      musicMinutes: 0,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getTodayYogaHistory(
  uid: string
): Promise<YogaHistoryItem[]> {
  const todayKey = getTodayKey();

  const sessionsRef = collection(db, COLLECTIONS.yogaSessions);

  const sessionsQuery = query(
    sessionsRef,
    where("uid", "==", uid),
    where("dateKey", "==", todayKey)
  );

  const snapshot = await getDocs(sessionsQuery);

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const loggedAt = String(data.loggedAt || "");

      return {
        title: String(data.title || "Yoga Session"),
        durationMinutes: Number(data.durationMinutes || 0),
        caloriesBurned: Number(data.caloriesBurned || 0),
        difficulty: data.difficulty as YogaDifficulty,
        time: formatLogTime(loggedAt),
        loggedAt,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
    )
    .map(({ title, durationMinutes, caloriesBurned, difficulty, time }) => ({
      title,
      durationMinutes,
      caloriesBurned,
      difficulty,
      time,
    }));
}

function yogaTypeFromAdmin(value: string): YogaType {
  const text = value.toLowerCase();
  if (text.includes("breath")) return "Breathing";
  if (text.includes("stretch")) return "Stretching";
  if (text.includes("workout")) return "Workout";
  return "Yoga";
}

function yogaDifficultyFromAdmin(
  value: string,
): YogaDifficulty {
  if (value === "advanced") return "Advanced";
  if (value === "intermediate") return "Intermediate";
  return "Beginner";
}

export async function getYogaCatalogWithAdminContent(): Promise<YogaCatalogItem[]> {
  const remoteContent = await listActiveProgramContent();
  const yogaMedia = remoteContent.filter((item) => item.category === "yoga");

  return YOGA_CATALOG.map((session) => {
    const fullVideo = yogaMedia.find(
      (item) =>
        item.targetId === session.id &&
        item.mediaRole === "full_session_video" &&
        Boolean(item.url),
    );

    const steps = session.steps.map((step) => {
      const stepId = step.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const mapped = yogaMedia.find(
        (item) =>
          item.parentTargetId === session.id &&
          item.targetId === stepId &&
          item.mediaRole === "exercise_video" &&
          Boolean(item.url),
      );

      return {
        ...step,
        id: stepId,
        videoUrl: mapped?.url,
      };
    });

    return {
      ...session,
      steps,
      videoUrl: fullVideo?.url,
      playbackMode: steps.some((step) => Boolean(step.videoUrl))
        ? "step_by_step"
        : "full_session",
    };
  });
}
