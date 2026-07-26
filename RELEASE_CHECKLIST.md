# Viora v1.0.0 Release Checklist

## Automated checks
- [ ] `npm install`
- [ ] `npx tsc --noEmit`
- [ ] `npx expo-doctor` reports 21/21
- [ ] `npx expo export --platform web`
- [ ] `powershell -ExecutionPolicy Bypass -File .\scripts\release-preflight.ps1`

## Android device checks
- [ ] Green Viora launcher icon is correct
- [ ] Adaptive icon is not cropped
- [ ] Splash and cinematic launch work
- [ ] Login, signup and onboarding work
- [ ] Universal bottom navigation appears on authenticated screens
- [ ] Bottom navigation does not overlap Android system navigation
- [ ] AI composer remains above keyboard and bottom navigation
- [ ] Native voice requests microphone permission
- [ ] Hindi/Hinglish speech recognition works
- [ ] Hydration reminder notification arrives
- [ ] Notification sound and vibration work
- [ ] Tapping notification opens the correct screen
- [ ] Profile image upload works
- [ ] Logout and login persistence work
- [ ] Admin access is hidden from normal users
- [ ] Offline banner and error boundary work

## Play Store preparation
- [ ] Privacy Policy URL ready
- [ ] Support email active
- [ ] Data Safety form completed accurately
- [ ] App screenshots prepared
- [ ] Feature graphic prepared
- [ ] Short and full descriptions reviewed
- [ ] Content rating completed
- [ ] Internal testing track used before production
- [ ] Production AAB uploaded only after preview APK approval
