# Sprint 21.4 — AI Coach Stabilization

## Fixed
- New Chat no longer gets overwritten by latest history reload.
- New Chat opens a blank conversation state immediately.
- History is hidden automatically when starting a new chat on mobile/tablet.
- Voice AI remains integrated inside AI Coach composer.
- Removed broken white-on-white voice badge styling.
- Fixed mobile overflow and vertical text compression.
- Rebuilt AI Coach layout as a stable flex workspace with fixed composer and scrollable chat content.

## Modified Files
- `src/app/ai-coach.tsx`
- `src/hooks/useAICoach.ts`
