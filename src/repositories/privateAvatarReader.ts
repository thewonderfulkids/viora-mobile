import { getBytes, ref } from "firebase/storage";
import { auth, storage } from "../firebase/firebaseConfig";
import { resolvePrivateAvatarPath } from "./privateAvatarReference";

const MAX_BYTES = 5 * 1024 * 1024;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encodeBase64(bytes: Uint8Array): string {
  const chunks: string[] = [];
  let chunk = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1] ?? 0, c = bytes[i + 2] ?? 0;
    chunk += alphabet[a >> 2] + alphabet[((a & 3) << 4) | (b >> 4)] +
      (i + 1 < bytes.length ? alphabet[((b & 15) << 2) | (c >> 6)] : "=") +
      (i + 2 < bytes.length ? alphabet[c & 63] : "=");
    if (chunk.length >= 8192) { chunks.push(chunk); chunk = ""; }
  }
  chunks.push(chunk);
  return chunks.join("");
}

/** No public download URL fallback. Native transport must be device-tested. */
export async function readPrivateAvatar(value: string, owner = auth.currentUser): Promise<string> {
  const assertCurrent = () => {
    if (!owner || auth.currentUser !== owner) throw new Error("Avatar session changed.");
  };
  assertCurrent();
  if (!owner) throw new Error("Sign in required.");
  const path = resolvePrivateAvatarPath(owner.uid, value, ref(storage).bucket);
  if (!path) throw new Error("Invalid avatar reference.");
  const bytes = new Uint8Array(await getBytes(ref(storage, path), MAX_BYTES));
  assertCurrent();
  if (bytes.length < 3 || bytes.length > MAX_BYTES || bytes[0] !== 255 || bytes[1] !== 216 || bytes[2] !== 255) {
    throw new Error("Invalid avatar image.");
  }
  return "data:image/jpeg;base64," + encodeBase64(bytes);
}
