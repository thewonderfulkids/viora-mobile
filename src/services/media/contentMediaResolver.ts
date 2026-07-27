import { AdminManagedContent } from "../../types";

export function slugifyMediaTarget(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findFullSessionMedia(
  content: AdminManagedContent[],
  targetId: string,
) {
  return content.find(
    (item) =>
      item.isActive &&
      item.targetId === targetId &&
      item.mediaRole === "full_session_video" &&
      Boolean(item.url),
  );
}

export function findExactStepMedia(
  content: AdminManagedContent[],
  parentTargetId: string,
  stepId: string,
) {
  return content.find(
    (item) =>
      item.isActive &&
      item.parentTargetId === parentTargetId &&
      item.targetId === stepId &&
      item.mediaRole === "exercise_video" &&
      Boolean(item.url),
  );
}

export function findExactAudioTrack(
  content: AdminManagedContent[],
  targetId: string,
) {
  return content.find(
    (item) =>
      item.isActive &&
      item.targetId === targetId &&
      (item.mediaRole === "audio_track" ||
        item.mediaRole === "background_music") &&
      Boolean(item.url),
  );
}
