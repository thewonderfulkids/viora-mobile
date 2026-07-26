import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, where } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { AdminAccessGrantResult, AdminAccessUser, UserSubscription } from "../types";

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

function toAdminAccessUser(id: string, data: any): AdminAccessUser {
  return {
    uid: String(data.uid || id),
    fullName: String(data.fullName || data.name || "Viora User"),
    email: String(data.email || ""),
    mobile: data.mobile ? String(data.mobile) : undefined,
    currentPlan: data.plan ? String(data.plan) : undefined,
    subscriptionStatus: data.subscriptionStatus ? String(data.subscriptionStatus) : undefined,
  };
}

export async function findAdminAccessUserByEmail(email: string): Promise<AdminAccessUser | null> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  const usersQuery = query(collection(db, COLLECTIONS.users), where("email", "==", normalizedEmail), limit(1));
  const snapshot = await getDocs(usersQuery);
  const item = snapshot.docs[0];

  return item ? toAdminAccessUser(item.id, item.data()) : null;
}

export async function setAdminSubscriptionGrant(payload: UserSubscription & {
  source: "admin_access_grant";
  grantedByUserId: string;
  grantedByEmail: string;
  targetEmail: string;
  targetName: string;
  note: string;
}): Promise<AdminAccessGrantResult> {
  await setDoc(doc(db, COLLECTIONS.subscriptions, payload.id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  }, { merge: true });

  return {
    subscriptionId: payload.id,
    planCode: payload.planCode,
    expiresAt: payload.expiresAt,
  };
}
