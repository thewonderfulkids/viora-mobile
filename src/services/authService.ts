import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function register({
  fullName,
  email,
  password,
}: RegisterPayload): Promise<UserCredential> {
  const cleanName = fullName.trim();
  const cleanEmail = normalizeEmail(email);

  const credential = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  const uid = credential.user.uid;
  const userRef = doc(db, COLLECTIONS.users, uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid,
      fullName: cleanName,
      email: cleanEmail,

      onboardingCompleted: false,

      waterGoalMl: 2500,

      language: "en",
      country: "IN",
      timezone: "Asia/Kolkata",

      plan: "Free",
      subscriptionStatus: "Trial",

      isDeleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return credential;
}

export async function login(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, normalizeEmail(email), password);
}

export async function logout() {
  return signOut(auth);
}