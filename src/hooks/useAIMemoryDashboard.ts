import { User, onAuthStateChanged } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import { getMemoryDashboard } from "../repositories/memoryRepository";
import { AIMemoryDashboard } from "../types/aiMemory";

type AIMemoryDashboardState = {
  data: AIMemoryDashboard | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  uid: string | null;
};

export function useAIMemoryDashboard() {
  const [state, setState] = useState<AIMemoryDashboardState>({
    data: null,
    loading: true,
    refreshing: false,
    error: null,
    uid: null,
  });

  const loadDashboard = useCallback(
    async (currentUser?: User | null, refreshMode = false) => {
      try {
        const activeUser = currentUser ?? auth.currentUser;

        if (!activeUser) {
          setState({
            data: null,
            loading: false,
            refreshing: false,
            error: "User not logged in",
            uid: null,
          });
          return;
        }

        setState((prev) => ({
          ...prev,
          loading: refreshMode ? prev.loading : true,
          refreshing: refreshMode,
          error: null,
          uid: activeUser.uid,
        }));

        const dashboard = await getMemoryDashboard(activeUser.uid);

        setState({
          data: dashboard,
          loading: false,
          refreshing: false,
          error: null,
          uid: activeUser.uid,
        });
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: error?.message || "Failed to load AI memory dashboard",
        }));
      }
    },
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      loadDashboard(currentUser);
    });

    return unsubscribe;
  }, [loadDashboard]);

  return {
    ...state,
    refresh: () => loadDashboard(auth.currentUser, true),
  };
}
