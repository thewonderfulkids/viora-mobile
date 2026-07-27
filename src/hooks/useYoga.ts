import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
    completeYogaSession,
    getTodayYogaHistory,
    getYogaCatalogWithAdminContent,
    YogaCatalogItem,
    YogaHistoryItem,
} from "../services/yogaService";

export function useYoga() {
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [history, setHistory] = useState<YogaHistoryItem[]>([]);
  const [catalog, setCatalog] = useState<YogaCatalogItem[]>([]);
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

      const items = await getTodayYogaHistory(activeUser.uid);
      setHistory(items);
    } catch (err: any) {
      setError(err.message || "Unable to load yoga history");
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
        throw new Error("Session not found");
      }

      setSaving(true);
      setError(null);

      await completeYogaSession({
        uid: currentUser.uid,
        title: session.title,
        yogaType: session.yogaType,
        difficulty: session.difficulty,
        durationMinutes: session.durationMinutes,
        source: "manual",
      });

      await loadHistory(currentUser);
    } catch (err: any) {
      setError(err.message || "Unable to complete session");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void getYogaCatalogWithAdminContent().then(setCatalog).catch(() => setCatalog([]));
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
