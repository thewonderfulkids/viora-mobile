# Viora Admin Access Patch

## Purpose
Adds a small admin-only access control screen so approved Viora admin accounts can grant/update a registered user's premium plan without manually typing subscription documents in Firestore.

## Approved admin emails
- support@winflyindia.in
- drdigiweb@gmail.com

## Added files
- src/app/admin-access.tsx
- src/components/adminAccess/AdminAccessPanel.tsx
- src/components/adminAccess/index.ts
- src/hooks/useAdminAccess.ts
- src/repositories/adminAccessRepository.ts
- src/services/adminAccess/adminAccessConfig.ts
- src/services/adminAccess/adminAccessService.ts
- src/services/adminAccess/index.ts
- src/types/adminAccess.ts

## Modified files
- src/app/settings-center.tsx
- src/components/index.ts
- src/hooks/index.ts
- src/repositories/index.ts
- src/services/index.ts
- src/types/index.ts
- firestore.rules

## Firestore impact
- Allows approved Viora admin emails to read users by email.
- Allows approved Viora admin emails to create/update manual subscription grants only when:
  - source == "admin_access_grant"
  - provider == "manual"
- Normal users can still only read their own subscription docs.
- No firestore.indexes.json change is required.

## Admin usage
1. Login in the app using support@winflyindia.in or drdigiweb@gmail.com.
2. Go to Settings Center.
3. Open Admin Access Control.
4. Enter the target user's registered email.
5. Search user.
6. Choose plan, usually Viora Elite Family.
7. Tap Grant / Update Access.
8. Ask the target user to reopen the app or pull-refresh Premium.

## Test commands
- npx tsc --noEmit
- npx expo-doctor
- npx expo export --platform web
- firebase deploy --only firestore
