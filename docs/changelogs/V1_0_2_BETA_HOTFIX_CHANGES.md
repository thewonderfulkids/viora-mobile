# Viora V1.0.2 Beta Hotfix Patch

## Fixed

### Critical APK blockers
- Restored 5-step onboarding after signup.
- Signup now creates user with `onboardingCompleted: false` and navigates to `/onboarding`.
- Tabs guard now redirects logged-in users without completed onboarding back to `/onboarding`.
- Bottom tab bar now respects native safe-area bottom inset to avoid Android navigation overlap.
- Profile photo upload now uses compressed base64 data URL upload and includes Android-safe Firestore fallback if Firebase Storage hits native Blob/ArrayBuffer issues.
- Profile avatar border radius corrected and debug logging removed.

### Home Workout
- Rebuilt `/home-workout` as a video-ready content module.
- Added Featured Today, filters, thumbnails, media-ready cards, equipment, benefits, routine preview, premium badge and admin video link CTA.
- Supports Admin-managed YouTube/Firebase/external URLs without APK update.

### Meditation
- Rebuilt `/meditation` with same video/audio-ready content pattern as Home Workout.
- Added Featured Today, filters, thumbnails, benefits, session flow and admin audio/video link CTA.

### Admin Content Studio
- Added optional content fields for media type, calories, equipment, instructor, benefits and steps.
- Admin content records now save/read these fields from Firestore.
- Program content fallback now includes enriched Home Workout and Meditation data.

## Modified files
- src/services/authService.ts
- src/app/signup.tsx
- src/app/onboarding.tsx
- src/app/(tabs)/_layout.tsx
- src/repositories/profilePhotoRepository.ts
- src/services/user/profilePhotoService.ts
- src/components/profile/ProfileAvatar.tsx
- src/types/adminControl.ts
- src/hooks/useAdminControl.ts
- src/repositories/adminControlRepository.ts
- src/hooks/useProgramContent.ts
- src/services/programs/programContentService.ts
- src/app/admin.tsx
- src/app/home-workout.tsx
- src/app/meditation.tsx

## Test steps
1. Create a fresh account.
2. Confirm signup does not go directly to Home.
3. Complete all 5 onboarding steps.
4. Confirm Home opens only after onboarding completion.
5. Open every bottom tab on Android and confirm tab bar is above system navigation.
6. Upload profile photo from gallery on Android APK.
7. Open Home Workout and test filters/cards.
8. Open Meditation and test filters/cards.
9. Login as admin and add Home Workout/Meditation content link.
10. Refresh Home Workout/Meditation and confirm content is visible without APK rebuild.

## Commands
```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```

No Firestore rules/index changes in this patch.
