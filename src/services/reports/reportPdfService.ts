import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { HealthReportDoc, ReportExportRecord } from "../../types";
import { buildReportHtml } from "./reportService";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function downloadHtmlSnapshotOnWeb(fileName: string, html: string): string | false {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  const snapshotName = sanitizeFileName(fileName).replace(/\.(pdf|html)$/i, "") + ".html";
  anchor.download = snapshotName;
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return snapshotName;
}

export async function createAndShareReportPdf(report: HealthReportDoc): Promise<string> {
  const html = buildReportHtml(report);
  const fileName = sanitizeFileName(`viora-${report.range}-report-${report.endDate}.pdf`);

  if (Platform.OS === "web") {
    const downloaded = downloadHtmlSnapshotOnWeb(fileName, html);
    if (!downloaded) throw new Error("Report download is not available on this device.");
    return downloaded;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error("Sharing is not available on this device.");

  const pdf = await Print.printToFileAsync({
    html,
    base64: false,
  });

  await Sharing.shareAsync(pdf.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Save or share your Viora report",
    UTI: "com.adobe.pdf",
  });

  return pdf.uri;
}

export async function shareSavedReportExport(record: ReportExportRecord): Promise<void> {
  if (!record.htmlSnapshot) {
    throw new Error("This saved report does not have a printable snapshot yet.");
  }

  if (Platform.OS === "web") {
    const downloaded = downloadHtmlSnapshotOnWeb(record.fileName, record.htmlSnapshot);
    if (!downloaded) throw new Error("Report download is not available on this device.");
    return;
  }

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error("Sharing is not available on this device.");

  const pdf = await Print.printToFileAsync({
    html: record.htmlSnapshot,
    base64: false,
  });

  await Sharing.shareAsync(pdf.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Save or share your Viora report",
    UTI: "com.adobe.pdf",
  });
}
