export type SyncActionStatus = "pending" | "syncing" | "synced" | "failed";

export type SyncActionType =
  | "hydration_log"
  | "nutrition_entry"
  | "mood_entry"
  | "goal_update"
  | "habit_completion"
  | "profile_update"
  | "report_export"
  | "voice_command"
  | "generic";

export type PendingSyncAction = {
  id: string;
  userId: string;
  type: SyncActionType;
  title: string;
  description: string;
  payload: Record<string, unknown>;
  status: SyncActionStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastError?: string;
};

export type SyncQueueSummary = {
  pendingCount: number;
  failedCount: number;
  syncedCount: number;
  lastSyncedAt: string | null;
  lastQueuedAt: string | null;
};

export type AppDiagnostics = {
  appVersion: string;
  buildNumber: string;
  platform: string;
  deviceName: string;
  osName: string;
  osVersion: string;
  isDevice: boolean;
  networkLabel: string;
  lastCheckedAt: string | null;
  generatedAt: string;
};

export type SyncDashboard = {
  isOnline: boolean;
  isCheckingNetwork: boolean;
  isSyncing: boolean;
  queue: PendingSyncAction[];
  summary: SyncQueueSummary;
  diagnostics: AppDiagnostics;
};
