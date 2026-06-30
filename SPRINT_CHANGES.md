# Sprint 22.1 — Family Invite Flow Completion

## Fixed
- Family invite fields are now editable when setup slots are available.
- Family setup supports up to 4 members in V1 so the invite flow can be tested before Elite subscription enforcement.
- Elite Family still controls premium shared AI/family intelligence messaging.
- Added email/mobile normalization.
- Added relationship selector and shared permission selector.
- Create Invite now creates a pending family member in Firestore.
- Updated family type to allow invite-specific permissions.

## Validation
Run:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```
