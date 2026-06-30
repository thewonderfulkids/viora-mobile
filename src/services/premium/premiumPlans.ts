import { PremiumPlan, PremiumPlanCode, PremiumPlanFeature, PremiumProgramEntitlement } from "../../types/premium";

const BASE_FEATURES: PremiumPlanFeature[] = [
  { key: "ai_coach_unlimited", label: "Unlimited AI Coach", description: "Deeper daily coaching without basic usage limits.", included: false },
  { key: "ai_memory_extended", label: "Extended AI Memory", description: "Longer-term memory for habits, routines and preferences.", included: false },
  { key: "wellness_intelligence_pro", label: "Wellness Intelligence Pro", description: "Advanced scoring, trends and early risk signals.", included: false },
  { key: "nutrition_advanced", label: "Advanced Nutrition", description: "Macro balance, meal intelligence and advanced nutrition insights.", included: false },
  { key: "mental_wellness_advanced", label: "Advanced Mood Intelligence", description: "Mood patterns, trigger detection and coping recommendations.", included: false },
  { key: "smart_notifications", label: "Smart Notifications", description: "Personalized nudges driven by habits and AI memory.", included: false },
  { key: "health_reports", label: "Health Reports", description: "Weekly and monthly reports ready for Sprint 20.", included: false },
  { key: "voice_ai", label: "Voice AI Ready", description: "Voice command access when Sprint 21 is enabled.", included: false },
  { key: "family_dashboard", label: "Family Dashboard", description: "Family wellness support ready for Sprint 22.", included: false },
  { key: "priority_ai", label: "Priority AI", description: "Priority AI processing and premium support.", included: false },
  { key: "program_discounts", label: "Program Discounts", description: "Discounts on yoga, home workout and weight-loss programs.", included: false },
  { key: "standard_programs_included", label: "Standard Programs Included", description: "Selected guided programs included for Elite Family.", included: false },
];

function features(keys: PremiumPlanFeature["key"][]): PremiumPlanFeature[] {
  return BASE_FEATURES.map((item) => ({ ...item, included: keys.includes(item.key) }));
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    code: "FREE",
    tier: "free",
    name: "Free",
    displayName: "Viora Free",
    badge: "Starter",
    description: "Core wellness tracking for hydration, sleep, yoga, mood, nutrition and habits.",
    priceInr: 0,
    billingCycle: "none",
    durationDays: null,
    maxMembers: 1,
    popular: false,
    active: true,
    ctaLabel: "Current Plan",
    featureSummary: ["Core tracking", "Basic AI coach", "Basic nutrition", "Basic mood tracking"],
    features: features([]),
  },
  {
    code: "PLUS_MONTHLY",
    tier: "plus",
    name: "Plus Monthly",
    displayName: "Viora Plus Monthly",
    badge: "Flexible",
    description: "Premium AI wellness for individuals who want monthly flexibility.",
    priceInr: 299,
    billingCycle: "monthly",
    durationDays: 30,
    maxMembers: 1,
    popular: false,
    active: true,
    ctaLabel: "Upgrade Monthly",
    featureSummary: ["Unlimited AI Coach", "Extended AI Memory", "Smart reminders", "Advanced wellness insights"],
    features: features(["ai_coach_unlimited", "ai_memory_extended", "wellness_intelligence_pro", "smart_notifications", "program_discounts"]),
  },
  {
    code: "PLUS_YEARLY",
    tier: "plus",
    name: "Plus Yearly",
    displayName: "Viora Plus Yearly",
    badge: "Most Popular",
    description: "Best value for individual users building long-term wellness habits.",
    priceInr: 2499,
    compareAtPriceInr: 3588,
    billingCycle: "yearly",
    durationDays: 365,
    maxMembers: 1,
    popular: true,
    active: true,
    ctaLabel: "Upgrade Yearly",
    featureSummary: ["Everything in Plus Monthly", "Yearly savings", "Reports ready", "Nutrition + mood pro"],
    features: features(["ai_coach_unlimited", "ai_memory_extended", "wellness_intelligence_pro", "nutrition_advanced", "mental_wellness_advanced", "smart_notifications", "health_reports", "program_discounts"]),
  },
  {
    code: "PRO_YEARLY",
    tier: "pro",
    name: "Pro Yearly",
    displayName: "Viora Pro",
    badge: "Power User",
    description: "For users who want deeper AI reports, advanced insights and priority wellness intelligence.",
    priceInr: 5999,
    billingCycle: "yearly",
    durationDays: 365,
    maxMembers: 1,
    popular: false,
    active: true,
    ctaLabel: "Go Pro",
    featureSummary: ["Priority AI", "Advanced reports", "Voice AI ready", "Higher program discounts"],
    features: features(["ai_coach_unlimited", "ai_memory_extended", "wellness_intelligence_pro", "nutrition_advanced", "mental_wellness_advanced", "smart_notifications", "health_reports", "voice_ai", "priority_ai", "program_discounts"]),
  },
  {
    code: "ELITE_FAMILY_YEARLY",
    tier: "elite_family",
    name: "Elite Family",
    displayName: "Viora Elite Family",
    badge: "Flagship",
    description: "Premium AI wellness for families with up to 4 members and family-ready intelligence.",
    priceInr: 24999,
    billingCycle: "yearly",
    durationDays: 365,
    maxMembers: 4,
    popular: false,
    active: true,
    ctaLabel: "Choose Elite Family",
    featureSummary: ["Up to 4 members", "Family dashboard ready", "Voice AI ready", "Standard programs included"],
    features: features(["ai_coach_unlimited", "ai_memory_extended", "wellness_intelligence_pro", "nutrition_advanced", "mental_wellness_advanced", "smart_notifications", "health_reports", "voice_ai", "family_dashboard", "priority_ai", "program_discounts", "standard_programs_included"]),
  },
];

export const PROGRAM_ENTITLEMENTS: PremiumProgramEntitlement[] = [
  {
    programId: "yoga_30_day_transformation",
    title: "30-Day Yoga Transformation",
    category: "yoga",
    durationDays: 30,
    includedInPlanCodes: ["ELITE_FAMILY_YEARLY"],
    discountPercentByPlan: { PLUS_MONTHLY: 20, PLUS_YEARLY: 25, PRO_YEARLY: 40, ELITE_FAMILY_YEARLY: 100 },
  },
  {
    programId: "home_workout_beginner",
    title: "Home Workout Beginner",
    category: "home_workout",
    durationDays: 30,
    includedInPlanCodes: ["ELITE_FAMILY_YEARLY"],
    discountPercentByPlan: { PLUS_MONTHLY: 20, PLUS_YEARLY: 25, PRO_YEARLY: 40, ELITE_FAMILY_YEARLY: 100 },
  },
  {
    programId: "weight_loss_30_day",
    title: "30-Day Weight Loss Challenge",
    category: "weight_loss",
    durationDays: 30,
    includedInPlanCodes: ["ELITE_FAMILY_YEARLY"],
    discountPercentByPlan: { PLUS_MONTHLY: 20, PLUS_YEARLY: 25, PRO_YEARLY: 40, ELITE_FAMILY_YEARLY: 100 },
  },
];

export function getPlanByCode(code: PremiumPlanCode): PremiumPlan {
  return PREMIUM_PLANS.find((plan) => plan.code === code) || PREMIUM_PLANS[0];
}

export function getPremiumPlanByCode(code: PremiumPlanCode): PremiumPlan {
  return getPlanByCode(code);
}

export function isPremiumPlan(code: PremiumPlanCode) {
  return code !== "FREE";
}
