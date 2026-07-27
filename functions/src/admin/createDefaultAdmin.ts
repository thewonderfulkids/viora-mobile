import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const DEFAULT_ADMIN_PASSWORD = defineSecret(
  "VIORA_DEFAULT_ADMIN_PASSWORD_V2",
);

const DEFAULT_ADMIN_EMAIL = "viora.admin@winflyindia.in";
const DEFAULT_ADMIN_NAME = "Viora Super Admin";

function asMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown server error";
}

export const createDefaultAdmin = onCall(
  {
    region: "asia-south1",
    secrets: [DEFAULT_ADMIN_PASSWORD],
    enforceAppCheck: false,
    timeoutSeconds: 60,
  },
  async () => {
    const password = DEFAULT_ADMIN_PASSWORD.value();

    if (!password || password.length < 10) {
      throw new HttpsError(
        "failed-precondition",
        "Default admin password secret is missing or invalid.",
      );
    }

    const auth = getAuth();
    const db = getFirestore();
    const lockRef = db.doc("system/defaultAdminBootstrap");

    const existingLock = await lockRef.get();
    if (existingLock.exists && existingLock.data()?.locked === true) {
      throw new HttpsError(
        "already-exists",
        "Default Super Admin has already been created.",
      );
    }

    const existingAdmins = await db
      .collection("users")
      .where("role", "in", ["admin", "super_admin"])
      .limit(1)
      .get();

    if (!existingAdmins.empty) {
      throw new HttpsError(
        "already-exists",
        "An administrator already exists. Default setup is disabled.",
      );
    }

    await lockRef.set(
      {
        status: "creating",
        locked: false,
        startedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    let uid: string | null = null;

    try {
      try {
        const existingUser = await auth.getUserByEmail(DEFAULT_ADMIN_EMAIL);
        uid = existingUser.uid;

        await auth.updateUser(uid, {
          password,
          displayName: DEFAULT_ADMIN_NAME,
          disabled: false,
        });
      } catch (error) {
        const code =
          typeof error === "object" &&
          error !== null &&
          "code" in error
            ? String((error as { code?: unknown }).code)
            : "";

        if (code !== "auth/user-not-found") {
          throw error;
        }

        const created = await auth.createUser({
          email: DEFAULT_ADMIN_EMAIL,
          password,
          displayName: DEFAULT_ADMIN_NAME,
          emailVerified: false,
          disabled: false,
        });

        uid = created.uid;
      }

      if (!uid) {
        throw new Error("Firebase Authentication did not return a user UID.");
      }

      await auth.setCustomUserClaims(uid, {
        role: "super_admin",
        admin: true,
        superAdmin: true,
      });

      const now = FieldValue.serverTimestamp();
      const batch = db.batch();

      batch.set(
        db.doc(`users/${uid}`),
        {
          uid,
          displayName: DEFAULT_ADMIN_NAME,
          email: DEFAULT_ADMIN_EMAIL,
          role: "super_admin",
          accessRole: "super_admin",
          isAdmin: true,
          onboardingCompleted: true,
          accountStatus: "active",
          adminCreatedBy: "default_admin_seeder_v2",
          adminCreatedAt: now,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      );

      batch.set(
        lockRef,
        {
          status: "completed",
          locked: true,
          claimed: true,
          claimedBy: uid,
          claimedEmail: DEFAULT_ADMIN_EMAIL,
          claimedAt: now,
          lastError: null,
        },
        { merge: true },
      );

      await batch.commit();

      return {
        success: true,
        email: DEFAULT_ADMIN_EMAIL,
        temporaryPassword: password,
        message:
          "Default Viora Super Admin created and secured successfully.",
      };
    } catch (error) {
      await lockRef.set(
        {
          status: "failed",
          locked: false,
          failedAt: FieldValue.serverTimestamp(),
          lastError: asMessage(error),
        },
        { merge: true },
      );

      if (error instanceof HttpsError) {
        throw error;
      }

      throw new HttpsError("internal", asMessage(error));
    }
  },
);
