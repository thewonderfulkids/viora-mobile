import { createHash } from "node:crypto";
import { getAuth, type UserRecord } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const PLANS = {
  FREE: { tier: "free", days: null, maxMembers: 1, entitlements: [] },
  PLUS_MONTHLY: { tier: "plus", days: 30, maxMembers: 1, entitlements: ["ai_coach_unlimited","ai_memory_extended","wellness_intelligence_pro","smart_notifications","program_discounts"] },
  PLUS_YEARLY: { tier: "plus", days: 365, maxMembers: 1, entitlements: ["ai_coach_unlimited","ai_memory_extended","wellness_intelligence_pro","nutrition_advanced","mental_wellness_advanced","smart_notifications","health_reports","program_discounts"] },
  PRO_YEARLY: { tier: "pro", days: 365, maxMembers: 1, entitlements: ["ai_coach_unlimited","ai_memory_extended","wellness_intelligence_pro","nutrition_advanced","mental_wellness_advanced","smart_notifications","health_reports","voice_ai","priority_ai","program_discounts"] },
  ELITE_FAMILY_YEARLY: { tier: "elite_family", days: 365, maxMembers: 4, entitlements: ["ai_coach_unlimited","ai_memory_extended","wellness_intelligence_pro","nutrition_advanced","mental_wellness_advanced","smart_notifications","health_reports","voice_ai","family_dashboard","priority_ai","program_discounts","standard_programs_included"] },
} as const;
type PlanCode = keyof typeof PLANS;
const emailKey = (email: string) => createHash("sha256").update(email).digest("hex");
const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase();
const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
const isPlan = (code: unknown): code is PlanCode => typeof code === "string" && Object.prototype.hasOwnProperty.call(PLANS, code);

async function requireAdmin(uid: string | undefined) {
  if (!uid) throw new HttpsError("unauthenticated", "Sign in as an administrator.");
  const user = await getAuth().getUser(uid);
  if (user.disabled) throw new HttpsError("permission-denied", "Administrator account disabled.");
  const claims = user.customClaims ?? {};
  if (claims.admin !== true && claims.superAdmin !== true && !["admin","super_admin"].includes(String(claims.role ?? ""))) {
    throw new HttpsError("permission-denied", "Administrator privileges required.");
  }
  return user;
}

