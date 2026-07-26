# Viora Final Beta APK Patch

## Apply order
1. Copy this patch over the project root.
2. Run `npx tsc --noEmit`.
3. Run `npx expo-doctor`.
4. Run `npx expo export --platform web`.
5. Run `firebase deploy --only firestore` because Firestore rules are included.
6. Generate the next Android APK beta build.

## Included fixes
- Removed visible Sprint/release labels from user-facing screens, reports, premium, launch checklist, settings and notifications copy.
- Removed tab badge `Soon` from bottom tabs.
- Added logged-out guard for tab layout; logged-out users redirect to `/login`.
- Fixed logout redirect to Login.
- Improved Login form placeholder visibility and added password eye toggle.
- Improved Signup flow:
  - password eye toggle
  - mobile number
  - gender selection
  - age
  - T&C consent checkbox
  - visible loader/disabled state while creating account
  - signup redirects directly to Home after account creation for beta
- Added reusable `PrimaryButton` loading support.
- Fixed onboarding missing Firestore user doc crash by using merge-safe `setDoc`.
- Improved profile form placeholder visibility and bottom padding so content does not hide behind navigation.
- Fixed Android profile photo upload path by using base64 Storage upload instead of ArrayBuffer/Blob upload.
- Enabled Android notification sound on a new notification channel `viora-reminders-v2` so old silent channel cache does not block sound.
- Added temporary beta plan bypass:
  - paid plan click activates selected plan with `manual` provider
  - Firestore rules allow signed-in users to create/update their own manual beta payment/subscription records
  - Admin access manual grant rules preserved
- Preserved Sprint 25/26/admin support files already generated earlier.

## Notes
- Mobile duplicate validation cannot be fully guaranteed client-side without a backend/cloud function because Firestore rules should not expose all user mobile numbers publicly. Email duplicate validation is handled by Firebase Auth.
- After installing the new APK, Android may keep old notification channels. This patch uses a new channel ID to force sound-enabled channel creation.

## APK checklist
- Fresh signup with mobile/gender/age/terms.
- Signup button shows loader and does not double-submit.
- Login placeholder text is visible.
- Password eye works on login and signup.
- Logout redirects to login.
- Profile image upload works on Android.
- Premium plan card activates beta access without Razorpay.
- Notifications show with sound.
- No visible Sprint labels anywhere in the app UI.
- Bottom tab has no red Soon badge.
