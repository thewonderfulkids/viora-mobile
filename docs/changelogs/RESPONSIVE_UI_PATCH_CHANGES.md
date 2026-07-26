# Viora Responsive UI Patch

## Changed files
- `src/components/nutrition/NutritionFoodLogger.tsx`

## Fixes
- Fixes Custom Food card horizontal overflow on Android/web.
- Prevents calories/protein/sugar inputs from going outside card.
- Makes custom macro fields wrap responsively instead of forcing one fixed row.
- Adds max-width/overflow guards to the nutrition logger card.
- Makes Add Custom Food button full-width and easier to tap.
- Keeps existing architecture and behavior unchanged.

## Test steps
1. Open Nutrition page.
2. Scroll to Custom Food.
3. Verify all fields stay inside the card on Android and web.
4. Select all unit chips and confirm no horizontal overflow.
5. Add a custom food item.
6. Run:
   - `npx tsc --noEmit`
   - `npx expo-doctor`
   - `npx expo export --platform web`
