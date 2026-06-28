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
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { getTodayKey } from "../firebase/firestoreHelpers";
import {
    MusicSource,
    MusicTherapyType,
} from "../firebase/firestoreTypes";

type CompleteMusicInput = {
  uid: string;
  title: string;
  therapyType: MusicTherapyType;
  durationMinutes: number;
  source?: MusicSource;
};

export type MusicHistoryItem = {
  title: string;
  therapyType: MusicTherapyType;
  durationMinutes: number;
  time: string;
};

export type MusicCatalogItem = {
  id: string;
  title: string;
  therapyType: MusicTherapyType;
  durationMinutes: number;
  description: string;
};

export const MUSIC_CATALOG: MusicCatalogItem[] = [
  {
    id: "relax-10",
    title: "Deep Relaxation",
    therapyType: "Relax",
    durationMinutes: 10,
    description: "Gentle ambient sounds to calm your mind.",
  },
  {
    id: "sleep-20",
    title: "Sleep Therapy",
    therapyType: "Sleep",
    durationMinutes: 20,
    description: "Prepare your body for deep sleep.",
  },
  {
    id: "focus-15",
    title: "Focus Booster",
    therapyType: "Focus",
    durationMinutes: 15,
    description: "Background sounds to improve concentration.",
  },
  {
    id: "nature-10",
    title: "Nature Escape",
    therapyType: "Nature",
    durationMinutes: 10,
    description: "Birds, rain and forest ambience.",
  },
];

function getLogId(uid: string, todayKey: string) {
  return `${uid}_${todayKey}_${Date.now()}`;
}

function formatLogTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMusicCatalog() {
  return MUSIC_CATALOG;
}

export async function completeMusicSession({
  uid,
  title,
  therapyType,
  durationMinutes,
  source = "manual",
}: CompleteMusicInput) {
  const todayKey = getTodayKey();
  const now = new Date().toISOString();

  const logId = getLogId(uid, todayKey);
  const dailyStatsId = `${uid}_${todayKey}`;

  const musicRef = doc(db, COLLECTIONS.musicSessions, logId);
  const dailyStatsRef = doc(db, COLLECTIONS.dailyStats, dailyStatsId);

  await runTransaction(db, async (transaction) => {
    const dailyStatsSnap = await transaction.get(dailyStatsRef);

    transaction.set(musicRef, {
      uid,
      dateKey: todayKey,
      title,
      therapyType,
      durationMinutes,
      completed: true,
      source,
      playedAt: now,
      device: "web",
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (dailyStatsSnap.exists()) {
      transaction.update(dailyStatsRef, {
        musicMinutes: increment(durationMinutes),
        updatedAt: serverTimestamp(),
      });

      return;
    }

    transaction.set(dailyStatsRef, {
      uid,
      dateKey: todayKey,
      waterMl: 0,
      sleepMinutes: 0,
      yogaMinutes: 0,
      musicMinutes: durationMinutes,
      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getTodayMusicHistory(
  uid: string
): Promise<MusicHistoryItem[]> {
  const todayKey = getTodayKey();

  const musicRef = collection(db, COLLECTIONS.musicSessions);

  const musicQuery = query(
    musicRef,
    where("uid", "==", uid),
    where("dateKey", "==", todayKey)
  );

  const snapshot = await getDocs(musicQuery);

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      const playedAt = String(data.playedAt || "");

      return {
        title: String(data.title || ""),
        therapyType: data.therapyType as MusicTherapyType,
        durationMinutes: Number(data.durationMinutes || 0),
        time: formatLogTime(playedAt),
        playedAt,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()
    )
    .map(({ title, therapyType, durationMinutes, time }) => ({
      title,
      therapyType,
      durationMinutes,
      time,
    }));
}