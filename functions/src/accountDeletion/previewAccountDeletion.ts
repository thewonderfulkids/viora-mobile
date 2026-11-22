import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { HttpsError, onCall } from "firebase-functions/v2/https";

/**
 * Read-only pre-deletion inventory. Never deletes or modifies user data.
 * An administrator must review the inventory before enabling a deletion worker.
 */
const OWNED_COLLECTIONS = [
  "hydrationLogs", "sleepLogs", "yogaSessions", "musicSessions", "activities",
  "journalEntries", "aiConversations", "aiMemory", "conversationSummaries",
  "wellnessIntelligence", "wellnessIntelligenceSnapshots", "wellnessGoals",
  "wellnessHabits", "habitCompletions", "notifications", "nutritionEntries",
  "nutritionSummaries", "nutritionGoals", "moodEntries", "moodCheckIns",
  "mentalWellnessSummaries", "mentalWellnessGoals", "wellnessReports",
  "nutritionReports", "mentalWellnessReports", "goalReports", "reportExports",
  "voiceCommands", "voiceSessions", "familyGroups", "familyMembers",
  "familyInvites", "betaFeedback", "clientErrorLogs", "subscriptions",
  "payments",
] as const;

const DIRECT_DOCUMENTS = [
  "users", "userSettings", "userWellnessProfiles", "reminderSettings",
  "voicePreferences", "privacySettings", "securitySettings",
] as const;

export const previewAccountDeletion = onCall(
  { region: "asia-south1", enforceAppCheck: false },
  async (request) => {
    const adminUid = request.auth?.uid;
    if (!adminUid) throw new HttpsError("unauthenticated", "Sign in as an administrator.");
    const admin = await getAuth().getUser(adminUid);
    const claims = admin.customClaims ?? {};
    if (claims.admin !== true && claims.superAdmin !== true &&
        !["admin", "super_admin"].includes(String(claims.role ?? ""))) {
      throw new HttpsError("permission-denied", "Administrator privileges required.");
    }
    const uid = String(request.data?.userId ?? "").trim();
    if (!uid || uid.length > 128 || uid.includes("/")) {
      throw new HttpsError("invalid-argument", "Valid user ID required.");
    }
    const db = getFirestore();
    const deletionRequest = await db.doc(`accountDeletionRequests/${uid}`).get();
    if (!deletionRequest.exists || !["requested", "preflight", "processing"].includes(String(deletionRequest.data()?.status))) {
      throw new HttpsError("failed-precondition", "No active deletion request exists.");
    }
    const directDocs = await Promise.all(DIRECT_DOCUMENTS.map(async collection => ({
      collection, exists: (await db.doc(`${collection}/${uid}`).get()).exists,
    })));
    const collectionCounts: { collection: string; field: string; count: number }[] = [];
    const queryErrors: { collection: string; field: string; message: string }[] = [];
    for (const collection of OWNED_COLLECTIONS) {
      for (const field of ["userId", "uid", "ownerUserId", "familyOwnerUserId"] as const) {
        try {
          const result = await db.collection(collection).where(field, "==", uid).count().get();
          collectionCounts.push({ collection, field, count: result.data().count });
        } catch (error) {
          queryErrors.push({ collection, field, message: error instanceof Error ? error.message : "Query failed" });
        }
      }
    }
    let avatarCount = 0;
    let storageTruncated = false;
    try {
      let pageToken: string | undefined;
      do {
        const [files, , response] = await getStorage().bucket().getFiles({ prefix: `profile-photos/${uid}/`, autoPaginate: false, maxResults: 1000, pageToken });
        avatarCount += files.length;
        pageToken = (response as { nextPageToken?: string } | undefined)?.nextPageToken;
        if (avatarCount >= 10000 && pageToken) { storageTruncated = true; break; }
      } while (pageToken);
    } catch (error) {
      queryErrors.push({ collection: "storage:profile-photos", field: "prefix", message: error instanceof Error ? error.message : "Storage query failed" });
    }
    return {
      userId: uid, requestStatus: deletionRequest.data()?.status,
      directDocs, collectionCounts, avatarFileCount: avatarCount, storageTruncated, queryErrors,
      incomplete: true,
      warning: "Read-only inventory. Counts across fields overlap and must not be added. Document-ID-prefix records, unknown collections, nested subcollections, retention obligations, and other Storage paths may exist. Do not use this inventory as authorization to delete.",
    };
  }
);
