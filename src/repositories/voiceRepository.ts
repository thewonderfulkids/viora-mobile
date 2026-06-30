import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { VoiceCommandRecord } from "../types";

function nowIso() {
  return new Date().toISOString();
}

function createId(collectionName: string) {
  return doc(collection(db, collectionName)).id;
}

function toVoiceCommandRecord(id: string, data: any): VoiceCommandRecord {
  return {
    id,
    userId: String(data.userId || ""),
    transcript: String(data.transcript || data.rawTranscript || ""),
    rawTranscript: String(data.rawTranscript || data.transcript || ""),
    provider: data.provider || "manual",
    intent: data.intent || {
      type: "unknown",
      confidence: 0,
      language: "en",
      entities: {},
    },
    status: data.status || "ready",
    title: String(data.title || "Voice command"),
    message: String(data.message || ""),
    spokenResponse: String(data.spokenResponse || ""),
    targetRoute: data.targetRoute,
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
  };
}

export async function getVoiceCommandsByUser(userId: string, maxResults = 20): Promise<VoiceCommandRecord[]> {
  if (!userId) return [];

  const voiceQuery = query(
    collection(db, COLLECTIONS.voiceCommands),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 50))
  );

  const snapshot = await getDocs(voiceQuery);
  return snapshot.docs.map((item) => toVoiceCommandRecord(item.id, item.data()));
}

export async function saveVoiceCommand(
  input: Omit<VoiceCommandRecord, "id" | "createdAt" | "updatedAt" | "isDeleted">
): Promise<VoiceCommandRecord> {
  if (!input.userId) throw new Error("User is required to save voice command.");

  const timestamp = nowIso();
  const id = createId(COLLECTIONS.voiceCommands);
  const payload: VoiceCommandRecord = {
    ...input,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };

  await setDoc(doc(db, COLLECTIONS.voiceCommands, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}
