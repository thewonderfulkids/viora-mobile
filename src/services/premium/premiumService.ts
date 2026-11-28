import { httpsCallable } from "firebase/functions";
import { auth, functions } from "../../firebase/firebaseConfig";
import { getPaymentsByUser } from "../../repositories/paymentRepository";
import { buildFreeSubscription, cancelSubscription, getActiveSubscriptionByUser } from "../../repositories/subscriptionRepository";
import { PremiumDashboard, PremiumFeatureKey, PremiumPlan, UserSubscription } from "../../types/premium";
import { getPlanByCode, PREMIUM_PLANS, PROGRAM_ENTITLEMENTS } from "./premiumPlans";

function isSubscriptionUsable(subscription: UserSubscription) {
  if (["active", "trialing"].includes(subscription.status)) {
    if (!["PLUS_MONTHLY", "PLUS_YEARLY", "PRO_YEARLY", "ELITE_FAMILY_YEARLY"].includes(subscription.planCode) || !subscription.expiresAt) return false;
    return new Date(subscription.expiresAt).getTime() > Date.now();
  }

  return false;
}

function getCurrentPlan(subscription: UserSubscription): PremiumPlan {
  if (!isSubscriptionUsable(subscription)) return getPlanByCode("FREE");
  return getPlanByCode(subscription.planCode);
}

function getNextRecommendedPlan(currentPlan: PremiumPlan): PremiumPlan {
  if (currentPlan.code === "FREE") return getPlanByCode("PLUS_YEARLY");
  if (currentPlan.code === "PLUS_MONTHLY") return getPlanByCode("PLUS_YEARLY");
  if (currentPlan.code === "PLUS_YEARLY") return getPlanByCode("PRO_YEARLY");
  if (currentPlan.code === "PRO_YEARLY") return getPlanByCode("ELITE_FAMILY_YEARLY");
  return currentPlan;
}

export async function getPremiumDashboard(userId: string): Promise<PremiumDashboard> {
  if (!userId || auth.currentUser?.uid !== userId) throw new Error("Login is required to load premium dashboard.");

  // Claim an administrator-preapproved grant only after verified-email sign-in.
  if (auth.currentUser?.uid === userId && auth.currentUser.emailVerified) {
    await httpsCallable(functions, "claimPendingPremiumGrant")({});
  }

  const [subscriptionResult, payments] = await Promise.all([
    getActiveSubscriptionByUser(userId),
    getPaymentsByUser(userId),
  ]);

  if (auth.currentUser?.uid !== userId) throw new Error("Account changed while loading premium dashboard.");
  const subscription = subscriptionResult?.userId === userId ? subscriptionResult : buildFreeSubscription(userId);
  const currentPlan = getCurrentPlan(subscription);
  const activeFeatureKeys = currentPlan.features.filter((feature) => feature.included).map((feature) => feature.key);

  return {
    plans: PREMIUM_PLANS.filter((plan) => plan.active),
    currentPlan,
    subscription,
    payments,
    activeFeatureKeys,
    featureMatrix: currentPlan.features,
    nextRecommendedPlan: getNextRecommendedPlan(currentPlan),
    programEntitlements: PROGRAM_ENTITLEMENTS,
  };
}

export function hasPremiumAccess(subscription: UserSubscription | null | undefined, featureKey?: PremiumFeatureKey) {
  if (!subscription) return false;
  if (!isSubscriptionUsable(subscription)) return false;
  if (!featureKey) return subscription.planCode !== "FREE";
  return subscription.entitlements.includes(featureKey);
}

export async function cancelUserSubscription(subscriptionId: string): Promise<void> {
  if (!subscriptionId) throw new Error("Subscription is required.");
  await cancelSubscription(subscriptionId);
}
