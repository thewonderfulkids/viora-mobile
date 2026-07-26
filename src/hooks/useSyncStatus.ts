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

export function useSyncStatus() {
  const { isOnline, isChecking, lastCheckedAt, refreshNetworkStatus } = useNetwork();
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
    const latestQueue = await loadSyncQueue();
    setQueue(latestQueue);
    setSummary(await buildSyncSummary(latestQueue));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runSync = useCallback(async () => {
    try {
      setError(null);
      setIsSyncing(true);

      if (!isOnline) {
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
  }, [isOnline, refresh]);

  useEffect(() => {
    if (!isOnline) {
      hasAutoSyncedRef.current = false;
      return;
    }

    if (hasAutoSyncedRef.current) return;
    hasAutoSyncedRef.current = true;

    void runSync();
  }, [isOnline, runSync]);

  const addTestAction = useCallback(async () => {
    const nextQueue = await queueOfflineAction({
      userId: "local-beta-user",
      type: "generic" as SyncActionType,
      title: "Beta diagnostic action",
      description: "Local-only sync test queued from diagnostics.",
      payload: { source: "sync-diagnostics" },
    });
    setQueue(nextQueue);
    setSummary(await buildSyncSummary(nextQueue));
  }, []);

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