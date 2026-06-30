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
import { PremiumFeatureKey, PremiumPlanCode, PremiumPlanTier, UserSubscription } from "../types/premium";

function nowIso() {
  return new Date().toISOString();
}

function createId(collectionName: string) {
  return doc(collection(db, collectionName)).id;
}

function toSubscription(id: string, data: any): UserSubscription {
  return {
    id,
    userId: String(data.userId || ""),
    planCode: (data.planCode || "FREE") as PremiumPlanCode,
    tier: (data.tier || "free") as PremiumPlanTier,
    status: data.status || "free",
    provider: data.provider || "manual",
    startedAt: data.startedAt || null,
    currentPeriodStart: data.currentPeriodStart || null,
    currentPeriodEnd: data.currentPeriodEnd || null,
    renewalDate: data.renewalDate || null,
    cancelledAt: data.cancelledAt || null,
    expiresAt: data.expiresAt || null,
    maxMembers: Number(data.maxMembers || 1),
    familyOwnerUserId: data.familyOwnerUserId || null,
    invoiceOwnerUserId: String(data.invoiceOwnerUserId || data.userId || ""),
    entitlements: Array.isArray(data.entitlements) ? data.entitlements : [],
    purchasedProgramIds: Array.isArray(data.purchasedProgramIds) ? data.purchasedProgramIds : [],
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
  };
}

export function buildFreeSubscription(userId: string): UserSubscription {
  const timestamp = nowIso();

  return {
    id: `${userId}_free`,
    userId,
    planCode: "FREE",
    tier: "free",
    status: "free",
    provider: "manual",
    startedAt: timestamp,
    currentPeriodStart: timestamp,
    currentPeriodEnd: null,
    renewalDate: null,
    cancelledAt: null,
    expiresAt: null,
    maxMembers: 1,
    familyOwnerUserId: null,
    invoiceOwnerUserId: userId,
    entitlements: [],
    purchasedProgramIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function getActiveSubscriptionByUser(userId: string): Promise<UserSubscription | null> {
  if (!userId) return null;

  const subscriptionsQuery = query(
    collection(db, COLLECTIONS.subscriptions),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(subscriptionsQuery);
  const item = snapshot.docs[0];
  return item ? toSubscription(item.id, item.data()) : null;
}

export async function upsertSubscription(input: {
  userId: string;
  planCode: PremiumPlanCode;
  tier: PremiumPlanTier;
  status: UserSubscription["status"];
  provider: UserSubscription["provider"];
  durationDays: number | null;
  maxMembers: number;
  entitlements: PremiumFeatureKey[];
}): Promise<UserSubscription> {
  const timestamp = nowIso();
  const id = createId(COLLECTIONS.subscriptions);
  const periodEnd = input.durationDays ? new Date(Date.now() + input.durationDays * 24 * 60 * 60 * 1000).toISOString() : null;

  const payload: UserSubscription = {
    id,
    userId: input.userId,
    planCode: input.planCode,
    tier: input.tier,
    status: input.status,
    provider: input.provider,
    startedAt: timestamp,
    currentPeriodStart: timestamp,
    currentPeriodEnd: periodEnd,
    renewalDate: periodEnd,
    cancelledAt: null,
    expiresAt: periodEnd,
    maxMembers: input.maxMembers,
    familyOwnerUserId: input.tier === "elite_family" ? input.userId : null,
    invoiceOwnerUserId: input.userId,
    entitlements: input.entitlements,
    purchasedProgramIds: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(doc(db, COLLECTIONS.subscriptions, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const timestamp = nowIso();

  await updateDoc(doc(db, COLLECTIONS.subscriptions, subscriptionId), {
    status: "cancelled",
    cancelledAt: timestamp,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
}
