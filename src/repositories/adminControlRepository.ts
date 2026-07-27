import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { AdminAppConfig, AdminContentInput, AdminManagedContent, AdminStats, AdminUserSearchResult } from "../types";

const ADMIN_CONTENT_COLLECTION = "adminContent";
const DEFAULT_CONFIG: AdminAppConfig = {
  id: "global",
  betaMode: true,
  premiumBypassEnabled: true,
  appTourEnabled: true,
  musicEnabled: true,
  videoProgramsEnabled: true,
  maintenanceMode: false,
  maintenanceMessage: "Viora is getting a quick wellness tune-up. Please try again shortly.",
  minimumAppVersion: "1.0.1",
  latestApkVersion: "1.0.1-beta",
  supportEmail: "support@winflyindia.in",
  updatedAt: new Date().toISOString(),
};

function nowIso() {
  return new Date().toISOString();
}

function cleanText(value: unknown) {
  return String(value || "").trim();
}

function splitList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean);
  }

  return cleanText(value)
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toContent(id: string, data: any): AdminManagedContent {
  return {
    id,
    kind: data.kind || "program",
    title: cleanText(data.title) || "Untitled",
    subtitle: cleanText(data.subtitle),
    category: data.category || "general",
    level: data.level || "all",
    durationMinutes: Number(data.durationMinutes || 0),
    url: cleanText(data.url),
    thumbnailUrl: cleanText(data.thumbnailUrl),
    storagePath: cleanText(data.storagePath) || undefined,
    thumbnailStoragePath: cleanText(data.thumbnailStoragePath) || undefined,
    mediaFileName: cleanText(data.mediaFileName) || undefined,
    mediaContentType: cleanText(data.mediaContentType) || undefined,
    provider: data.provider || "none",
    mediaType: data.mediaType || (data.kind === "music" ? "audio" : data.kind === "video" ? "video" : "none"),
    mappingTargetType: data.mappingTargetType || undefined,
    targetId: cleanText(data.targetId) || undefined,
    parentTargetId: cleanText(data.parentTargetId) || undefined,
    mediaRole: data.mediaRole || undefined,
    playbackMode: data.playbackMode || undefined,
    caloriesEstimate: Number(data.caloriesEstimate || 0),
    equipment: splitList(data.equipment),
    instructor: cleanText(data.instructor),
    benefits: splitList(data.benefits),
    steps: splitList(data.steps),
    isPremium: Boolean(data.isPremium),
    isActive: data.isActive !== false,
    sortOrder: Number(data.sortOrder || 100),
    createdAt: cleanText(data.createdAt),
    updatedAt: cleanText(data.updatedAt),
  };
}

function toConfig(data: any): AdminAppConfig {
  return {
    ...DEFAULT_CONFIG,
    ...data,
    id: "global",
    updatedAt: cleanText(data?.updatedAt) || DEFAULT_CONFIG.updatedAt,
  };
}

function toUser(id: string, data: any): AdminUserSearchResult {
  return {
    uid: cleanText(data.uid) || id,
    email: cleanText(data.email),
    fullName: cleanText(data.fullName || data.name) || "Viora User",
    mobile: data.mobile ? cleanText(data.mobile) : undefined,
    isDisabled: data.isDisabled === true,
    currentPlan: data.planCode || data.plan || data.currentPlan,
  };
}

export async function getAdminStats(): Promise<AdminStats> {
  const [users, subscriptions, betaFeedback, clientErrorLogs, content] = await Promise.all([
    getCountFromServer(collection(db, COLLECTIONS.users)),
    getCountFromServer(collection(db, COLLECTIONS.subscriptions)),
    getCountFromServer(collection(db, COLLECTIONS.betaFeedback)),
    getCountFromServer(collection(db, COLLECTIONS.clientErrorLogs)),
    getCountFromServer(query(collection(db, ADMIN_CONTENT_COLLECTION), where("isActive", "==", true))),
  ]);

  return {
    users: users.data().count,
    subscriptions: subscriptions.data().count,
    betaFeedback: betaFeedback.data().count,
    clientErrorLogs: clientErrorLogs.data().count,
    activeMedia: content.data().count,
  };
}

