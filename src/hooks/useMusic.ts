import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
    completeMusicSession,
    getMusicCatalog,
    getTodayMusicHistory,
    MusicCatalogItem,
    MusicHistoryItem,
} from "../services/musicService";

export function useMusic() {
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [history, setHistory] = useState<MusicHistoryItem[]>([]);
  const [catalog] = useState<MusicCatalogItem[]>(getMusicCatalog());
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

      const items = await getTodayMusicHistory(activeUser.uid);
      setHistory(items);
    } catch (err: any) {
      setError(err.message || "Unable to load music history");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function completeSession(sessionId: string) {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("Please login again");
      }

      const session = catalog.find((item) => item.id === sessionId);

      if (!session) {
        throw new Error("Music session not found");
      }

      setSaving(true);
      setError(null);

      await completeMusicSession({
        uid: currentUser.uid,
        title: session.title,
        therapyType: session.therapyType,
        durationMinutes: session.durationMinutes,
        source: "manual",
      });

      await loadHistory(currentUser);
    } catch (err: any) {
      setError(err.message || "Unable to complete music session");
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
    catalog,
    error,
    completeSession,
    refreshHistory: () => loadHistory(auth.currentUser),
  };
}