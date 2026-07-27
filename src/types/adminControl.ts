import { PremiumPlanCode } from "./premium";

export type AdminContentKind = "video" | "music" | "program" | "tip" | "announcement";

export type AdminContentCategory =
  | "home_workout"
  | "yoga"
  | "weight_loss"
  | "music"
  | "meditation"
  | "sleep"
  | "dashboard"
  | "general";

export type AdminMediaType = "video" | "audio" | "mixed" | "none";

export type AdminMappingTargetType =
  | "program"
  | "session"
  | "exercise"
  | "pose"
  | "track"
  | "playlist";

export type AdminMediaRole =
  | "full_session_video"
  | "exercise_video"
  | "audio_track"
  | "background_music"
  | "preview_clip";

export type AdminManagedContent = {
  id: string;
  kind: AdminContentKind;
  title: string;
  subtitle: string;
  category: AdminContentCategory;
  level: "beginner" | "intermediate" | "advanced" | "all";
  durationMinutes: number;
  url: string;
  thumbnailUrl: string;
  storagePath?: string;
  thumbnailStoragePath?: string;
  mediaFileName?: string;
  mediaContentType?: string;
  provider: "youtube" | "firebase" | "external" | "none";
  mediaType?: AdminMediaType;
  mappingTargetType?: AdminMappingTargetType;
  targetId?: string;
  parentTargetId?: string;
  mediaRole?: AdminMediaRole;
  playbackMode?: "full_session" | "step_by_step";
  caloriesEstimate?: number;
  equipment?: string[];
  instructor?: string;
  benefits?: string[];
  steps?: string[];
  isPremium: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminAppConfig = {
  id: "global";
  betaMode: boolean;
  premiumBypassEnabled: boolean;
  appTourEnabled: boolean;
  musicEnabled: boolean;
  videoProgramsEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  minimumAppVersion: string;
  latestApkVersion: string;
  supportEmail: string;
  updatedAt: string;
};

export type AdminUserSearchResult = {
  uid: string;
  email: string;
  fullName: string;
  mobile?: string;
  isDisabled?: boolean;
  currentPlan?: PremiumPlanCode | string;
};

export type AdminStats = {
  users: number;
  subscriptions: number;
  betaFeedback: number;
  clientErrorLogs: number;
  activeMedia: number;
};

export type AdminControlState = {
  stats: AdminStats;
  appConfig: AdminAppConfig;
  content: AdminManagedContent[];
};

export type AdminContentInput = Omit<AdminManagedContent, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
