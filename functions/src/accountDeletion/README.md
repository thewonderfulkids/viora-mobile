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

## Ownership audit checkpoint (2026-11)

- The inventory manifest now covers the app's declared per-user collections, including `dailyStats` and `aiRequestLogs` previously missing from the preview.
- `users/{uid}`, `userSettings/{uid}`, `userWellnessProfiles/{uid}`, `reminderSettings/{uid}`, and `voicePreferences/{uid}` are probed as UID documents.
- `payments`, `subscriptions`, and `family*` collections are marked review-required; the owner of a family group is not necessarily the owner of every member's data.
- Shared global collections (`appSettings`, `adminContent`, `premiumFeatures`, `premiumProgramEntitlements`) are not assumed to belong to a deleting user.
- Queries on four ownership fields can overlap. The inventory is diagnostic, not an exact document count or safe deletion plan.
- Additional collections may exist outside the mobile constants; the discovery function lists live top-level collection names, but no production scan has been run.

**Next gate:** audit every repository write path and verify all UID-linked document ID formats, nested descendants, external integrations, and retention rules. No destructive worker should be enabled yet.

## Repository-level ownership findings

| Data source | Write pattern observed | Deletion implication |
|---|---|---|
| `reminderSettings` | UID document ID | Direct UID probe; check nested descendants |
| `wellnessGoals`, `wellnessHabits`, `nutritionEntries`, `moodEntries` | User ID field on random-ID documents | Query by `userId` |
| `habitCompletions`, `mentalWellnessSummaries` | Composite ID beginning with UID, plus `userId` field | Query by owner field; ID-prefix-only scan insufficient |
| `aiMemory`, `conversationSummaries` | Random IDs and `userId` field | Query by owner field |
| `userWellnessProfiles` | UID document ID | Direct UID probe |
| `familyGroups`, `familyMembers` | Owner ID plus family ID and member ID | Shared-member review mandatory; do not blindly cascade |
| `subscriptions`, `payments` | `userId` and `invoiceOwnerUserId` | Financial retention review mandatory |
| `profile-photos/{uid}/` | Versioned avatar objects | Storage prefix scan; pagination and failure handling mandatory |

These findings were checked against the named repository files; they do **not** prove complete coverage of all writes, nested paths or third-party systems. No deletion should occur based on this audit alone.

## Additional write-path audit: voice, diagnostics, sync and AI (2026-11)

| Source inspected | Observed ownership / storage | Required treatment |
|---|---|---|
| `voiceRepository.ts` | `voiceCommands` documents queried by `userId` | Included in owner-field inventory |
| `wellnessIntelligenceRepository.ts` | `dailyStats` queried by `uid`; `wellnessIntelligenceSnapshots` composite `{uid}_{dateKey}` ID plus `userId` | Both fields must be scanned; do not assume UID document ID |
| `aiCoachRepository.ts` | Delegates conversation persistence to AI services | **Open**: inspect delegated service writes and thread/message subcollections |
| `errorLogRepository.ts` | Random-ID `clientErrorLogs` with spread `ClientErrorLogRecord` | **Open**: verify actual identity field and retention policy |
| `betaFeedbackRepository.ts` | Random-ID `betaFeedback` with spread `BetaFeedbackRecord` | **Open**: verify actual identity field and retention policy |
| `userRepository.ts` | `users/{uid}` | UID document scan; verify nested collections |
| `syncQueueRepository.ts` | Device-local AsyncStorage keys `@viora/sync-queue/v1` and `@viora/sync-queue/last-synced-at` | **Critical**: shared local queue is not UID-namespaced; do not clear it indiscriminately or replay stale actions after account deletion |

### Deletion worker blocker: local queue

The current sync queue uses global device keys rather than per-user keys. Account deletion must not erase another account's pending actions on a shared device, and subsequent sign-in must not replay a deleted account's actions. Resolve per-user queue partitioning and logout/deletion lifecycle before enabling destructive deletion.

### Audit limitations

This audit reviewed the listed repository source files only. Delegated services, type definitions, Cloud Functions, all nested paths, and external retention obligations remain unverified. The existing preview and discovery functions must continue returning `incomplete: true` / `complete: false`.
