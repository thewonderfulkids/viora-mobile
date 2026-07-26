import { getDownloadURL, ref, uploadString } from "firebase/storage";

import { storage } from "../firebase/firebaseConfig";

function buildAvatarPath(uid: string) {
  const version = Date.now();
  return `profile-photos/${uid}/avatar-${version}.jpg`;
}

export async function uploadProfilePhoto(
  uid: string,
  base64Image: string
): Promise<string> {
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

  return getDownloadURL(storageRef);
}
