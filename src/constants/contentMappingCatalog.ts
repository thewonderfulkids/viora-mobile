import { AdminContentCategory, AdminMediaRole, AdminMappingTargetType } from "../types";

export type MappingTargetOption = {
  id: string;
  label: string;
  category: AdminContentCategory;
  targetType: AdminMappingTargetType;
  parentId?: string;
};

export const CONTENT_MAPPING_TARGETS: MappingTargetOption[] = [
  { id: "beginner-full-body", label: "Beginner Full Body", category: "home_workout", targetType: "program" },
  { id: "warm-up-march", label: "Warm-up March", category: "home_workout", targetType: "exercise", parentId: "beginner-full-body" },
  { id: "chair-squats", label: "Chair Squats", category: "home_workout", targetType: "exercise", parentId: "beginner-full-body" },
  { id: "wall-push-ups", label: "Wall Push-ups", category: "home_workout", targetType: "exercise", parentId: "beginner-full-body" },
  { id: "glute-bridge", label: "Glute Bridge", category: "home_workout", targetType: "exercise", parentId: "beginner-full-body" },
  { id: "cool-down-stretch", label: "Cool-down Stretch", category: "home_workout", targetType: "exercise", parentId: "beginner-full-body" },

  { id: "morning-yoga-10", label: "Morning Yoga Flow", category: "yoga", targetType: "session" },
  { id: "neck-rolls", label: "Neck Rolls", category: "yoga", targetType: "pose", parentId: "morning-yoga-10" },
  { id: "shoulder-openers", label: "Shoulder Openers", category: "yoga", targetType: "pose", parentId: "morning-yoga-10" },
  { id: "cat-cow-stretch", label: "Cat-Cow Stretch", category: "yoga", targetType: "pose", parentId: "morning-yoga-10" },
  { id: "forward-fold", label: "Forward Fold", category: "yoga", targetType: "pose", parentId: "morning-yoga-10" },
  { id: "deep-breathing", label: "Deep Breathing", category: "yoga", targetType: "pose", parentId: "morning-yoga-10" },

  { id: "desk-stretch-5", label: "Desk Stretch Reset", category: "yoga", targetType: "session" },
  { id: "stress-breathing-7", label: "Stress Relief Breathing", category: "yoga", targetType: "session" },
  { id: "energy-workout-15", label: "Energy Bodyweight Workout", category: "yoga", targetType: "session" },

  { id: "relax-10", label: "Deep Relaxation", category: "music", targetType: "track" },
  { id: "sleep-20", label: "Sleep Therapy", category: "music", targetType: "track" },
  { id: "focus-15", label: "Focus Booster", category: "music", targetType: "track" },
  { id: "nature-10", label: "Nature Escape", category: "music", targetType: "track" },

  { id: "stress-relief-breathing", label: "Stress Relief Breathing", category: "meditation", targetType: "session" },
  { id: "deep-calm", label: "Deep Calm Meditation", category: "meditation", targetType: "session" },
  { id: "sleep-wind-down", label: "Sleep Wind-down", category: "sleep", targetType: "session" },
];

export const MEDIA_ROLES: Array<{ id: AdminMediaRole; label: string }> = [
  { id: "full_session_video", label: "Full Session Video" },
  { id: "exercise_video", label: "Exercise / Pose Video" },
  { id: "audio_track", label: "Audio Track" },
  { id: "background_music", label: "Background Music" },
  { id: "preview_clip", label: "Preview Clip" },
];

export function targetsForCategory(category: AdminContentCategory) {
  return CONTENT_MAPPING_TARGETS.filter((item) => item.category === category);
}

export function parentTargetsForCategory(category: AdminContentCategory) {
  return targetsForCategory(category).filter((item) => !item.parentId);
}

export function childTargets(category: AdminContentCategory, parentId: string) {
  return targetsForCategory(category).filter((item) => item.parentId === parentId);
}
