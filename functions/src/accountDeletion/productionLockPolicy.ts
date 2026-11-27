/**
 * Internal eligibility policy only. Not a callable or a lock writer.
 * Production activation requires a separate reviewed deployment and
 * exhaustive inventory, retention and in-flight writer coordination.
 */
export interface LockCandidate {
  uid: string;
  authCreationTime: string;
  request: { userId?: unknown; authCreationTime?: unknown; status?: unknown };
  existingLock: boolean;
  actorLocked: boolean;
}

export function assertLockCandidate(candidate: LockCandidate): void {
  const { uid, authCreationTime, request, existingLock, actorLocked } = candidate;
  if (!uid || uid.length > 128 || uid.includes("/") ||
      !authCreationTime || !Number.isFinite(Date.parse(authCreationTime))) {
    throw new Error("Invalid account identity");
  }
  if (actorLocked || existingLock) {
    throw new Error("Existing deletion lock requires recovery review");
  }
  if (request.userId !== uid || request.authCreationTime !== authCreationTime ||
      request.status !== "preflight") {
    throw new Error("Matching prepared deletion request required");
  }
}

/** No production activation is permitted by this module. */
export function assertProductionLockActivationDisabled(): never {
  throw new Error("Production deletion lock activation disabled pending security and retention audit");
}
