import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import { SleepQuality } from "../firebase/firestoreTypes";
import {
    addSleepLog,
    getTodaySleepHistory,
    SleepHistoryItem,
} from "../services/sleepService";

export function useSleep() {
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [history, setHistory] = useState<SleepHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadHistory(currentUser?: User | null) {
    try {
      const activeUser = currentUser ?? auth.currentUser;

      if (!activeUser) {
        setHistory([]);
        setLoadingHistory(false);
        return;
      }

      setLoadingHistory(true);
      setError(null);

      const items = await getTodaySleepHistory(activeUser.uid);
      setHistory(items);
    } catch (err: any) {
      setError(err.message || "Unable to load sleep history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function addSleep({
    sleepStart,
    sleepEnd,
    quality,
  }: {
    sleepStart: string;
    sleepEnd: string;
    quality: SleepQuality;
  }) {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please login again");
      }

      setSaving(true);
      setError(null);

      await addSleepLog({
        uid: currentUser.uid,
        sleepStart,
        sleepEnd,
        quality,
        source: "manual",
      });

      await loadHistory(currentUser);
    } catch (err: any) {
      setError(err.message || "Unable to save sleep");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      loadHistory(currentUser);
    });

    return unsubscribe;
  }, []);

  return {
    saving,
    loadingHistory,
    history,
    error,
    addSleep,
    refreshHistory: () => loadHistory(auth.currentUser),
  };
}