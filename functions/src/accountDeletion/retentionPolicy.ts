import { REVIEW_REQUIRED_COLLECTIONS } from "./inventoryManifest";

export type RetentionDecision = "manual_retention_review" | "shared_ownership_review" | "preserve_control_record" | "unclassified";

/** Preliminary policy only: no collection is authorized for automatic erasure. */
export function classifyRetention(collection: string): RetentionDecision {
  if (["accountDeletionLocks", "accountDeletionRequests", "aiGlobalBudget"].includes(collection)) {
    return "preserve_control_record";
  }
  if (["familyGroups", "familyMembers", "familyInvites"].includes(collection)) {
    return "shared_ownership_review";
  }
  if ((REVIEW_REQUIRED_COLLECTIONS as readonly string[]).includes(collection)) {
    return "manual_retention_review";
  }
  return "unclassified";
}
