import {
    createActivity,
    getRecentActivities,
} from "../../repositories";
import {
    CreateActivityInput,
    WellnessActivity,
} from "../../types";

export async function logWellnessActivity(
  input: CreateActivityInput
): Promise<WellnessActivity> {
  return createActivity(input);
}

export async function getLatestWellnessActivities({
  userId,
  maxResults = 50,
}: {
  userId: string;
  maxResults?: number;
}): Promise<WellnessActivity[]> {
  return getRecentActivities({ userId, maxResults });
}