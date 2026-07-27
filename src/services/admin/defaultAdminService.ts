import {
  getIdTokenResult,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";

import { auth, functions } from "../../firebase/firebaseConfig";

type DefaultAdminResponse = {
  success: boolean;
  email: string;
  temporaryPassword: string;
  message: string;
};

type ErrorLike = {
  code?: unknown;
  message?: unknown;
};

function readableError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const candidate = error as ErrorLike;

    const message =
      typeof candidate.message === "string"
        ? candidate.message
        : "Viora could not create the default Super Admin.";

    const code =
      typeof candidate.code === "string"
        ? candidate.code.replace("functions/", "")
        : "";

    return code ? `${message} (${code})` : message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Viora could not create the default Super Admin.";
}

export async function createAndLoginDefaultAdmin() {
  try {
    const callable = httpsCallable<Record<string, never>, DefaultAdminResponse>(
      functions,
      "createDefaultAdmin",
      { timeout: 60000 },
    );

    const result = await callable({});

    if (!result.data.success) {
      throw new Error("Server did not confirm administrator creation.");
    }

    const credential = await signInWithEmailAndPassword(
      auth,
      result.data.email,
      result.data.temporaryPassword,
    );

    await credential.user.getIdToken(true);
    await getIdTokenResult(credential.user, true);

    return result.data;
  } catch (error: unknown) {
    throw new Error(readableError(error));
  }
}
