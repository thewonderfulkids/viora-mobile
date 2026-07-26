import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import {
  updateUserPhoto,
  uploadProfilePhoto,
} from "../../repositories";

function isNativeStorageUploadIssue(error: unknown) {
  const message = String((error as any)?.message || error || "").toLowerCase();
  return (
    message.includes("arraybuffer") ||
    message.includes("blob") ||
    message.includes("network request failed") ||
    message.includes("storage")
  );
}

export async function pickAndUploadProfilePhoto(
  uid: string
): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

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

  if (!image.base64) {
    throw new Error("Unable to prepare image for upload on this device.");
  }

  const dataUrl = `data:image/jpeg;base64,${image.base64}`;

  try {
    const url = await uploadProfilePhoto(uid, image.base64);
    await updateUserPhoto(uid, url);
    return url;
  } catch (error) {
    if (!isNativeStorageUploadIssue(error)) {
      throw error;
    }

    // Android beta fallback: keep a small compressed data URL in Firestore so
    // users can continue testing profile photos even if native Storage upload
    // hits the Firebase Web SDK Blob/ArrayBuffer issue on a device.
    await updateUserPhoto(uid, dataUrl);
    return dataUrl;
  }
}
