# H01 — Background step tracking

Current Expo Pedometer watcher is foreground-only. Do not keep the JavaScript watcher running in background or claim it measures background activity.

## Android implementation candidate
Use a compatible native Health Connect step aggregate reader, subject to SDK 57 compatibility and permission review. Read only steps with explicit consent. Treat device-wide historical totals as unowned: never import them into a newly signed-in account automatically. Establish an account/session-specific opt-in baseline; exclude signed-out intervals and reject stale reads after account changes. Avoid summing overlapping sources or adding aggregate totals to foreground deltas for the same interval. Preserve existing foreground fallback on unsupported devices. Do not request background health permissions until needed and supported.

## Acceptance gates
- Verify native dependency and Expo config plugin compatibility before modifying the lockfile.
- Test foreground/background/resume, midnight, permission denial/revocation, process restart, account switch and same-UID relogin.
- Test duplicate sources and overlapping foreground/native intervals; no double counting.
- Test on a physical Android device with a fresh APK. Distinguish delayed Health Connect synchronization from real-time tracking.
- No production deployment or historical health-data import without consent.

H01 remains open until native integration and device tests pass.
