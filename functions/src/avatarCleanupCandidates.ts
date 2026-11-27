// H06: fail-closed candidate selection. No deletion is performed here.
export const AVATAR_GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export interface AvatarCandidate {
  name: string;
  generation?: string;
  timeCreated?: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}

export function selectOrphanAvatars(
  uid: string, bucket: string, profile: Record<string, unknown>,
  files: AvatarCandidate[], now: number,
): AvatarCandidate[] {
  if (!uid || uid.includes("/") || !bucket || !Number.isFinite(now)) return [];
  const prefix = "profile-photos/" + uid + "/";
  const active = new Set<string>();
  for (const field of ["photoURL", "photoUrl", "avatarUrl"]) {
    const value = profile[field];
    if (value == null || value === "") continue;
    if (typeof value !== "string") return [];
    if (value.startsWith("data:image/")) continue;
    if (value.startsWith(prefix)) { active.add(value); continue; }
    try {
      const url = new URL(value);
      const base = "/v0/b/" + bucket + "/o/";
      if (url.origin !== "https://firebasestorage.googleapis.com" || !url.pathname.startsWith(base)) return [];
      const key = decodeURIComponent(url.pathname.slice(base.length));
      if (!key.startsWith(prefix)) return [];
      active.add(key);
    } catch { return []; }
  }
  return files.filter(file => {
    const created = Date.parse(file.timeCreated ?? "");
    return file.name.startsWith(prefix)
      && /^avatar-[0-9]+\.jpg$/.test(file.name.slice(prefix.length))
      && typeof file.generation === "string" && /^[1-9][0-9]*$/.test(file.generation)
      && Number.isSafeInteger(Number(file.generation))
      && file.contentType === "image/jpeg"
      && file.metadata?.uid === uid
      && file.metadata?.source === "viora-mobile-profile-avatar"
      && Number.isFinite(created) && now - created >= AVATAR_GRACE_MS
      && !active.has(file.name);
  });
}
