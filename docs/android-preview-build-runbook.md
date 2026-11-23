# Android preview APK — safe activation and verification

## Verified on 2026-11-23

- Migration branch: `chore/expo-sdk-57-migration` (PR #2), based on Phase A PR #1.
- Expo SDK 57 migration and Phase A validation passed on commit `55ca66db1ccc889b551e0adb33c83a6614b4297c` (Actions runs 45096372463 and 45096372390).
- `.github/workflows/android-preview-apk.yml` is committed on this branch, but is not present on the repository default branch. GitHub `workflow_dispatch` normally requires the workflow file on the default branch; therefore do **not** assume this workflow is dispatchable before it is registered there.
- The APK build has **not** been started; there is no verified APK artifact or physical-device result.

## Activation constraints

1. Do **not** merge PR #1 or PR #2, deploy production, or change the default branch just to activate the preview build.
2. An authorized maintainer should confirm the repository secret `EXPO_TOKEN` exists and that it belongs to an Expo account authorized for EAS project `d459f525-122a-4265-b496-6b2bf0f2211c`. Never print the token or add it to Git.
3. On an authorized local checkout of the migration branch, run `npm ci --no-audit --no-fund`, `CI=1 npx expo install --check`, `npx expo-doctor`, `npx tsc --noEmit`, and `npm run build --prefix functions` before building.
4. To build directly without changing `main`, use the EAS CLI from that checked-out branch with authenticated Expo credentials: `eas build --platform android --profile preview --non-interactive --no-wait`. This queues a remote **internal APK** build, not a production release. Confirm the account/project and quota before queueing.
5. Record the EAS build URL, build ID, commit SHA, profile, status and artifact link in the PR. A successful queue response is **not** proof of a successful build.
6. After EAS reports success, install the APK on a test Android device and verify login/logout, token refresh, authenticated AI requests, offline queue/replay, premium restrictions, account deletion safety, and crash-free startup. Report actual results and failures separately.

## Important limitations

- The workflow's `workflow_dispatch` trigger on a feature branch cannot be assumed runnable from GitHub Actions while the workflow is absent from the default branch.
- GitHub Actions CI success validates compilation and dependency compatibility, not Android runtime behavior.
- Do not publish or merge until the Phase A security and functional blockers have been resolved and device tests pass.
