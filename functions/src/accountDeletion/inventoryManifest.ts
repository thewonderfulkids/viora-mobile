/**
 * Account-deletion inventory manifest. This is discovery metadata, NOT a deletion allowlist.
 * Shared family records and financial records require independent ownership/retention review.
 */
export const USER_QUERY_COLLECTIONS = [
  "dailyStats", "hydrationLogs", "sleepLogs", "yogaSessions", "musicSessions",
  "activities", "aiConversations", "aiMemory", "conversationSummaries",
  "aiRequestLogs", "journalEntries", "wellnessIntelligenceSnapshots",
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
  "voicePreferences",
] as const;

export const USER_OWNERSHIP_FIELDS = [
  "userId", "uid", "ownerUserId", "familyOwnerUserId",
] as const;

/** Never auto-delete these without an explicit data-retention and shared-data policy. */
export const REVIEW_REQUIRED_COLLECTIONS = [
  "payments", "subscriptions", "familyGroups", "familyMembers", "familyInvites",
] as const;

export const PROFILE_PHOTO_PREFIX = (uid: string) => `profile-photos/${uid}/`;
