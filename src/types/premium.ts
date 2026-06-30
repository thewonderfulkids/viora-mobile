export type PremiumPlanCode = "FREE" | "PLUS_MONTHLY" | "PLUS_YEARLY" | "PRO_YEARLY" | "ELITE_FAMILY_YEARLY";

export type PremiumPlanTier = "free" | "plus" | "pro" | "elite_family";

export type BillingCycle = "none" | "monthly" | "yearly" | "lifetime";

export type SubscriptionStatus = "free" | "active" | "trialing" | "past_due" | "cancelled" | "expired";

export type PaymentProvider = "manual" | "razorpay" | "google_play" | "apple_iap" | "stripe";

export type PaymentStatus = "created" | "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type PremiumFeatureKey =
  | "ai_coach_unlimited"
  | "ai_memory_extended"
  | "wellness_intelligence_pro"
  | "nutrition_advanced"
  | "mental_wellness_advanced"
  | "smart_notifications"
  | "health_reports"
  | "voice_ai"
  | "family_dashboard"
  | "priority_ai"
  | "program_discounts"
  | "standard_programs_included";

export type PremiumPlanFeature = {
  key: PremiumFeatureKey;
  label: string;
  description: string;
  included: boolean;
};

export type PremiumPlan = {
  code: PremiumPlanCode;
  tier: PremiumPlanTier;
  name: string;
  displayName: string;
  badge: string;
  description: string;
  priceInr: number;
  compareAtPriceInr?: number;
  billingCycle: BillingCycle;
  durationDays: number | null;
  maxMembers: number;
  popular: boolean;
  active: boolean;
  ctaLabel: string;
  featureSummary: string[];
  features: PremiumPlanFeature[];
};

export type UserSubscription = {
  id: string;
  userId: string;
  planCode: PremiumPlanCode;
  tier: PremiumPlanTier;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  startedAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  renewalDate: string | null;
  cancelledAt: string | null;
  expiresAt: string | null;
  maxMembers: number;
  familyOwnerUserId: string | null;
  invoiceOwnerUserId: string;
  entitlements: PremiumFeatureKey[];
  purchasedProgramIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  planCode: PremiumPlanCode;
  provider: PaymentProvider;
  status: PaymentStatus;
  amountInr: number;
  currency: "INR";
  providerOrderId: string | null;
  providerPaymentId: string | null;
  providerSignature: string | null;
  invoiceNumber: string | null;
  invoiceOwnerUserId: string;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
};

export type PremiumProgramEntitlement = {
  programId: string;
  title: string;
  category: "yoga" | "home_workout" | "weight_loss" | "nutrition" | "mental_wellness" | "sleep" | "custom";
  durationDays: number;
  includedInPlanCodes: PremiumPlanCode[];
  discountPercentByPlan: Partial<Record<PremiumPlanCode, number>>;
};

export type PremiumDashboard = {
  plans: PremiumPlan[];
  currentPlan: PremiumPlan;
  subscription: UserSubscription;
  payments: PaymentRecord[];
  activeFeatureKeys: PremiumFeatureKey[];
  featureMatrix: PremiumPlanFeature[];
  nextRecommendedPlan: PremiumPlan;
  programEntitlements: PremiumProgramEntitlement[];
};

export type CreatePaymentIntentInput = {
  userId: string;
  planCode: PremiumPlanCode;
  provider: PaymentProvider;
};
