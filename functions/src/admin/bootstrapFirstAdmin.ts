import { randomUUID } from "node:crypto";

import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const ADMIN_SETUP_KEY = defineSecret("VIORA_ADMIN_SETUP_KEY");

type BootstrapInput = {
  setupKey?: string;
  displayName?: string;
  email?: string;
  password?: string;
};

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function validateInput(input: BootstrapInput) {
  const setupKey = String(input.setupKey ?? "").trim();
  const displayName = String(input.displayName ?? "").trim();
  const email = normalizeEmail(input.email);
  const password = String(input.password ?? "");

  if (!setupKey) {
    throw new HttpsError("invalid-argument", "Setup key is required.");
  }

  if (displayName.length < 2 || displayName.length > 80) {
    throw new HttpsError(
      "invalid-argument",
      "Admin name must be between 2 and 80 characters.",
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpsError("invalid-argument", "Enter a valid admin email.");
  }

  if (password.length < 10) {
    throw new HttpsError(
      "invalid-argument",
      "Admin password must contain at least 10 characters.",
    );
  }

  return { setupKey, displayName, email, password };
}

export const bootstrapFirstAdmin = onCall(
  {
    region: "asia-south1",
    secrets: [ADMIN_SETUP_KEY],
    enforceAppCheck: false,
  },
  async (request) => {
    const input = validateInput((request.data ?? {}) as BootstrapInput);

    if (input.setupKey !== ADMIN_SETUP_KEY.value()) {
      throw new HttpsError(
        "permission-denied",
        "The one-time administrator setup key is incorrect.",
      );
    }

    const db = getFirestore();
    const auth = getAuth();
    const lockRef = db.doc("system/bootstrapAdmin");
    const reservationId = randomUUID();

    // Firestore transactions must not perform independent queries inside
    // their callback. Check existing admins before acquiring the atomic
    // bootstrap reservation; the transaction lock prevents concurrent claims.
    const existingAdmins = await db
      .collection("users")
      .where("role", "in", ["admin", "super_admin"])
      .limit(1)
      .get();
    if (!existingAdmins.empty) {
      throw new HttpsError(
        "already-exists",
        "An administrator already exists. One-time setup is disabled.",
      );
    }

    await db.runTransaction(async (transaction) => {
      const lockSnap = await transaction.get(lockRef);

      if (lockSnap.exists) {
        const lock = lockSnap.data();

        if (lock?.claimed === true || lock?.locked === true) {
          throw new HttpsError(
            "already-exists",
            "The first Super Admin has already been created.",
          );
        }

        if (lock?.status === "creating") {
          throw new HttpsError(
            "aborted",
            "Administrator creation is already in progress.",
          );
        }
      }

      transaction.set(
        lockRef,
        {
          status: "creating",
          reservationId,
          requestedEmail: input.email,
          startedAt: FieldValue.serverTimestamp(),
          claimed: false,
          locked: false,
        },
        { merge: true },
      );
    });

    let createdUid: string | null = null;

    try {
      try {
        await auth.getUserByEmail(input.email);
        throw new HttpsError(
          "already-exists",
          "This email already belongs to an existing Firebase user. Use a new email.",
        );
      } catch (error) {
        const code =
          typeof error === "object" &&
          error !== null &&
          "code" in error
            ? String((error as { code?: unknown }).code)
            : "";

        if (code && code !== "auth/user-not-found") {
          throw error;
        }
      }

      const userRecord = await auth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        emailVerified: false,
        disabled: false,
      });

      createdUid = userRecord.uid;

      await auth.setCustomUserClaims(userRecord.uid, {
        role: "super_admin",
        admin: true,
        superAdmin: true,
      });

      const now = FieldValue.serverTimestamp();

      await db.runTransaction(async (transaction) => {
        const lockSnap = await transaction.get(lockRef);
        const lock = lockSnap.data();

        if (
          !lockSnap.exists ||
          lock?.reservationId !== reservationId ||
          lock?.status !== "creating"
        ) {
          throw new HttpsError(
            "aborted",
            "Administrator setup reservation is no longer valid.",
          );
        }

        const deletionLock = await transaction.get(db.doc(`accountDeletionLocks/${userRecord.uid}`));
        if (deletionLock.exists) throw new HttpsError("failed-precondition", "Account deletion lock exists.");

        transaction.set(
          db.doc(`users/${userRecord.uid}`),
          {
            uid: userRecord.uid,
            displayName: input.displayName,
            email: input.email,
            role: "super_admin",
            accessRole: "super_admin",
            isAdmin: true,
            onboardingCompleted: true,
            accountStatus: "active",
            adminCreatedBy: "one_time_new_account_bootstrap",
            adminCreatedAt: now,
            createdAt: now,
            updatedAt: now,
          },
          { merge: true },
        );

        transaction.set(
          lockRef,
          {
            status: "completed",
            claimed: true,
            locked: true,
            claimedBy: userRecord.uid,
            claimedEmail: input.email,
            claimedAt: now,
            reservationId,
          },
          { merge: true },
        );
      });

      return {
        success: true,
        uid: userRecord.uid,
        email: input.email,
        message:
          "Viora Super Admin account created successfully. You can now sign in.",
      };
    } catch (error) {
      if (createdUid) {
        await auth.deleteUser(createdUid).catch(() => undefined);
      }

      await db.runTransaction(async (transaction) => {
        const lockSnap = await transaction.get(lockRef);
        const lock = lockSnap.data();

        if (
          lockSnap.exists &&
          lock?.reservationId === reservationId &&
          lock?.status === "creating"
        ) {
          transaction.set(
            lockRef,
            {
              status: "failed",
              claimed: false,
              locked: false,
              reservationId: null,
              requestedEmail: null,
              failedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        }
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Viora could not create the Super Admin account.";

      throw new HttpsError("internal", message);
    }
  },
);
