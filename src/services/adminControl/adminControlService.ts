import {
  getAdminAppConfig,
  getAdminStats,
  listAdminContent,
  saveAdminAppConfig,
  saveAdminContent,
  searchAdminUsersByEmailOrMobile,
  setAdminContentActive,
  setAdminSubscriptionGrant,
  updateAdminUserStatus,
} from "../../repositories";
import { AdminAppConfig, AdminContentInput, AdminControlState, AdminUserSearchResult, PremiumFeatureKey, PremiumPlanCode, UserSubscription } from "../../types";
import { getPlanByCode } from "../premium";
import { isVioraAccessAdmin, normalizeAdminEmail } from "../adminAccess";

function nowIso() {
  return new Date().toISOString();
}

function entitlementsFromPlan(planCode: PremiumPlanCode): PremiumFeatureKey[] {
  return getPlanByCode(planCode).features.filter((feature) => feature.included).map((feature) => feature.key);
}

export function assertVioraAdmin(email?: string | null) {
  if (!isVioraAccessAdmin(email)) throw new Error("Admin access is required.");
}

export async function getAdminControlState(adminEmail?: string | null): Promise<AdminControlState> {
  assertVioraAdmin(adminEmail);
  const [stats, appConfig, content] = await Promise.all([
    getAdminStats(),
    getAdminAppConfig(),
    listAdminContent(),
  ]);

  return { stats, appConfig, content };
}

export async function updateAdminConfig(adminEmail: string | null | undefined, config: AdminAppConfig) {
  assertVioraAdmin(adminEmail);
  return saveAdminAppConfig(config);
}

export async function upsertAdminContent(adminEmail: string | null | undefined, input: AdminContentInput) {
  assertVioraAdmin(adminEmail);
  if (!input.title.trim()) throw new Error("Title is required.");
  return saveAdminContent(input);
}

export async function toggleAdminContent(adminEmail: string | null | undefined, id: string, isActive: boolean) {
  assertVioraAdmin(adminEmail);
  await setAdminContentActive(id, isActive);
}

export async function searchAdminUsers(adminEmail: string | null | undefined, term: string): Promise<AdminUserSearchResult[]> {
  assertVioraAdmin(adminEmail);
  return searchAdminUsersByEmailOrMobile(term);
}

export async function setAdminUserDisabled(adminEmail: string | null | undefined, uid: string, disabled: boolean) {
  assertVioraAdmin(adminEmail);
  await updateAdminUserStatus(uid, disabled);
}

export async function grantAdminPlan(input: {
  adminUserId: string;
  adminEmail: string;
  targetUser: AdminUserSearchResult;
  planCode: PremiumPlanCode;
}) {
  assertVioraAdmin(input.adminEmail);
  const plan = getPlanByCode(input.planCode);
  const timestamp = nowIso();
  const expiresAt = plan.durationDays ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString() : null;

  const payload: UserSubscription & {
    source: "admin_access_grant";
    grantedByUserId: string;
    grantedByEmail: string;
    targetEmail: string;
    targetName: string;
    note: string;
  } = {
    id: `admin_grant_${input.targetUser.uid}`,
    userId: input.targetUser.uid,
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
    familyOwnerUserId: plan.tier === "elite_family" ? input.targetUser.uid : null,
    invoiceOwnerUserId: input.targetUser.uid,
    entitlements: entitlementsFromPlan(plan.code),
    purchasedProgramIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    source: "admin_access_grant",
    grantedByUserId: input.adminUserId,
    grantedByEmail: normalizeAdminEmail(input.adminEmail),
    targetEmail: input.targetUser.email,
    targetName: input.targetUser.fullName,
    note: "Updated from Viora Admin Control Panel",
  };

  return setAdminSubscriptionGrant(payload);
}
