import { User, onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";

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

  const requestVersion = useRef(0);

  async function loadDashboard(currentUser?: User | null) {
    const version = ++requestVersion.current;
    const activeUser = currentUser === undefined ? auth.currentUser : currentUser;
    const isCurrent = () => version === requestVersion.current && (auth.currentUser?.uid ?? null) === (activeUser?.uid ?? null);
    try {
      if (!isCurrent()) return;

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
        data: prev.uid === activeUser.uid ? prev.data : null,
        loading: true,
        error: null,
        uid: activeUser.uid,
      }));

      const dashboardData = await getDashboardData(activeUser.uid);

      if (!isCurrent()) return;
      setState({
        data: dashboardData,
        loading: false,
        error: null,
        uid: activeUser.uid,
      });
    } catch (error: any) {
      if (!isCurrent()) return;
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

    return () => {
      requestVersion.current += 1;
      unsubscribe();
    };
  }, []);

  return {
    ...state,
    refresh: () => loadDashboard(auth.currentUser),
  };
}