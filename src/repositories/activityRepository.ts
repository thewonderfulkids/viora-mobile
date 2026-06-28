import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { ACTIVITIES_COLLECTION } from "../firebase/firestoreCollections";
import {
    CreateActivityInput,
    WellnessActivity,
} from "../types/activity";

function nowIso() {
  return new Date().toISOString();
}

function toActivity(id: string, data: any): WellnessActivity {
  return {
    id,
    userId: String(data.userId || ""),
    type: data.type,
    value: data.value ?? null,
    unit: data.unit || "none",
    source: data.source || "manual",
    note: data.note ? String(data.note) : null,
    metadata:
      data.metadata && typeof data.metadata === "object"
        ? data.metadata
        : {},
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

export async function createActivity(
  input: CreateActivityInput
): Promise<WellnessActivity> {
  if (!input.userId) {
    throw new Error("User is required to create activity.");
  }

  const timestamp = nowIso();

  const payload = {
    userId: input.userId,
    type: input.type,
    value: input.value ?? null,
    unit: input.unit ?? "none",
    source: input.source ?? "manual",
    note: input.note ?? null,
    metadata: input.metadata ?? {},
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
    serverCreatedAt: serverTimestamp(),
    serverUpdatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, ACTIVITIES_COLLECTION), payload);

  return toActivity(ref.id, payload);
}

export async function getRecentActivities({
  userId,
  maxResults = 50,
}: {
  userId: string;
  maxResults?: number;
}): Promise<WellnessActivity[]> {
  if (!userId) return [];

  const safeLimit = Math.min(Math.max(maxResults, 1), 100);

  const q = query(
    collection(db, ACTIVITIES_COLLECTION),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => toActivity(item.id, item.data()));
}