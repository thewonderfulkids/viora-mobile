import { CreatePaymentIntentInput, PaymentRecord, PremiumPlanCode } from "../../types/premium";

/**
 * Phase A payment safety: no client may create paid status or subscriptions.
 * Replace with authenticated backend checkout + verified provider webhook.
 */
export async function createPaymentIntent(_input: CreatePaymentIntentInput): Promise<PaymentRecord> {
  throw new Error("Secure checkout is not yet available. No payment was created.");
}

/** Disabled: client-side manual activation must never grant paid entitlements. */
export async function activateManualPaymentForTesting(_input: {
  userId: string;
  paymentId: string;
  planCode: PremiumPlanCode;
}): Promise<void> {
  throw new Error("Manual premium activation is disabled. Use a verified server-side grant.");
}
