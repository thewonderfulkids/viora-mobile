import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import {
    AI_MEMORY_COLLECTION,
    CONVERSATION_SUMMARIES_COLLECTION,
    USER_WELLNESS_PROFILES_COLLECTION,
} from "../../firebase/firestoreCollections";
import {
    AIMemoryRecord,
    ConversationSummary,
    CreateConversationSummaryInput,
    CreateMemoryInput,
    UpsertWellnessProfileInput,
    UserWellnessProfile,
} from "../../types/aiMemory";
import { calculateReinforcedConfidence } from "./memoryScoring";

function nowIso() {
  return new Date().toISOString();
}

function normalizeConfidence(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0.7;
  return Math.min(1, Math.max(0, value));
}

function cleanTags(tags?: string[]) {
  if (!Array.isArray(tags)) return [];

  return tags
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 12);
}

function toMemoryRecord(id: string, data: any): AIMemoryRecord {
  return {
    id,
    userId: String(data.userId || ""),
    category: data.category,
    source: data.source,
    title: String(data.title || ""),
    summary: String(data.summary || ""),
    importance: data.importance || "medium",
    confidence:
      typeof data.confidence === "number" ? data.confidence : 0.7,
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    lastUsedAt: data.lastUsedAt ? String(data.lastUsedAt) : null,
    lastMentionedAt: data.lastMentionedAt
      ? String(data.lastMentionedAt)
      : null,
    expiresAt: data.expiresAt ? String(data.expiresAt) : null,
    usageCount:
      typeof data.usageCount === "number" ? data.usageCount : 0,
    occurrenceCount:
      typeof data.occurrenceCount === "number" ? data.occurrenceCount : 1,
    isActive: data.isActive !== false,
    isPinned: data.isPinned === true,
    isArchived: data.isArchived === true,
  };
}

function toConversationSummary(id: string, data: any): ConversationSummary {
  return {
    id,
    userId: String(data.userId || ""),
    conversationId: String(data.conversationId || ""),
    summary: String(data.summary || ""),
    keyTopics: Array.isArray(data.keyTopics) ? data.keyTopics : [],
    extractedMemories: Array.isArray(data.extractedMemories)
      ? data.extractedMemories
      : [],
    moodSignal: data.moodSignal ? String(data.moodSignal) : null,
    riskSignal: data.riskSignal ? String(data.riskSignal) : null,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
  };
}

function toWellnessProfile(
  userId: string,
  data: any
): UserWellnessProfile {
  return {
    userId,
    displayName: String(data.displayName || ""),
    primaryGoal: data.primaryGoal ? String(data.primaryGoal) : null,
    stressLevel: data.stressLevel ? String(data.stressLevel) : null,
    preferredLanguage: String(data.preferredLanguage || "en"),
    hydrationGoalMl:
      typeof data.hydrationGoalMl === "number"
        ? data.hydrationGoalMl
        : null,
    sleepGoalHours:
      typeof data.sleepGoalHours === "number"
        ? data.sleepGoalHours
        : null,
    yogaGoalMinutes:
      typeof data.yogaGoalMinutes === "number"
        ? data.yogaGoalMinutes
        : null,
    musicPreference: data.musicPreference
      ? String(data.musicPreference)
      : null,
    lastMemoryUpdatedAt: data.lastMemoryUpdatedAt
      ? String(data.lastMemoryUpdatedAt)
      : null,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
  };
}

export async function createAIMemory(
  input: CreateMemoryInput
): Promise<AIMemoryRecord> {
  const timestamp = nowIso();

  const payload = {
    userId: input.userId,
    category: input.category,
    source: input.source,
    title: input.title.trim(),
    summary: input.summary.trim(),
    importance: input.importance ?? "medium",
    confidence: normalizeConfidence(input.confidence),
    tags: cleanTags(input.tags),
    createdAt: timestamp,
    updatedAt: timestamp,
    lastUsedAt: null,
    lastMentionedAt: timestamp,
    expiresAt: null,
    usageCount: 0,
    occurrenceCount: 1,
    isActive: true,
    isPinned: false,
    isArchived: false,
    serverCreatedAt: serverTimestamp(),
    serverUpdatedAt: serverTimestamp(),
  };

  if (!payload.userId) {
    throw new Error("User is required to create AI memory.");
  }

  if (!payload.title || !payload.summary) {
    throw new Error("Memory title and summary are required.");
  }

  const ref = await addDoc(collection(db, AI_MEMORY_COLLECTION), payload);

  return toMemoryRecord(ref.id, payload);
}

