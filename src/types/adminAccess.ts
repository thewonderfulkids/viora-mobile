import { PremiumPlanCode } from "./premium";

export type AdminAccessUser = {
  uid: string;
  fullName: string;
  email: string;
  mobile?: string;
  currentPlan?: string;
  subscriptionStatus?: string;
};

export type AdminAccessGrantInput = {
  adminUserId: string;
  adminEmail: string;
  targetUserId: string;
  targetEmail: string;
  targetName: string;
  planCode: PremiumPlanCode;
  expiresAt?: string | null;
  note?: string;
};

export type AdminAccessGrantResult = {
  subscriptionId: string;
  planCode: PremiumPlanCode;
  expiresAt: string | null;
};
