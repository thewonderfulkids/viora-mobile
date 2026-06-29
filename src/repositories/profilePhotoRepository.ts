import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { storage } from "../firebase/firebaseConfig";

function buildAvatarPath(uid: string) {
  const version = Date.now();
  return `profile-photos/${uid}/avatar-${version}.jpg`;
}

export async function uploadProfilePhoto(
  uid: string,
  blob: Blob
): Promise<string> {
  console.log("PHOTO_STORAGE_UPLOAD_START", {
    uid,
    size: blob.size,
    type: blob.type,
  });

  const storageRef = ref(storage, buildAvatarPath(uid));

  await uploadBytes(storageRef, blob, {
    contentType: "image/jpeg",
  });

  const url = await getDownloadURL(storageRef);

  console.log("PHOTO_STORAGE_UPLOAD_DONE", url);

  return url;
}