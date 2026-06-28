import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
    addWaterLog,
    getTodayHydrationHistory,
    HydrationHistoryItem,
    removeWaterLog,
} from "../services/hydrationService";

export function useHydration() {
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [history, setHistory] = useState<HydrationHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);

  async function loadHistory(currentUser?: User | null) {
    try {
      const activeUser = currentUser ?? auth.currentUser;

      if (!activeUser) {
        setUid(null);
        setHistory([]);
        setLoadingHistory(false);
        return;
      }

      setUid(activeUser.uid);
      setLoadingHistory(true);
      setError(null);

      const items = await getTodayHydrationHistory(activeUser.uid);
      setHistory(items);
    } catch (err: any) {
      setError(err.message || "Unable to load hydration history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function addWater(amountMl: number) {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please login again");
      }

      setSaving(true);
      setError(null);

      await addWaterLog({
        uid: currentUser.uid,
        amountMl,
        source: "quick_add",
      });

      await loadHistory(currentUser);
    } catch (err: any) {
      setError(err.message || "Unable to add water");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function removeWater(amountMl: number) {
  try {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please login again");
    }

    setSaving(true);
    setError(null);

    await removeWaterLog({
      uid: currentUser.uid,
      amountMl,
      source: "manual",
    });

    await loadHistory(currentUser);
  } catch (err: any) {
    setError(err.message || "Unable to remove water");
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
    uid,
    saving,
    loadingHistory,
    history,
    error,
    addWater,
    removeWater,
    refreshHistory: () => loadHistory(auth.currentUser),
  };
}