async function applyGrant(uid: string, email: string, grant: { planCode: PlanCode; note: string; grantedByUid: string; grantedByEmail: string; createdAt: string }, actorUid: string, expectedPending?: FirebaseFirestore.DocumentSnapshot) {
  const plan = PLANS[grant.planCode];
  const now = new Date();
  const nowIso = now.toISOString();
  const expiresAt = plan.days === null ? null : new Date(now.getTime() + plan.days * 86400000).toISOString();
  const db = getFirestore();
  const subscriptionId = `admin_grant_${uid}`;
  const ref = db.doc(`subscriptions/${subscriptionId}`);
  return db.runTransaction(async tx => {
    const freeze = await tx.get(db.doc(`accountDeletionLocks/${uid}`));
    if (freeze.exists) throw new HttpsError("failed-precondition", "Account deletion is in progress.");
    const actorFreeze = await tx.get(db.doc(`accountDeletionLocks/${actorUid}`));
    if (actorFreeze.exists) throw new HttpsError("failed-precondition", "Acting account deletion is in progress.");
    const pendingRef = db.doc(`pendingPremiumGrants/${emailKey(email)}`);
    const pending = await tx.get(pendingRef);
    if (expectedPending && (!pending.exists || !pending.updateTime?.isEqual(expectedPending.updateTime!))) return null;
    const previous = await tx.get(ref);
    tx.set(ref, {
      id: subscriptionId, userId: uid, planCode: grant.planCode, tier: plan.tier,
      status: grant.planCode === "FREE" ? "free" : "active",
      provider: "manual", startedAt: nowIso, currentPeriodStart: nowIso,
      currentPeriodEnd: expiresAt, renewalDate: expiresAt, cancelledAt: null,
      expiresAt, maxMembers: plan.maxMembers,
      familyOwnerUserId: plan.tier === "elite_family" ? uid : null,
      invoiceOwnerUserId: uid, entitlements: [...plan.entitlements],
      purchasedProgramIds: previous.exists ? (previous.data()?.purchasedProgramIds ?? []) : [],
      createdAt: previous.exists ? (previous.data()?.createdAt ?? nowIso) : nowIso,
      updatedAt: nowIso, source: "admin_access_grant",
      grantedByUserId: grant.grantedByUid, grantedByEmail: grant.grantedByEmail,
      targetEmail: email, note: grant.note,
      serverUpdatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    if (pending.exists) tx.delete(pendingRef);
    return { subscriptionId, planCode: grant.planCode, expiresAt };
  });
}

export const adminGrantPremiumByEmail = onCall({ region: "asia-south1", enforceAppCheck: false }, async request => {
  const admin = await requireAdmin(request.auth?.uid);
  const email = normalize(request.data?.email);
  const planCode = request.data?.planCode;
  const note = String(request.data?.note ?? "").trim().slice(0, 500);
  if (!validEmail(email) || !isPlan(planCode)) throw new HttpsError("invalid-argument", "Valid email and plan required.");
  const grant = { planCode, note, grantedByUid: admin.uid, grantedByEmail: normalize(admin.email), createdAt: new Date().toISOString() };
  const pendingRef = getFirestore().doc(`pendingPremiumGrants/${emailKey(email)}`);
  let target: UserRecord | undefined;
  try { target = await getAuth().getUserByEmail(email); }
  catch (error: any) {
    if (error?.code !== "auth/user-not-found") throw new HttpsError("internal", "Unable to look up user.");
  }
  if (target) {
    if (target.disabled) throw new HttpsError("failed-precondition", "Target account disabled.");
    if (target.emailVerified === true) {
      await applyGrant(target.uid, email, grant, admin.uid);
      return { status: "active", email, planCode };
    }
  }
  // New and unverified accounts must prove email ownership before claiming access.
  await getFirestore().runTransaction(async tx => {
    const actorLock = await tx.get(getFirestore().doc(`accountDeletionLocks/${admin.uid}`));
    if (actorLock.exists) throw new HttpsError("failed-precondition", "Account deletion is in progress.");
    if (target && (await tx.get(getFirestore().doc(`accountDeletionLocks/${target.uid}`))).exists) {
      throw new HttpsError("failed-precondition", "Target account deletion is in progress.");
    }
    tx.set(pendingRef, { ...grant, email, status: "pending", updatedAt: FieldValue.serverTimestamp() });
  });
  return { status: "pending", email, planCode };
});

export const claimPendingPremiumGrant = onCall({ region: "asia-south1", enforceAppCheck: false }, async request => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in to claim access.");
  const user = await getAuth().getUser(uid);
  if (user.disabled) throw new HttpsError("failed-precondition", "Account disabled.");
  const email = normalize(user.email);
  if (!validEmail(email) || user.emailVerified !== true) return { claimed: false };
  const ref = getFirestore().doc(`pendingPremiumGrants/${emailKey(email)}`);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.email !== email || snap.data()?.status !== "pending") return { claimed: false };
  const data = snap.data()!;
  if (!isPlan(data.planCode)) throw new HttpsError("failed-precondition", "Invalid pending plan.");
  const grant = { planCode: data.planCode, note: String(data.note ?? ""), grantedByUid: String(data.grantedByUid ?? ""), grantedByEmail: String(data.grantedByEmail ?? ""), createdAt: String(data.createdAt ?? "") };
  const result = await applyGrant(uid, email, grant, uid, snap);
  if (!result) return { claimed: false };
  return { claimed: true, ...result };
});
