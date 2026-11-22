# Phase A — Account deletion inventory and destructive-operation gate

Status: **read-only inventory only**. No cleanup worker is authorized for production.

## Verified from code

- User requests are written to `accountDeletionRequests/{uid}` by an authenticated callable with a five-minute recent-login requirement.
- Super Admin preflight sets `status: preflight`; reset returns to `requested`. Neither operation deletes data.
- `previewAccountDeletion` requires admin custom claims and an active request. It checks known top-level collections for `userId`, `uid`, `ownerUserId`, `familyOwnerUserId`; checks direct UID documents; enumerates profile-photo objects with pagination (up to 10,000).
- The inventory is **not exhaustive**. Counts across owner fields overlap.

## Must be resolved before enabling deletion

1. Discover and document all data sources (including collection-group subcollections, UID-prefixed document IDs, Storage paths, external vendors, local device state, and linked family data). Confirm ownership rules for shared family records.
2. Define legally required retention and billing records; separate erase-now data from retain-for-obligation records. Preserve minimal audit evidence without retaining unnecessary personal data.
3. Design bounded, resumable deletion batches with durable checkpoints, retry/backoff, idempotency and clear partial-failure states. Never remove Firebase Auth before all deletable user data has been cleaned and verified.
4. Require explicit user confirmation and fresh authentication; prevent active data writes during deletion without locking out recovery. Define re-registration behavior.
5. Test with synthetic accounts containing data in every collection and Storage path, plus partial failure, timeout, duplicate invocation, concurrent writes, and shared-family cases.
6. Obtain explicit production approval and deploy security rules/functions together. Run a dry-run and compare post-cleanup inventory before authorizing the final Auth delete.

**Hard gate:** No destructive worker is exported or deployed in this phase. Preflight status is not permission to delete.
