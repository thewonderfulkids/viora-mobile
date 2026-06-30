export type FamilyMemberRole = "owner" | "spouse" | "child" | "parent" | "member";

export type FamilyMemberStatus = "active" | "invited" | "paused" | "removed";

export type FamilyPermissionKey =
  | "view_dashboard"
  | "view_reports"
  | "view_mood"
  | "view_nutrition"
  | "manage_reminders"
  | "manage_profile";

export type FamilyMember = {
  id: string;
  familyId: string;
  ownerUserId: string;
  userId: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
  role: FamilyMemberRole;
  status: FamilyMemberStatus;
  avatarEmoji: string;
  relationLabel: string;
  permissions: FamilyPermissionKey[];
  wellnessScore: number;
  hydrationStatus: "low" | "good" | "excellent";
  sleepStatus: "low" | "good" | "excellent";
  moodStatus: "needs_attention" | "steady" | "positive";
  lastCheckInAt: string | null;
  inviteCode: string | null;
  invitedAt: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type FamilyGroup = {
  id: string;
  ownerUserId: string;
  name: string;
  planCode: "FREE" | "PLUS_MONTHLY" | "PLUS_YEARLY" | "PRO_YEARLY" | "ELITE_FAMILY_YEARLY";
  maxMembers: number;
  activeMemberCount: number;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type FamilyInsightTone = "positive" | "warning" | "neutral";

export type FamilyInsight = {
  id: string;
  title: string;
  message: string;
  tone: FamilyInsightTone;
  relatedMemberId: string | null;
};

export type FamilyDashboardMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: FamilyInsightTone;
};

export type FamilyInviteInput = {
  displayName: string;
  email?: string;
  phone?: string;
  role: Exclude<FamilyMemberRole, "owner">;
  relationLabel?: string;
  permissions?: FamilyPermissionKey[];
};

export type FamilyDashboard = {
  family: FamilyGroup;
  members: FamilyMember[];
  metrics: FamilyDashboardMetric[];
  insights: FamilyInsight[];
  canInviteMore: boolean;
  remainingSlots: number;
  eliteFamilyReady: boolean;
  aiSummary: string;
};
