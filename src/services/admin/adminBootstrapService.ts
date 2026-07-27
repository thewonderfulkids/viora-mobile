import { signInWithEmailAndPassword } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

import { auth, functions } from "../../firebase/firebaseConfig";

type CreateAdminInput = {
  displayName: string;
  email: string;
  password: string;
  setupKey: string;
};

type CreateAdminResponse = {
  success: boolean;
  uid: string;
  email: string;
  message: string;
};

export async function createFirstSuperAdmin(input: CreateAdminInput) {
  const callable = httpsCallable<CreateAdminInput, CreateAdminResponse>(
    functions,
    "bootstrapFirstAdmin",
  );

  const result = await callable({
    displayName: input.displayName.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    setupKey: input.setupKey.trim(),
  });

  if (!result.data.success) {
    throw new Error("Super Admin account could not be created.");
  }

  await signInWithEmailAndPassword(
    auth,
    input.email.trim().toLowerCase(),
    input.password,
  );

  await auth.currentUser?.getIdToken(true);

  return result.data;
}
