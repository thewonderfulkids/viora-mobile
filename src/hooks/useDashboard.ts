import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { auth } from "../firebase/firebaseConfig";
import {
  DashboardData,
  getDashboardData,
} from "../services/dashboardService";

type DashboardState = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  uid: string | null;
};

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    uid: null,
  });

  async function loadDashboard(currentUser?: User | null) {
    try {
      const activeUser = currentUser ?? auth.currentUser;

      if (!activeUser) {
        setState({
          data: null,
          loading: false,
          error: "User not logged in",
          uid: null,
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        uid: activeUser.uid,
      }));

      const dashboardData = await getDashboardData(activeUser.uid);

      setState({
        data: dashboardData,
        loading: false,
        error: null,
        uid: activeUser.uid,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load dashboard",
      }));
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      loadDashboard(currentUser);
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    refresh: () => loadDashboard(auth.currentUser),
  };
}