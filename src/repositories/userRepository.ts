import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { UserDoc, WellnessGoal } from "../firebase/firestoreTypes";

export type UpdateUserProfileInput = {
  uid: string;
  fullName: string;
  mobile?: string;
  goal?: WellnessGoal;
  stressLevel?: UserDoc["stressLevel"];
  age?: number;
  gender?: UserDoc["gender"];
};

export async function getUserProfile(uid: string): Promise<UserDoc | null> {
  const userRef = doc(db, COLLECTIONS.users, uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) return null;

  return snapshot.data() as UserDoc;
}

export async function updateUserProfile(input: UpdateUserProfileInput) {
  const userRef = doc(db, COLLECTIONS.users, input.uid);

  await setDoc(
    userRef,
    {
      uid: input.uid,
      fullName: input.fullName,
      mobile: input.mobile ?? "",
      goal: input.goal ?? "Healthy Lifestyle",
      stressLevel: input.stressLevel ?? "Moderate",
      ...(typeof input.age === "number" ? { age: input.age } : {}),
      ...(input.gender ? { gender: input.gender } : {}),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}