export async function getActiveAIMemories(
  userId: string,
  maxResults = 12
): Promise<AIMemoryRecord[]> {
  if (!userId) return [];

  const safeLimit = Math.min(Math.max(maxResults, 1), 30);

  const q = query(
    collection(db, AI_MEMORY_COLLECTION),
    where("userId", "==", userId),
    where("isActive", "==", true),
    where("isArchived", "==", false),
    orderBy("updatedAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) =>
    toMemoryRecord(item.id, item.data())
  );
}

export async function markMemoryUsed(memoryId: string) {
  if (!memoryId) return;

  const ref = doc(db, AI_MEMORY_COLLECTION, memoryId);

  await updateDoc(ref, {
    lastUsedAt: nowIso(),
    serverUpdatedAt: serverTimestamp(),
  });
}

export async function createConversationSummary(
  input: CreateConversationSummaryInput
): Promise<ConversationSummary> {
  const timestamp = nowIso();

  const payload = {
    userId: input.userId,
    conversationId: input.conversationId,
    summary: input.summary.trim(),
    keyTopics: input.keyTopics ?? [],
    extractedMemories: input.extractedMemories ?? [],
    moodSignal: input.moodSignal ?? null,
    riskSignal: input.riskSignal ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
    serverCreatedAt: serverTimestamp(),
    serverUpdatedAt: serverTimestamp(),
  };

  if (!payload.userId || !payload.conversationId) {
    throw new Error("User and conversation are required.");
  }

  if (!payload.summary) {
    throw new Error("Conversation summary is required.");
  }

  const ref = await addDoc(
    collection(db, CONVERSATION_SUMMARIES_COLLECTION),
    payload
  );

  return toConversationSummary(ref.id, payload);
}

export async function getLatestConversationSummaries(
  userId: string,
  maxResults = 5
): Promise<ConversationSummary[]> {
  if (!userId) return [];

  const safeLimit = Math.min(Math.max(maxResults, 1), 10);

  const q = query(
    collection(db, CONVERSATION_SUMMARIES_COLLECTION),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) =>
    toConversationSummary(item.id, item.data())
  );
}

export async function getWellnessProfile(
  userId: string
): Promise<UserWellnessProfile | null> {
  if (!userId) return null;

  const ref = doc(db, USER_WELLNESS_PROFILES_COLLECTION, userId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return toWellnessProfile(userId, snapshot.data());
}

export async function upsertWellnessProfile(
  input: UpsertWellnessProfileInput
): Promise<UserWellnessProfile> {
  if (!input.userId) {
    throw new Error("User is required to update wellness profile.");
  }

  const existing = await getWellnessProfile(input.userId);
  const timestamp = nowIso();

  const payload = {
    displayName: input.displayName ?? existing?.displayName ?? "",
    primaryGoal: input.primaryGoal ?? existing?.primaryGoal ?? null,
    stressLevel: input.stressLevel ?? existing?.stressLevel ?? null,
    preferredLanguage:
      input.preferredLanguage ?? existing?.preferredLanguage ?? "en",
    hydrationGoalMl:
      input.hydrationGoalMl ?? existing?.hydrationGoalMl ?? null,
    sleepGoalHours:
      input.sleepGoalHours ?? existing?.sleepGoalHours ?? null,
    yogaGoalMinutes:
      input.yogaGoalMinutes ?? existing?.yogaGoalMinutes ?? null,
    musicPreference:
      input.musicPreference ?? existing?.musicPreference ?? null,
    lastMemoryUpdatedAt: timestamp,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    serverUpdatedAt: serverTimestamp(),
  };

  await setDoc(
    doc(db, USER_WELLNESS_PROFILES_COLLECTION, input.userId),
    payload,
    { merge: true }
  );

  return toWellnessProfile(input.userId, payload);
}

export async function findExistingMemory({
  userId,
  category,
  title,
}: {
  userId: string;
  category: string;
  title: string;
}): Promise<AIMemoryRecord | null> {
  const q = query(
    collection(db, AI_MEMORY_COLLECTION),
    where("userId", "==", userId),
    where("category", "==", category),
    where("title", "==", title),
    where("isArchived", "==", false),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const item = snapshot.docs[0];

  return toMemoryRecord(item.id, item.data());
}

export async function reinforceMemory({
  memoryId,
  currentConfidence,
  occurrenceCount,
}: {
  memoryId: string;
  currentConfidence: number;
  occurrenceCount: number;
}) {
  const ref = doc(db, AI_MEMORY_COLLECTION, memoryId);

  await updateDoc(ref, {
    confidence: calculateReinforcedConfidence(
      currentConfidence,
      occurrenceCount
    ),
    occurrenceCount: increment(1),
    lastMentionedAt: serverTimestamp(),
    serverUpdatedAt: serverTimestamp(),
    updatedAt: nowIso(),
  });
}