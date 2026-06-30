import { addDoc, collection, doc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { FamilyGroup, FamilyInviteInput, FamilyMember, FamilyPermissionKey } from "../types";

function nowIso() {
  return new Date().toISOString();
}

function inviteCode(userId: string) {
  return `VIORA-${userId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function defaultPermissions(role: FamilyMember["role"]): FamilyPermissionKey[] {
  if (role === "child") return ["view_dashboard", "manage_reminders"];
  if (role === "parent") return ["view_dashboard", "view_reports", "manage_reminders"];
  return ["view_dashboard", "view_reports", "view_mood", "view_nutrition", "manage_reminders"];
}

function toFamilyGroup(data: any): FamilyGroup {
  return {
    id: String(data?.id || ""),
    ownerUserId: String(data?.ownerUserId || ""),
    name: String(data?.name || "My Family"),
    planCode: data?.planCode || "FREE",
    maxMembers: Number(data?.maxMembers || 1),
    activeMemberCount: Number(data?.activeMemberCount || 1),
    inviteCode: String(data?.inviteCode || ""),
    createdAt: String(data?.createdAt || nowIso()),
    updatedAt: String(data?.updatedAt || nowIso()),
    isDeleted: Boolean(data?.isDeleted || false),
  };
}

function toFamilyMember(data: any): FamilyMember {
  return {
    id: String(data?.id || ""),
    familyId: String(data?.familyId || ""),
    ownerUserId: String(data?.ownerUserId || ""),
    userId: data?.userId || null,
    displayName: String(data?.displayName || "Family Member"),
    email: data?.email || null,
    phone: data?.phone || null,
    role: data?.role || "member",
    status: data?.status || "invited",
    avatarEmoji: String(data?.avatarEmoji || "💚"),
    relationLabel: String(data?.relationLabel || "Member"),
    permissions: Array.isArray(data?.permissions) ? data.permissions : defaultPermissions(data?.role || "member"),
    wellnessScore: Number(data?.wellnessScore || 0),
    hydrationStatus: data?.hydrationStatus || "good",
    sleepStatus: data?.sleepStatus || "good",
    moodStatus: data?.moodStatus || "steady",
    lastCheckInAt: data?.lastCheckInAt || null,
    inviteCode: data?.inviteCode || null,
    invitedAt: data?.invitedAt || null,
    joinedAt: data?.joinedAt || null,
    createdAt: String(data?.createdAt || nowIso()),
    updatedAt: String(data?.updatedAt || nowIso()),
    isDeleted: Boolean(data?.isDeleted || false),
  };
}

export async function getFamilyByOwner(userId: string): Promise<FamilyGroup | null> {
  const familyQuery = query(
    collection(db, COLLECTIONS.familyGroups),
    where("ownerUserId", "==", userId),
    where("isDeleted", "==", false),
    limit(1),
  );
  const snapshot = await getDocs(familyQuery);
  const item = snapshot.docs[0];
  return item ? toFamilyGroup({ id: item.id, ...item.data() }) : null;
}

export async function createDefaultFamily(userId: string, displayName: string, planCode: FamilyGroup["planCode"], maxMembers: number): Promise<FamilyGroup> {
  const timestamp = nowIso();
  const ref = doc(collection(db, COLLECTIONS.familyGroups));
  const family: FamilyGroup = {
    id: ref.id,
    ownerUserId: userId,
    name: `${displayName || "My"}'s Family`,
    planCode,
    maxMembers,
    activeMemberCount: 1,
    inviteCode: inviteCode(userId),
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  await setDoc(ref, { ...family, serverUpdatedAt: serverTimestamp() });

  const ownerRef = doc(collection(db, COLLECTIONS.familyMembers));
  const owner: FamilyMember = {
    id: ownerRef.id,
    familyId: family.id,
    ownerUserId: userId,
    userId,
    displayName: displayName || "You",
    email: null,
    phone: null,
    role: "owner",
    status: "active",
    avatarEmoji: "👤",
    relationLabel: "You",
    permissions: ["view_dashboard", "view_reports", "view_mood", "view_nutrition", "manage_reminders", "manage_profile"],
    wellnessScore: 78,
    hydrationStatus: "good",
    sleepStatus: "good",
    moodStatus: "steady",
    lastCheckInAt: timestamp,
    inviteCode: null,
    invitedAt: null,
    joinedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  await setDoc(ownerRef, { ...owner, serverUpdatedAt: serverTimestamp() });
  return family;
}

export async function updateFamilyPlan(familyId: string, planCode: FamilyGroup["planCode"], maxMembers: number, activeMemberCount: number): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.familyGroups, familyId), {
    planCode,
    maxMembers,
    activeMemberCount,
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function getFamilyMembers(familyId: string, ownerUserId: string): Promise<FamilyMember[]> {
  const membersQuery = query(
    collection(db, COLLECTIONS.familyMembers),
    where("familyId", "==", familyId),
    where("ownerUserId", "==", ownerUserId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "asc"),
  );
  const snapshot = await getDocs(membersQuery);
  return snapshot.docs.map((item) => toFamilyMember({ id: item.id, ...item.data() }));
}

export async function inviteFamilyMember(family: FamilyGroup, input: FamilyInviteInput): Promise<FamilyMember> {
  const timestamp = nowIso();
  const ref = doc(collection(db, COLLECTIONS.familyMembers));
  const member: FamilyMember = {
    id: ref.id,
    familyId: family.id,
    ownerUserId: family.ownerUserId,
    userId: null,
    displayName: input.displayName.trim(),
    email: input.email?.trim().toLowerCase() || null,
    phone: input.phone?.trim() || null,
    role: input.role,
    status: "invited",
    avatarEmoji: input.role === "child" ? "🧒" : input.role === "parent" ? "👴" : input.role === "spouse" ? "💚" : "👤",
    relationLabel: input.relationLabel?.trim() || input.role,
    permissions: input.permissions?.length ? input.permissions : defaultPermissions(input.role),
    wellnessScore: 0,
    hydrationStatus: "good",
    sleepStatus: "good",
    moodStatus: "steady",
    lastCheckInAt: null,
    inviteCode: family.inviteCode,
    invitedAt: timestamp,
    joinedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  await setDoc(ref, { ...member, serverUpdatedAt: serverTimestamp() });
  await updateDoc(doc(db, COLLECTIONS.familyGroups, family.id), {
    activeMemberCount: family.activeMemberCount + 1,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  });
  return member;
}

export async function pauseFamilyMember(memberId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.familyMembers, memberId), {
    status: "paused",
    updatedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}
