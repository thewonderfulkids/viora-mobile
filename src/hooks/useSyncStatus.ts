import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  buildAppDiagnostics,
  buildSyncSummary,
  clearSyncQueue,
  clearSyncedActions,
  flushSyncQueue,
  loadSyncQueue,
  queueOfflineAction,
} from "../services/sync";
import { PendingSyncAction, SyncActionType, SyncDashboard, SyncQueueSummary } from "../types";
import { useNetwork } from "./useNetwork";
import { useAuth } from "../context/AuthContext";
import { auth } from "../firebase/firebaseConfig";

export function useSyncStatus() {
  const { isOnline, isChecking, lastCheckedAt, refreshNetworkStatus } = useNetwork();
  const { user } = useAuth();
  const uid = user?.uid;
  const [queue, setQueue] = useState<PendingSyncAction[]>([]);
  const [summary, setSummary] = useState<SyncQueueSummary>({
    pendingCount: 0,
    failedCount: 0,
    syncedCount: 0,
    lastSyncedAt: null,
    lastQueuedAt: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasAutoSyncedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!uid) {
      setQueue([]);
      setSummary({ pendingCount: 0, failedCount: 0, syncedCount: 0, lastSyncedAt: null, lastQueuedAt: null });
      return;
    }
    const latestQueue = await loadSyncQueue();
    if (uid !== auth.currentUser?.uid) return;
    setQueue(latestQueue);
    setSummary(await buildSyncSummary(latestQueue));
  }, [uid]);

  useEffect(() => {
    hasAutoSyncedRef.current = false;
    setQueue([]);
    void refresh().catch(err => setError(err?.message || "Unable to load sync queue."));
  }, [refresh]);

  const runSync = useCallback(async () => {
    try {
      setError(null);
      setIsSyncing(true);

      if (!uid || !isOnline) {
        await refresh();
        return;
      }

      const nextQueue = await flushSyncQueue();
      setQueue(nextQueue);
      setSummary(await buildSyncSummary(nextQueue));
    } catch (err: any) {
      setError(err?.message || "Unable to sync right now.");
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, refresh, uid]);

  useEffect(() => {
    if (!uid || !isOnline) {
      hasAutoSyncedRef.current = false;
      return;
    }

    if (hasAutoSyncedRef.current) return;
    hasAutoSyncedRef.current = true;

    void runSync();
  }, [isOnline, runSync, uid]);

  const addTestAction = useCallback(async () => {
    if (!uid) throw new Error("Sign in to create a diagnostic action.");
    const nextQueue = await queueOfflineAction({
      userId: uid ?? "",
      type: "generic" as SyncActionType,
      title: "Beta diagnostic action",
      description: "Local-only sync test queued from diagnostics.",
      payload: { source: "sync-diagnostics" },
    });
    setQueue(nextQueue);
    setSummary(await buildSyncSummary(nextQueue));
  }, [uid]);

  const clearSynced = useCallback(async () => {
    const nextQueue = await clearSyncedActions();
    setQueue(nextQueue);
    setSummary(await buildSyncSummary(nextQueue));
  }, []);

  const clearAll = useCallback(async () => {
    const nextQueue = await clearSyncQueue();
    setQueue(nextQueue);
    setSummary(await buildSyncSummary(nextQueue));
  }, []);

  const checkNetwork = useCallback(async () => {
    await refreshNetworkStatus();
  }, [refreshNetworkStatus]);

  const dashboard: SyncDashboard = useMemo(() => ({
    isOnline,
    isCheckingNetwork: isChecking,
    isSyncing,
    queue,
    summary,
    diagnostics: buildAppDiagnostics({ isOnline, isCheckingNetwork: isChecking, lastCheckedAt }),
  }), [isChecking, isOnline, isSyncing, lastCheckedAt, queue, summary]);

  return {
    dashboard,
    error,
    refresh,
    runSync,
    checkNetwork,
    addTestAction,
    clearSynced,
    clearAll,
  };
}