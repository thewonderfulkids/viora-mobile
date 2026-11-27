import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../firebase/firebaseConfig";

import {
  updateUserPhoto,
  uploadProfilePhoto,
} from "../../repositories";

function isNativeStorageUploadIssue(error: unknown) {
  const issue = error as { code?: string; message?: string } | undefined;
  const code = typeof issue?.code === "string" ? issue.code.toLowerCase() : undefined;
  // An explicit auth or Storage policy rejection is not a native transport defect.
  if (code?.startsWith("storage/") && code !== "storage/unknown") return false;
  const message = String(issue?.message || error || "").toLowerCase();
  return (
    message.includes("arraybuffer") ||
    message.includes("blob") ||
    message.includes("network request failed") ||
    message.includes("atob") || code === "storage/unknown"
  );
}

const activeUploads = new Set<string>();

export async function pickAndUploadProfilePhoto(
  uid: string,
  owner = auth.currentUser,
): Promise<string | null> {
  const assertCurrent = () => {
    if (!owner || owner.uid !== uid || auth.currentUser !== owner) {
      throw new Error("Sign in again before changing your profile photo.");
    }
  };

  assertCurrent();
  if (activeUploads.has(uid)) throw new Error("A profile photo update is already in progress.");
  activeUploads.add(uid);
  try {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  assertCurrent();
  if (!permission.granted) {
    throw new Error("Gallery permission denied.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
    base64: false,
  });

  assertCurrent();
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];

  const image = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 420 } }],
    {
      compress: 0.64,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    }
  );

  assertCurrent();
  if (!image.base64) {
    throw new Error("Unable to prepare image for upload on this device.");
  }

  const dataUrl = `data:image/jpeg;base64,${image.base64}`;

  let url: string;
  try {
    url = await uploadProfilePhoto(uid, image.base64, assertCurrent);
  } catch (error) {
    assertCurrent();
    if (!isNativeStorageUploadIssue(error)) throw error;
    // Preserve the existing Android compatibility path only for Storage
    // transport errors. A failed profile write must not trigger another write.
    url = dataUrl;
  }

  assertCurrent();
  await updateUserPhoto(uid, url);
  assertCurrent();
  return url;
  } finally {
    activeUploads.delete(uid);
  }
}
