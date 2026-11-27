/** Parse only owner-scoped avatar references; never fetch arbitrary URLs. */
export function resolvePrivateAvatarPath(uid: string, value: string, bucket: string): string | null {
  if (!uid || uid.includes("/") || !bucket || !value) return null;
  let path = value;
  if (value.startsWith("https://")) {
    const prefix = "https://firebasestorage.googleapis.com/v0/b/" + bucket + "/o/";
    if (!value.startsWith(prefix)) return null;
    try {
      path = decodeURIComponent(value.slice(prefix.length).split("?")[0]);
    } catch {
      return null;
    }
  }
  const ownerPrefix = "profile-photos/" + uid + "/";
  return path.startsWith(ownerPrefix) && /^avatar-[0-9]+\.jpg$/.test(path.slice(ownerPrefix.length)) ? path : null;
}
