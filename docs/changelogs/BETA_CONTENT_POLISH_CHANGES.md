# Viora Beta Content Polish Patch

## Added
- `src/app/meditation.tsx`
  - Dedicated Meditation page.
  - Guided breathing, sleep, focus and gratitude routines.
  - Music Therapy CTA.

## Updated
- `src/app/home-workout.tsx`
  - Polished Home Workout page.
  - Beginner, Intermediate, Advanced, No Equipment and Home Items routines.
  - Exercise-level instructions, reps, duration and calories.
  - Guided video section when Admin Panel links are present.

- `src/app/(tabs)/wellness.tsx`
  - Meditation now opens `/meditation` directly.
  - Music Therapy and Meditation marked Available instead of Beta.

- `src/services/programs/programContentService.ts`
  - Added fallback Home Workout content for beginner/intermediate/advanced.
  - Added Meditation and Sleep fallback content for Programs Hub.

- `src/components/profile/ProfileEditCard.tsx`
  - Added gender and age props support to fix TypeScript error from profile screen.

## Test Steps
1. `npx tsc --noEmit`
2. `npx expo-doctor`
3. `npx expo export --platform web`
4. Open Wellness > Meditation.
5. Open Wellness > Home Workout.
6. Verify all Home Workout levels show exercises.
7. Verify Programs Hub shows Home Workout, Yoga, Weight Loss and Meditation fallback content.

## Notes
- No Firestore rules/index changes.
- No payment/auth changes.
