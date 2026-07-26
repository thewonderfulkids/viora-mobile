# Viora PDF Premium Format Patch

## Changed
- `src/services/reports/reportService.ts`

## What improved
- Replaced plain report HTML with a professional A4 PDF template.
- Added Viora branded hero section.
- Added wellness score ring.
- Added report dates and generated date cards.
- Added AI summary card.
- Added Highlights and Risk Flags sections.
- Added per-section metric cards.
- Added trend progress bars.
- Added footer disclaimer.
- Added HTML escaping for safer PDF rendering.

## Test steps
1. Run `npx tsc --noEmit`.
2. Run `npx expo-doctor`.
3. Run `npx expo export --platform web`.
4. Open app on APK.
5. Go to Reports.
6. Tap Export PDF.
7. Open/share the generated PDF.
8. Verify the PDF looks branded, structured, and readable.
