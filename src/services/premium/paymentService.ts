import { createPaymentRecord, markPaymentStatus } from "../../repositories/paymentRepository";
import { upsertSubscription } from "../../repositories/subscriptionRepository";
import { CreatePaymentIntentInput, PaymentRecord, PremiumPlanCode } from "../../types/premium";
import { getPlanByCode } from "./premiumPlans";

function entitlementsFromPlan(planCode: PremiumPlanCode) {
  return getPlanByCode(planCode).features.filter((feature) => feature.included).map((feature) => feature.key);
}

export async function createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentRecord> {
  if (!input.userId) throw new Error("Login is required to start payment.");

  const plan = getPlanByCode(input.planCode);
  if (plan.code === "FREE") throw new Error("Free plan does not require payment.");

  return createPaymentRecord({
    userId: input.userId,
    planCode: input.planCode,
    provider: input.provider,
    amountInr: plan.priceInr,
  });
}

export async function activateManualPaymentForTesting(input: {
  userId: string;
  paymentId: string;
  planCode: PremiumPlanCode;
}): Promise<void> {
  const plan = getPlanByCode(input.planCode);
  const subscription = await upsertSubscription({
    userId: input.userId,
    planCode: plan.code,
    tier: plan.tier,
    status: "active",
    provider: "manual",
    durationDays: plan.durationDays,
    maxMembers: plan.maxMembers,
    entitlements: entitlementsFromPlan(plan.code),
  });

  await markPaymentStatus(input.paymentId, "paid", subscription.id);
}
