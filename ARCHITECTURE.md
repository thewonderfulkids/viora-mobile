# Viora Architecture Guide

This document freezes the architecture rules used for Viora V1 development from Sprint 15.1 onward.

## Core Rules

- Keep the existing Expo Router + React Native + Firebase architecture.
- Do not rename folders or move stable files unless there is a build-breaking reason.
- Repository Pattern is mandatory for Firestore/storage access.
- Service Layer is mandatory for business logic.
- Hooks remain separate from services and repositories.
- UI must remain component-based and reusable.
- Avoid large route files by extracting reusable cards, lists, sections, and state components.

## Folder Responsibilities

```text
src/app/              Expo Router screens only
src/components/       Reusable UI components
src/hooks/            React hooks and screen state orchestration
src/repositories/     Firebase data access only
src/services/         Business logic and intelligence engines
src/types/            Shared TypeScript contracts
src/firebase/         Firebase config, helpers, collection constants
src/theme/            Design tokens only
```

## Barrel Export Rules

Every reusable folder must maintain an `index.ts` barrel.

Required barrels:

- `src/components/index.ts`
- `src/components/<module>/index.ts`
- `src/hooks/index.ts`
- `src/repositories/index.ts`
- `src/services/index.ts`
- `src/services/<module>/index.ts`
- `src/types/index.ts`

When a new reusable file is added, update the nearest folder barrel in the same sprint.

## Import Rules

Prefer barrel imports for reusable modules:

```ts
import { Screen, SectionHeader } from "../components/common";
import { useDashboard } from "../hooks";
import { WellnessIntelligenceDashboard } from "../types";
```

Avoid deep imports such as:

```ts
import { useDashboard } from "../hooks/useDashboard";
import { WellnessIntelligenceDashboard } from "../types/wellnessIntelligence";
```

Deep imports are allowed only when a technical cycle would be created by barrel import, or when importing route-local files.

## Theme Rules

Use only existing theme tokens unless a sprint explicitly updates the theme.

Current color tokens:

```ts
colors.primary
colors.primaryDark
colors.mint
colors.teal
colors.background
colors.white
colors.text
colors.mutedText
colors.border
colors.softGreen
colors.warning
colors.danger
```

Do not assume tokens like `colors.card` or `colors.surface`.

## Firestore Rules

Whenever a sprint adds a new collection, update:

- `src/firebase/firestoreCollections.ts`
- Firestore security rules
- Repository access logic

Each document must remain user-owned with either `uid` or `userId` unless explicitly designed otherwise.

## Validation Before Commit

Every sprint or cleanup must pass:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```

Commit only after all three commands pass.
