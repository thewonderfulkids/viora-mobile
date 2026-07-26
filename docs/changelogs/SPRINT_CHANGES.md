# Viora Sprint 25 — Production Hardening + Wellness Intelligence Stabilization

## Scope
Sprint 25 stays inside frozen V1 scope. It adds production hardening, beta issue reporting, safer intelligence defaults, Android polish, sync/offline safety checks, export/index updates, and Firebase rules/index support for support records.

## Added Files
- `src/app/beta-feedback.tsx`
- `src/components/common/ProductionErrorBoundary.tsx`
- `src/components/feedback/BetaFeedbackForm.tsx`
- `src/components/feedback/index.ts`
- `src/hooks/useBetaFeedback.ts`
- `src/repositories/betaFeedbackRepository.ts`
- `src/repositories/errorLogRepository.ts`
- `src/services/support/betaFeedbackService.ts`
- `src/services/support/errorLogService.ts`
- `src/services/support/index.ts`
- `src/types/betaFeedback.ts`
- `src/types/errorLog.ts`

## Modified Files
- `src/app/_layout.tsx`
- `src/app/settings-center.tsx`
- `src/components/common/CommonBackButton.tsx`
- `src/components/common/index.ts`
- `src/components/index.ts`
- `src/firebase/firestoreCollections.ts`
- `src/hooks/index.ts`
- `src/repositories/index.ts`
- `src/services/dashboardService.ts`
- `src/services/dashboardIntelligence/dashboardIntelligenceService.ts`
- `src/services/index.ts`
- `src/types/index.ts`
- `firestore.rules`
- `firestore.indexes.json`
- `SPRINT_CHANGES.md`

## Implementation Summary
1. Added an app-level production error boundary with a friendly fallback, Retry action, Go Home action, and Firestore logging-ready support.
2. Added beta feedback flow from Settings Center with APK-friendly keyboard behavior and automatic device/build diagnostics.
3. Added Firestore-backed `betaFeedback` and `clientErrorLogs` support through repository + service layers.
4. Stabilized wellness score logic to use proportional scoring instead of only threshold jumps.
5. Strengthened dashboard intelligence empty-state guidance so zero-data users get safe first-action instructions.
6. Updated barrel exports across components, hooks, services, repositories and types.
7. Added complete Firestore rules and indexes while preserving existing indexes.

## Test Steps
Run after applying the patch and installing dependencies:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```

If Firebase rules/indexes are deployed:

```bash
firebase deploy --only firestore
```

## APK Test Checklist
- Open app and confirm root layout loads without white screen.
- Force a JS error in a temporary local test screen and confirm fallback shows Retry and Go Home.
- Settings Center shows `Bug Report & Beta Feedback`.
- Open Beta Feedback screen from Settings.
- Submit with empty fields and confirm validation blocks submission.
- Submit a real beta issue and confirm Firestore document appears in `betaFeedback`.
- Confirm screen does not hide fields behind Android keyboard.
- Confirm Settings back button returns to previous screen or Settings fallback safely.
- Confirm Dashboard still loads intelligence cards with fresh/empty user data.
- Confirm Sync Diagnostics opens and queue actions do not loop infinitely.
- Confirm Offline Banner count remains stable while toggling network.
- Confirm no broken clickable cards or placeholder Sprint text in Settings.
