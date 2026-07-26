import { findAdminAccessUserByEmail, setAdminSubscriptionGrant } from "../../repositories/adminAccessRepository";
import { AdminAccessGrantInput, AdminAccessGrantResult, AdminAccessUser, PremiumFeatureKey, PremiumPlanCode, UserSubscription } from "../../types";
import { getPlanByCode } from "../premium";
import { isVioraAccessAdmin, normalizeAdminEmail } from "./adminAccessConfig";

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

function entitlementsFromPlan(planCode: PremiumPlanCode): PremiumFeatureKey[] {
  return getPlanByCode(planCode).features.filter((feature) => feature.included).map((feature) => feature.key);
}

export async function searchAccessUserByEmail(adminEmail: string, targetEmail: string): Promise<AdminAccessUser | null> {
  if (!isVioraAccessAdmin(adminEmail)) throw new Error("Admin access is required.");

  const email = normalizeEmail(targetEmail);
  if (!email || !email.includes("@")) throw new Error("Enter a valid user email.");

  return findAdminAccessUserByEmail(email);
}

export async function grantPremiumAccess(input: AdminAccessGrantInput): Promise<AdminAccessGrantResult> {
  if (!isVioraAccessAdmin(input.adminEmail)) throw new Error("Admin access is required.");
  if (!input.targetUserId) throw new Error("Select a user first.");

  const plan = getPlanByCode(input.planCode);
  if (!plan.active) throw new Error("Selected plan is not active.");

  const timestamp = nowIso();
  const expiresAt = input.expiresAt === undefined ? null : input.expiresAt;
  const payload: UserSubscription & {
    source: "admin_access_grant";
    grantedByUserId: string;
    grantedByEmail: string;
    targetEmail: string;
    targetName: string;
    note: string;
  } = {
    id: `admin_grant_${input.targetUserId}`,
    userId: input.targetUserId,
    planCode: plan.code,
    tier: plan.tier,
    status: plan.code === "FREE" ? "free" : "active",
    provider: "manual",
    startedAt: timestamp,
    currentPeriodStart: timestamp,
    currentPeriodEnd: expiresAt,
    renewalDate: expiresAt,
    cancelledAt: null,
    expiresAt,
    maxMembers: plan.maxMembers,
    familyOwnerUserId: plan.tier === "elite_family" ? input.targetUserId : null,
    invoiceOwnerUserId: input.targetUserId,
    entitlements: entitlementsFromPlan(plan.code),
    purchasedProgramIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    source: "admin_access_grant",
    grantedByUserId: input.adminUserId,
    grantedByEmail: normalizeAdminEmail(input.adminEmail),
    targetEmail: normalizeEmail(input.targetEmail),
    targetName: input.targetName,
    note: String(input.note || "").trim(),
  };

  return setAdminSubscriptionGrant(payload);
}

export function getAdminGrantExpiry(planCode: PremiumPlanCode) {
  const plan = getPlanByCode(planCode);
  if (!plan.durationDays) return null;
  return new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();
}
