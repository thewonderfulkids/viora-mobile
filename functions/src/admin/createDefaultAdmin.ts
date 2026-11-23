import { HttpsError, onCall } from "firebase-functions/v2/https";

/**
 * Retired legacy bootstrap endpoint.
 *
 * The old implementation could reset an existing Firebase Auth password and
 * used a separate, non-transactional bootstrap lock. Keep the callable name
 * temporarily so deployed clients receive a safe, explicit failure rather
 * than attempting an unsafe administrator provisioning flow.
 *
 * First administrator provisioning must use the audited one-time setup flow.
 */
export const createDefaultAdmin = onCall(
  { region: "asia-south1", enforceAppCheck: false },
  async () => {
    throw new HttpsError(
      "failed-precondition",
      "Legacy default administrator provisioning is disabled. Use the secure one-time administrator setup process.",
    );
  },
);
