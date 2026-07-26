import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { HealthReportDoc, ReportExportRecord } from "../../types";
import { buildReportHtml } from "./reportService";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function downloadHtmlSnapshotOnWeb(fileName: string, html: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return false;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName.replace(/\.pdf$/i, ".html");
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return true;
}

export async function createAndShareReportPdf(report: HealthReportDoc): Promise<string> {
  const html = buildReportHtml(report);
  const fileName = sanitizeFileName(`viora-${report.range}-report-${report.endDate}.pdf`);

  if (Platform.OS === "web") {
    const downloaded = downloadHtmlSnapshotOnWeb(fileName, html);
    if (!downloaded) throw new Error("Report download is not available on this device.");
    return fileName;
  }

  const pdf = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Sharing is not available on this device. The report was created but could not be opened.");
  }

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

  const pdf = await Print.printToFileAsync({
    html: record.htmlSnapshot,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error("Sharing is not available on this device.");

  await Sharing.shareAsync(pdf.uri, {
    mimeType: "application/pdf",
    dialogTitle: "Save or share your Viora report",
    UTI: "com.adobe.pdf",
  });
}
