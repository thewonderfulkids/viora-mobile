# Viora PDF Export Fix

## Fixed
- Export PDF now creates a real device PDF using `expo-print`.
- Android opens the native share/save sheet using `expo-sharing`.
- Web falls back to a downloadable HTML snapshot so export remains usable during web testing.
- Export history now has an Open button to regenerate/share saved report snapshots.
- Export button text changed from passive `Export PDF` to clear `Download PDF`.

## Added
- `src/services/reports/reportPdfService.ts`

## Modified
- `src/services/reports/index.ts`
- `src/hooks/useReports.ts`
- `src/components/reports/ReportExportCard.tsx`
- `src/components/reports/ReportExportHistory.tsx`
- `src/app/reports.tsx`

## Required dependency install
Run before TypeScript/build:

```bash
npx expo install expo-print expo-sharing
```

Then:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform web
```
