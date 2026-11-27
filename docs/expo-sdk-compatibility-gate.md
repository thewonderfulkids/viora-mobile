# Expo SDK compatibility gate — 2026-11-23

Source: GitHub Actions run 45072251474, Expo Doctor output (20/22 checks passed).

## Verified passing
- Mobile TypeScript (`npx tsc --noEmit`)
- Firebase Functions TypeScript (`npm run build --prefix functions`)

## Expo Doctor blockers
1. **Hermes V1 memory regression:** Expo 56.0.17 / React Native 0.85.3 uses Hermes V1 250829098.0.10. Doctor identifies versions through 250829098.0.15 as affected. It recommends Expo SDK 57 with expo >=57.0.9 and React Native >=0.86.2.
2. **12 Expo dependency patch mismatches:** @expo/ui 56.0.23 → ~56.0.26; expo 56.0.17 → ~56.0.24; expo-constants 56.0.22 → ~56.0.27; expo-image 56.0.11 → ~56.0.13; expo-image-manipulator 56.0.23 → ~56.0.26; expo-image-picker 56.0.22 → ~56.0.25; expo-linking 56.0.16 → ~56.0.19; expo-notifications 56.0.22 → ~56.0.26; expo-router 56.2.16 → ~56.2.22; expo-sharing 56.0.23 → ~56.0.27; expo-splash-screen 56.0.14 → ~56.0.16; expo-symbols 56.0.6 → ~56.0.7.

## Required remediation
- Upgrade Expo SDK as a dedicated dependency migration, not a manifest-only edit. Use `npx expo install expo@^57.0.9 --fix` on a clean branch, regenerate and commit the matching package-lock.json, and inspect native/library compatibility and app behavior.
- Run `npm ci`, `npx tsc --noEmit`, `npx expo-doctor`, and `npm run build --prefix functions`; then validate an Android development build on a device.
- Keep Expo Doctor as a strict, failing CI job until fixed. Do not hide the failure using exclusions or `continue-on-error`.
- No APK or production deployment until migration and device testing are complete.

The Phase A validation workflow now reports mobile TypeScript, Firebase Functions TypeScript, and Expo Doctor as separate jobs.
