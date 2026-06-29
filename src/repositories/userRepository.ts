import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { UserDoc, WellnessGoal } from "../firebase/firestoreTypes";

export type UpdateUserProfileInput = {
  uid: string;
  fullName: string;
  mobile?: string;
  goal?: WellnessGoal;
  stressLevel?: UserDoc["stressLevel"];
};

export async function updateUserProfile(input: UpdateUserProfileInput) {
  const userRef = doc(db, COLLECTIONS.users, input.uid);

  await updateDoc(userRef, {
    fullName: input.fullName,
    mobile: input.mobile ?? "",
    goal: input.goal ?? "Healthy Lifestyle",
    stressLevel: input.stressLevel ?? "Moderate",
    updatedAt: new Date().toISOString(),
  });
}