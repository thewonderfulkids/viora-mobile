import { getDownloadURL, ref, uploadString } from "firebase/storage";

import { storage } from "../firebase/firebaseConfig";

let lastAvatarVersion = 0;

function buildAvatarPath(uid: string) {
  // Avoid overwriting an earlier upload when two requests share a clock tick.
  const version = Math.max(Date.now() * 1000 + Math.floor(Math.random() * 1000), lastAvatarVersion + 1);
  lastAvatarVersion = version;
  // Independent devices can share the same clock and three-digit suffix.
  // Add independent random digits without converting the identifier to a number.
  const entropy = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 1000000000).toString().padStart(9, "0"),
  ).join("");
  return `profile-photos/${uid}/avatar-${version}${entropy}.jpg`;
}

export async function uploadProfilePhoto(
  uid: string,
  base64Image: string,
  assertCurrent: () => void = () => {},
): Promise<string> {
  assertCurrent();
  if (!base64Image) {
    throw new Error("Selected image could not be prepared for upload.");
  }

  const storageRef = ref(storage, buildAvatarPath(uid));
  const dataUrl = base64Image.startsWith("data:")
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;

  await uploadString(storageRef, dataUrl, "data_url", {
    contentType: "image/jpeg",
    customMetadata: {
      uid,
      source: "viora-mobile-profile-avatar",
      uploadedAt: new Date().toISOString(),
    },
  });

  assertCurrent();
  return getDownloadURL(storageRef);
}

/** Read-only candidate check for a future trusted cleanup worker.
 * Never delete based solely on a client-supplied download URL.
 */
export function isOwnedVersionedAvatarPath(uid: string, path: string): boolean {
  if (!uid || uid.includes("/")) return false;
  const prefix = `profile-photos/${uid}/`;
  return path.startsWith(prefix) && /^avatar-[0-9]+\.jpg$/.test(path.slice(prefix.length));
}
