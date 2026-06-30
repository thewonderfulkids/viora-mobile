import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { PaymentRecord, PaymentStatus, PremiumPlanCode, PaymentProvider } from "../types/premium";

function nowIso() {
  return new Date().toISOString();
}

function createId(collectionName: string) {
  return doc(collection(db, collectionName)).id;
}

function toPayment(id: string, data: any): PaymentRecord {
  return {
    id,
    userId: String(data.userId || ""),
    subscriptionId: data.subscriptionId || null,
    planCode: (data.planCode || "FREE") as PremiumPlanCode,
    provider: (data.provider || "manual") as PaymentProvider,
    status: (data.status || "created") as PaymentStatus,
    amountInr: Number(data.amountInr || 0),
    currency: "INR",
    providerOrderId: data.providerOrderId || null,
    providerPaymentId: data.providerPaymentId || null,
    providerSignature: data.providerSignature || null,
    invoiceNumber: data.invoiceNumber || null,
    invoiceOwnerUserId: String(data.invoiceOwnerUserId || data.userId || ""),
    failureReason: data.failureReason || null,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    paidAt: data.paidAt || null,
  };
}

export async function getPaymentsByUser(userId: string, maxResults = 20): Promise<PaymentRecord[]> {
  if (!userId) return [];

  const paymentsQuery = query(
    collection(db, COLLECTIONS.payments),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 50))
  );

  const snapshot = await getDocs(paymentsQuery);
  return snapshot.docs.map((item) => toPayment(item.id, item.data()));
}

export async function createPaymentRecord(input: {
  userId: string;
  planCode: PremiumPlanCode;
  provider: PaymentProvider;
  amountInr: number;
}): Promise<PaymentRecord> {
  const timestamp = nowIso();
  const id = createId(COLLECTIONS.payments);

  const payload: PaymentRecord = {
    id,
    userId: input.userId,
    subscriptionId: null,
    planCode: input.planCode,
    provider: input.provider,
    status: "pending",
    amountInr: input.amountInr,
    currency: "INR",
    providerOrderId: null,
    providerPaymentId: null,
    providerSignature: null,
    invoiceNumber: null,
    invoiceOwnerUserId: input.userId,
    failureReason: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    paidAt: null,
  };

  await setDoc(doc(db, COLLECTIONS.payments, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function markPaymentStatus(paymentId: string, status: PaymentStatus, subscriptionId?: string): Promise<void> {
  const timestamp = nowIso();

  await updateDoc(doc(db, COLLECTIONS.payments, paymentId), {
    status,
    subscriptionId: subscriptionId || null,
    paidAt: status === "paid" ? timestamp : null,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
}
