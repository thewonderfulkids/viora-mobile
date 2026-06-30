import { getActiveSubscriptionByUser } from "../../repositories";
import { createDefaultFamily, getFamilyByOwner, getFamilyMembers, inviteFamilyMember, pauseFamilyMember, updateFamilyPlan } from "../../repositories/familyRepository";
import { FamilyDashboard, FamilyDashboardMetric, FamilyGroup, FamilyInsight, FamilyInviteInput, FamilyMember } from "../../types";

const FAMILY_SETUP_MEMBER_LIMIT = 4;

function planLimit(_planCode: FamilyGroup["planCode"]) {
  return FAMILY_SETUP_MEMBER_LIMIT;
}

function hasEliteFamilyAccess(planCode: FamilyGroup["planCode"]) {
  return planCode === "ELITE_FAMILY_YEARLY";
}

function metric(id: string, label: string, value: string, helper: string, tone: FamilyDashboardMetric["tone"] = "neutral"): FamilyDashboardMetric {
  return { id, label, value, helper, tone };
}

function average(values: number[]) {
  const clean = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!clean.length) return 0;
  return Math.round(clean.reduce((sum, value) => sum + value, 0) / clean.length);
}

function buildInsights(members: FamilyMember[], eliteFamilyReady: boolean): FamilyInsight[] {
  const active = members.filter((item) => item.status === "active");
  const invited = members.filter((item) => item.status === "invited");
  const lowScores = active.filter((item) => item.wellnessScore > 0 && item.wellnessScore < 55);

  const insights: FamilyInsight[] = [];

  insights.push({
    id: "family_ready",
    title: eliteFamilyReady ? "Elite Family active" : "Family setup ready",
    message: eliteFamilyReady
      ? "Your Elite Family plan can coordinate up to 4 members with shared AI wellness visibility."
      : "You can prepare up to 4 family profiles now. Elite Family unlocks shared dashboards, cross-member insights and family AI reminders.",
    tone: eliteFamilyReady ? "positive" : "neutral",
    relatedMemberId: null,
  });

  if (invited.length) {
    insights.push({
      id: "pending_invites",
      title: "Pending invites",
      message: `${invited.length} family invitation${invited.length === 1 ? " is" : "s are"} waiting to be accepted.`,
      tone: "warning",
      relatedMemberId: invited[0]?.id || null,
    });
  }

  if (lowScores.length) {
    insights.push({
      id: "attention_member",
      title: "Member needs attention",
      message: `${lowScores[0].displayName}'s wellness score is below target. Viora can suggest reminders once their profile is active.`,
      tone: "warning",
      relatedMemberId: lowScores[0].id,
    });
  }

  return insights;
}

function buildDashboard(family: FamilyGroup, members: FamilyMember[]): FamilyDashboard {
  const activeMembers = members.filter((item) => item.status === "active");
  const invitedMembers = members.filter((item) => item.status === "invited");
  const eliteFamilyReady = hasEliteFamilyAccess(family.planCode);
  const visibleMembers = members.filter((item) => item.status !== "removed");
  const remainingSlots = Math.max(family.maxMembers - visibleMembers.length, 0);
  const averageScore = average(activeMembers.map((item) => item.wellnessScore));

  return {
    family,
    members,
    canInviteMore: remainingSlots > 0,
    remainingSlots,
    eliteFamilyReady,
    aiSummary: eliteFamilyReady
      ? `Viora is ready to coordinate wellness for ${activeMembers.length} active family member${activeMembers.length === 1 ? "" : "s"}. Shared reports, reminders and family AI insights are enabled at the architecture level.`
      : "Family setup is active. Add family members now; Elite Family will unlock shared dashboards, cross-member insights and family AI reminders.",
    metrics: [
      metric("members", "Family Members", `${visibleMembers.length}/${family.maxMembers}`, `${remainingSlots} setup slot${remainingSlots === 1 ? "" : "s"} available`, remainingSlots > 0 ? "positive" : "neutral"),
      metric("active", "Active Profiles", String(activeMembers.length), `${invitedMembers.length} pending invite${invitedMembers.length === 1 ? "" : "s"}`, invitedMembers.length ? "warning" : "positive"),
      metric("score", "Family Score", averageScore ? `${averageScore}/100` : "—", "Average active member score", averageScore >= 70 ? "positive" : averageScore ? "warning" : "neutral"),
    ],
    insights: buildInsights(members, eliteFamilyReady),
  };
}

export async function getFamilyDashboard(userId: string, displayName: string): Promise<FamilyDashboard> {
  if (!userId) throw new Error("Please login to manage Family Wellness.");

  const subscription = await getActiveSubscriptionByUser(userId);
  const planCode = subscription?.planCode || "FREE";
  const maxMembers = planLimit(planCode);
  let family = await getFamilyByOwner(userId);

  if (!family) {
    family = await createDefaultFamily(userId, displayName, planCode, maxMembers);
  } else if (family.planCode !== planCode || family.maxMembers !== maxMembers) {
    await updateFamilyPlan(family.id, planCode, maxMembers, family.activeMemberCount);
    family = { ...family, planCode, maxMembers };
  }

  const members = await getFamilyMembers(family.id, userId);
  return buildDashboard({ ...family, activeMemberCount: members.length }, members);
}

export async function createFamilyInvite(userId: string, displayName: string, input: FamilyInviteInput): Promise<FamilyDashboard> {
  if (!input.displayName.trim()) throw new Error("Member name is required.");

  const dashboard = await getFamilyDashboard(userId, displayName);
  if (!dashboard.canInviteMore) {
    throw new Error("No family setup slots available. Viora supports up to 4 family members in the current V1 family structure.");
  }

  await inviteFamilyMember(dashboard.family, input);
  return getFamilyDashboard(userId, displayName);
}

export async function pauseFamilyMemberById(userId: string, displayName: string, memberId: string): Promise<FamilyDashboard> {
  await pauseFamilyMember(memberId);
  return getFamilyDashboard(userId, displayName);
}
