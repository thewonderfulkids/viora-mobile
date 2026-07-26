# Sprint 26 — V1 Launch Candidate

## Scope
Sprint 26 is the frozen-scope V1 Launch Candidate pass. It does not add a new wellness module and does not change the project architecture. It adds a small release-readiness layer inside the existing Repository + Service + Hook + Component pattern so the APK beta build can be verified before V1 sign-off.

## Added files
- `src/app/launch-candidate.tsx`
- `src/components/launch/LaunchReadinessPanel.tsx`
- `src/components/launch/index.ts`
- `src/hooks/useLaunchCandidate.ts`
- `src/repositories/launchAuditRepository.ts`
- `src/services/launchCandidate/launchCandidateService.ts`
- `src/services/launchCandidate/index.ts`
- `src/types/launchCandidate.ts`
- `SPRINT_26_CHANGES.md`

## Modified files
- `src/app/settings-center.tsx`
- `src/components/index.ts`
- `src/hooks/index.ts`
- `src/repositories/index.ts`
- `src/services/index.ts`
- `src/types/index.ts`

## What changed
- Added `/launch-candidate` screen for V1 release readiness.
- Added Settings Center entry: `V1 Launch Candidate`.
- Added release checks for:
  - app version
  - Android package
  - Android notification permission
  - Expo Router plugin
  - branding assets
  - Sprint 25 production error boundary
  - Sprint 25 beta feedback flow
  - wellness intelligence safe defaults
  - Firestore support rules readiness
  - offline sync queue health
  - manual APK smoke testing
- Added final APK checklist directly inside the app.
- Added final build/deploy commands directly inside the app.
- Saved latest local launch audit snapshot using AsyncStorage.

## Firestore
No Firestore rules changes in Sprint 26.

No Firestore index changes in Sprint 26.

## Required commands
Run after applying patch:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```

If you are deploying Firebase again:

```bash
firebase deploy --only firestore
```

## APK test checklist
- Fresh install -> Welcome -> Signup -> Dashboard opens without layout overlap.
- Login existing beta user -> profile photo loads and update flow works on Android.
- Hydration, Sleep, Yoga, Nutrition and Mood screens open and save normal entries.
- AI Coach, AI Memory and Wellness Intelligence open with safe empty states.
- Smart Notifications permission prompt appears and reminder settings save correctly.
- Settings Center -> Sync & Diagnostics -> run test action, sync, clear synced items.
- Settings Center -> Bug Report & Beta Feedback -> submit one test issue.
- Settings Center -> V1 Launch Candidate -> review readiness score and checklist.
- Android back button returns to the previous screen and never exits nested flow unexpectedly.
- Airplane mode -> offline banner stable; reconnect -> no infinite loop.
- No white-on-white text, broken cards, Sprint placeholder text or missing route navigation.

## Expected result
- TypeScript clean.
- Expo Doctor clean.
- Web export successful.
- New static route appears in web export: `/launch-candidate`.
- APK beta has final V1 readiness screen under Settings Center.
