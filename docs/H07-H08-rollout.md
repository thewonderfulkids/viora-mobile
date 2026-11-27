# H07/H08 rollout
HTTP validation rejects oversized raw bodies and malformed consumed fields before quota or model calls. Legacy dashboard extras remain accepted within the raw-body limit.
App Check verifies supplied tokens even before mandatory enforcement. Configure Viora app registration and a supported native attestation provider before enabling mandatory checks. VIORA_APP_CHECK_ALLOWED_APP_IDS optionally restricts verified app IDs. Keep VIORA_ENFORCE_APP_CHECK unset until the release candidate sends valid tokens on real devices. Native provider and client header integration remain required; do not use a debug token in production.

Web clients can opt in using EXPO_PUBLIC_APP_CHECK_SITE_KEY (public reCAPTCHA v3 site key registered for the Firebase web app). Static export skips initialization outside the browser. Native attestation is not supplied by this web integration; mandatory enforcement remains disabled until all supported clients are ready.
