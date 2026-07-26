import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { Gender } from "../firebase/firestoreTypes";

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  mobile: string;
  gender: Gender;
  age: number;
  acceptedTerms?: boolean;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeMobile(mobile: string) {
  return mobile.replace(/\D/g, "").slice(0, 10);
}

function readableAuthError(error: any) {
  const code = String(error?.code || "");

  if (code === "auth/email-already-in-use") {
    return "This email is already registered. Please login instead.";
  }

  if (code === "auth/invalid-email") {
    return "Please enter a valid email address.";
  }

  if (code === "auth/weak-password") {
    return "Password should be at least 6 characters.";
  }

  return error?.message || "Please try again.";
}

export async function register({
  fullName,
  email,
  password,
  mobile,
  gender,
  age,
  acceptedTerms,
}: RegisterPayload): Promise<UserCredential> {
  const cleanName = fullName.trim();
  const cleanEmail = normalizeEmail(email);
  const cleanMobile = normalizeMobile(mobile);

  if (cleanMobile.length !== 10) {
    throw new Error("Please enter a valid 10 digit mobile number.");
  }

  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

    const uid = credential.user.uid;
    const userRef = doc(db, COLLECTIONS.users, uid);

    await setDoc(
      userRef,
      {
        uid,
        fullName: cleanName,
        email: cleanEmail,
        mobile: cleanMobile,
        gender,
        age,

        onboardingCompleted: false,
        acceptedTerms: acceptedTerms ?? true,
        termsAcceptedAt: serverTimestamp(),

        waterGoalMl: 2500,

        language: "en",
        country: "IN",
        timezone: "Asia/Kolkata",

        goal: "Healthy Lifestyle",
        stressLevel: "Moderate",
        aiCoachEnabled: true,
        notificationsEnabled: true,

        plan: "Free",
        subscriptionStatus: "Trial",

        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return credential;
  } catch (error: any) {
    throw new Error(readableAuthError(error));
  }
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
