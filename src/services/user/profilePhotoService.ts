import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";

import {
    updateUserPhoto,
    uploadProfilePhoto,
} from "../../repositories";

export async function pickAndUploadProfilePhoto(
  uid: string
): Promise<string | null> {
  console.log("PHOTO_UPLOAD_START", { uid });

  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  console.log("PHOTO_PERMISSION", permission);

  if (!permission.granted) {
    throw new Error("Gallery permission denied.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });

  console.log("PHOTO_PICKER_RESULT", {
    canceled: result.canceled,
    assets: result.canceled ? 0 : result.assets.length,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];

  console.log("PHOTO_ASSET_URI", asset.uri);

  const image = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: 600 } }],
    {
      compress: 0.75,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  console.log("PHOTO_MANIPULATED_URI", image.uri);

  const response = await fetch(image.uri);
  const blob = await response.blob();

  console.log("PHOTO_BLOB_SIZE", blob.size);

  const url = await uploadProfilePhoto(uid, blob);

  console.log("PHOTO_STORAGE_URL", url);

  await updateUserPhoto(uid, url);

  console.log("PHOTO_FIRESTORE_UPDATED", { uid, url });

  return url;
}