export async function getAdminAppConfig(): Promise<AdminAppConfig> {
  const snapshot = await getDocs(query(collection(db, COLLECTIONS.appSettings), where("id", "==", "global"), limit(1)));
  const item = snapshot.docs[0];
  if (!item) return DEFAULT_CONFIG;
  return toConfig(item.data());
}

export async function saveAdminAppConfig(config: AdminAppConfig): Promise<AdminAppConfig> {
  const updated: AdminAppConfig = { ...config, id: "global", updatedAt: nowIso() };
  await setDoc(doc(db, COLLECTIONS.appSettings, "global"), { ...updated, serverUpdatedAt: serverTimestamp() }, { merge: true });
  return updated;
}

export async function listAdminContent(): Promise<AdminManagedContent[]> {
  const snapshot = await getDocs(collection(db, ADMIN_CONTENT_COLLECTION));
  return snapshot.docs
    .map((item) => toContent(item.id, item.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export async function listActiveProgramContent(): Promise<AdminManagedContent[]> {
  const snapshot = await getDocs(query(collection(db, ADMIN_CONTENT_COLLECTION), where("isActive", "==", true)));
  return snapshot.docs
    .map((item) => toContent(item.id, item.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
}

export async function saveAdminContent(input: AdminContentInput): Promise<AdminManagedContent> {
  const id = input.id || `${input.kind}_${input.category}_${Date.now()}`;
  const previousCreatedAt = input.id ? undefined : nowIso();
  const payload = {
    kind: input.kind,
    title: cleanText(input.title),
    subtitle: cleanText(input.subtitle),
    category: input.category,
    level: input.level,
    durationMinutes: Number(input.durationMinutes || 0),
    url: cleanText(input.url),
    thumbnailUrl: cleanText(input.thumbnailUrl),
    storagePath: cleanText(input.storagePath),
    thumbnailStoragePath: cleanText(input.thumbnailStoragePath),
    mediaFileName: cleanText(input.mediaFileName),
    mediaContentType: cleanText(input.mediaContentType),
    provider: input.provider,
    mediaType: input.mediaType || (input.kind === "music" ? "audio" : input.kind === "video" ? "video" : "none"),
    mappingTargetType: input.mappingTargetType || null,
    targetId: cleanText(input.targetId),
    parentTargetId: cleanText(input.parentTargetId),
    mediaRole: input.mediaRole || null,
    playbackMode: input.playbackMode || (input.mediaRole === "exercise_video" ? "step_by_step" : "full_session"),
    caloriesEstimate: Number(input.caloriesEstimate || 0),
    equipment: splitList(input.equipment),
    instructor: cleanText(input.instructor),
    benefits: splitList(input.benefits),
    steps: splitList(input.steps),
    isPremium: Boolean(input.isPremium),
    isActive: input.isActive !== false,
    sortOrder: Number(input.sortOrder || 100),
    updatedAt: nowIso(),
    ...(previousCreatedAt ? { createdAt: previousCreatedAt } : {}),
    serverUpdatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, ADMIN_CONTENT_COLLECTION, id), payload, { merge: true });
  return toContent(id, payload);
}

export async function setAdminContentActive(id: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, ADMIN_CONTENT_COLLECTION, id), {
    isActive,
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function searchAdminUsersByEmailOrMobile(term: string): Promise<AdminUserSearchResult[]> {
  const value = cleanText(term).toLowerCase();
  if (!value) return [];

  const usersRef = collection(db, COLLECTIONS.users);
  const queries = value.includes("@")
    ? [query(usersRef, where("email", "==", value), limit(10))]
    : [query(usersRef, where("mobile", "==", value), limit(10))];

  const snapshots = await Promise.all(queries.map((item) => getDocs(item)));
  const users = snapshots.flatMap((snapshot) => snapshot.docs.map((item) => toUser(item.id, item.data())));
  return Array.from(new Map(users.map((item) => [item.uid, item])).values());
}

export async function updateAdminUserStatus(uid: string, isDisabled: boolean): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.users, uid), {
    isDisabled,
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  }, { merge: true });
}
