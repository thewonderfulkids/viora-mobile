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
import { HealthReportDoc, ReportExportRecord } from "../types";

function nowIso() {
  return new Date().toISOString();
}

function createId(collectionName: string) {
  return doc(collection(db, collectionName)).id;
}

function toReport(id: string, data: any): HealthReportDoc {
  return {
    id,
    userId: String(data.userId || ""),
    range: data.range || "daily",
    category: data.category || "wellness",
    title: String(data.title || "Wellness Report"),
    subtitle: String(data.subtitle || ""),
    score: Number(data.score || 0),
    startDate: String(data.startDate || ""),
    endDate: String(data.endDate || ""),
    aiSummary: String(data.aiSummary || ""),
    highlights: Array.isArray(data.highlights) ? data.highlights.map(String) : [],
    risks: Array.isArray(data.risks) ? data.risks.map(String) : [],
    sections: Array.isArray(data.sections) ? data.sections : [],
    generatedAt: String(data.generatedAt || nowIso()),
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
    isDeleted: data.isDeleted === true,
    premiumOnly: data.premiumOnly === true,
    minimumPlanCode: data.minimumPlanCode || "FREE",
  };
}

function toExport(id: string, data: any): ReportExportRecord {
  return {
    id,
    userId: String(data.userId || ""),
    reportId: String(data.reportId || ""),
    reportTitle: String(data.reportTitle || "Wellness Report"),
    range: data.range || "daily",
    status: data.status || "ready",
    format: "pdf",
    fileName: String(data.fileName || "viora-report.pdf"),
    htmlSnapshot: String(data.htmlSnapshot || ""),
    createdAt: String(data.createdAt || nowIso()),
    updatedAt: String(data.updatedAt || nowIso()),
  };
}

export async function getReportsByUser(userId: string, maxResults = 20): Promise<HealthReportDoc[]> {
  if (!userId) return [];

  const reportQuery = query(
    collection(db, COLLECTIONS.wellnessReports),
    where("userId", "==", userId),
    where("isDeleted", "==", false),
    orderBy("generatedAt", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 80))
  );

  const snapshot = await getDocs(reportQuery);
  return snapshot.docs.map((item) => toReport(item.id, item.data()));
}

export async function saveHealthReport(report: HealthReportDoc): Promise<HealthReportDoc> {
  const id = report.id || createId(COLLECTIONS.wellnessReports);
  const payload: HealthReportDoc = {
    ...report,
    id,
    updatedAt: nowIso(),
  };

  await setDoc(doc(db, COLLECTIONS.wellnessReports, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function getReportExportsByUser(userId: string, maxResults = 20): Promise<ReportExportRecord[]> {
  if (!userId) return [];

  const exportQuery = query(
    collection(db, COLLECTIONS.reportExports),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(Math.min(Math.max(maxResults, 1), 60))
  );

  const snapshot = await getDocs(exportQuery);
  return snapshot.docs.map((item) => toExport(item.id, item.data()));
}

export async function saveReportExport(input: Omit<ReportExportRecord, "id" | "createdAt" | "updatedAt">): Promise<ReportExportRecord> {
  if (!input.userId) throw new Error("User is required to export report.");

  const timestamp = nowIso();
  const id = createId(COLLECTIONS.reportExports);
  const payload: ReportExportRecord = {
    ...input,
    id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(doc(db, COLLECTIONS.reportExports, id), {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}
