/**
 * Account-deletion inventory manifest. This is discovery metadata, NOT a deletion allowlist.
 * Shared family records and financial records require independent ownership/retention review.
 */
export const USER_QUERY_COLLECTIONS = [
  "dailyStats", "hydrationLogs", "sleepLogs", "yogaSessions", "musicSessions",
  "activities", "aiConversations", "aiMemory", "conversationSummaries",
  "wellnessIntelligence", "moodCheckIns", "mentalWellnessGoals",
  "premiumProgramEntitlements", "privacySettings", "securitySettings",
  "aiRateLimits", "aiRequestLogs", "journalEntries", "wellnessIntelligenceSnapshots",
  "wellnessGoals", "wellnessHabits", "habitCompletions", "nutritionEntries",
  "nutritionSummaries", "nutritionGoals", "moodEntries",
  "mentalWellnessSummaries", "wellnessReports", "nutritionReports",
  "mentalWellnessReports", "goalReports", "reportExports", "voiceCommands",
  "voiceSessions", "notifications", "familyGroups", "familyMembers",
  "familyInvites", "betaFeedback", "clientErrorLogs", "subscriptions",
  "payments",
] as const;

export const USER_UID_DOCUMENT_COLLECTIONS = [
  "users", "userSettings", "userWellnessProfiles", "reminderSettings",
  "voicePreferences", "aiRateLimits", "privacySettings", "securitySettings",
] as const;

export const USER_OWNERSHIP_FIELDS = [
  "userId", "uid", "ownerUserId", "familyOwnerUserId", "invoiceOwnerUserId",
] as const;

/** Never auto-delete these without an explicit data-retention and shared-data policy. */
export const REVIEW_REQUIRED_COLLECTIONS = [
  "payments", "subscriptions", "familyGroups", "familyMembers", "familyInvites",
  "premiumProgramEntitlements",
] as const;

export const PROFILE_PHOTO_PREFIX = (uid: string) => `profile-photos/${uid}/`;

/** Non-Firestore sources discovered in repository review; not deletion instructions. */
export const ADDITIONAL_INVENTORY_SOURCES = [
  { source: "firebase-auth", scope: "account", status: "generation_review_required" },
  { source: "profile-photos/{uid}/", scope: "account", status: "token_and_object_review_required" },
  { source: "viora-media/", scope: "shared_admin_content", status: "ownership_review_required" },
  { source: "@viora/sync-queue/v2/{uid}", scope: "device_account", status: "device_cleanup_required" },
  { source: "@viora/sync-queue/v2/last-synced-at/{uid}", scope: "device_account", status: "device_cleanup_required" },
  { source: "@viora/sync-queue/v1", scope: "mixed_device", status: "manual_ownership_review_required" },
  { source: "@viora/steps/by-user/{encodedUid}/", scope: "device_account", status: "device_cleanup_required" },
  { source: "@viora/premium-v3/{encodedUid}/", scope: "device_account", status: "device_cleanup_required" },
  { source: "@viora/premium-reminders-v2", scope: "mixed_device", status: "manual_ownership_review_required" },
  { source: "native-notification-schedules", scope: "device_account", status: "cancel_and_verify_required" },
  { source: "viora_app_language", scope: "device_preference", status: "preserve_pending_policy" },
  { source: "payment-provider-records", scope: "external_unverified", status: "provider_and_retention_review_required" },
] as const;
