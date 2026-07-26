# Viora V1.0.1 Beta Launch Edition

## Added

- `src/app/admin.tsx`
  - Full admin control panel route `/admin`.
  - Admin-only access for `support@winflyindia.in` and `drdigiweb@gmail.com`.
  - Dashboard stats for users, subscriptions, feedback, error logs and active content.
  - User search by email/mobile.
  - User enable/disable toggle.
  - Manual subscription plan control: Free, Plus Monthly, Plus Yearly, Pro, Elite Family.
  - App config / feature flag controls:
    - Beta mode
    - Premium bypass
    - First-run app tour flag
    - Music module flag
    - Video programs flag
    - Maintenance mode
  - Content Studio for adding/editing/deactivating:
    - Video links
    - Music links
    - Programs
    - Tips
    - Announcements

- `src/app/programs.tsx`
  - Programs Hub route `/programs`.
  - Shows Yoga, Home Workout, Weight Loss, Music and guided content.
  - Reads admin-managed Firestore content with production-safe fallback content.

- `src/app/home-workout.tsx`
  - Home Workout route `/home-workout`.
  - Beginner home workout section with dynamic admin-managed videos/program links.
  - Includes a safe default no-equipment 15-minute beta routine.

- `src/types/adminControl.ts`
  - Shared admin panel/content/app config types.

- `src/repositories/adminControlRepository.ts`
  - Firestore repository for admin stats, app config, managed content and admin user search/status.

- `src/services/adminControl/*`
  - Admin control service layer.

- `src/services/programs/*`
  - Program content service layer with fallback content.

- `src/hooks/useAdminControl.ts`
  - Admin panel state, search, plan grant, config save and content control hook.

- `src/hooks/useProgramContent.ts`
  - Program/home-workout content loading hook.

## Modified

- `src/app/settings-center.tsx`
  - Added Programs Hub entry.
  - Replaced old Admin Access card with full Admin Control Panel card.

- `src/app/(tabs)/wellness.tsx`
  - Added Programs Hub card.
  - Added Home Workout card.
  - Updated Meditation card to point to Programs Hub instead of dead coming-soon state.
  - Replaced visible incomplete module wording with beta/planned wording.

- `src/firebase/firestoreCollections.ts`
  - Added `adminContent` collection key.

- `src/hooks/index.ts`
  - Exported new hooks.

- `src/repositories/index.ts`
  - Exported new repository.

- `src/services/index.ts`
  - Exported new services.

- `src/types/index.ts`
  - Exported new admin control types.

- `src/services/musicService.ts`
  - Music catalog can now load admin-managed music tracks.
  - Existing fallback catalog preserved.

- `src/hooks/useMusic.ts`
  - Loads admin-managed music catalog from Firestore.

- `firestore.rules`
  - Added admin write access for `appSettings`.
  - Added public read + admin write access for `adminContent`.
  - Admin can read beta feedback and client error logs.
  - Admin can update user status fields for beta management.

## Firestore Collections Added

- `adminContent`
- Existing `appSettings` now supports admin write for global app config.

## Firebase Indexes

No new composite indexes required.

## Test Steps

Run:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
firebase deploy --only firestore
```

APK QA:

1. Login as normal user.
2. Confirm `/admin` is blocked.
3. Login as `support@winflyindia.in` or `drdigiweb@gmail.com`.
4. Open Settings Center → Admin Control Panel.
5. Search a beta user by email.
6. Apply Elite Family plan.
7. Reopen user app and confirm Premium reflects Elite Family.
8. Add Home Workout YouTube link in Content Studio.
9. Open `/programs` and `/home-workout`.
10. Confirm new content appears without APK update.
11. Add music item in Content Studio.
12. Open Music Therapy and confirm catalog loads admin-managed music when active.
13. Disable content and pull refresh.
14. Confirm disabled content is hidden from user program pages.

## Notes

- Mobile OTP remains on hold.
- Full localization and dark/light theme engine should be V1.1, not this beta patch.
- Razorpay integration can later turn off `premiumBypassEnabled` and replace manual plan activation with checkout.
