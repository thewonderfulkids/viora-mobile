import { onCall, HttpsError } from "firebase-functions/v2/https";
import { publishManagedAvatar } from "./managedAvatarWriter";

export const publishProfileAvatar = onCall({ region: "asia-south1", enforceAppCheck: process.env.VIORA_ENFORCE_APP_CHECK === "true" }, async request => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const data = request.data;
  if (!data || typeof data.path !== "string" || data.path.length > 512 ||
      !(data.expectedPhoto === null || (typeof data.expectedPhoto === "string" && data.expectedPhoto.length <= 750000))) {
    throw new HttpsError("invalid-argument", "Invalid avatar request");
  }
  try {
    const photoURL = await publishManagedAvatar(request.auth.uid, data.path, data.expectedPhoto);
    return { photoURL };
  } catch {
    throw new HttpsError("failed-precondition", "Avatar publication unavailable. Refresh and retry.");
  }
});
