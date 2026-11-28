import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { HealthReportDoc, ReportExportRecord } from "../../types";
import { buildReportHtml } from "./reportService";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

export function printReportOnWeb(html: string): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") throw new Error("Printing is not available on this device.");
  return new Promise<void>((resolve, reject) => {
  const frame = document.createElement("iframe");
  const cleanup = () => { window.clearTimeout(timeout); frame.remove(); };
  const timeout = window.setTimeout(() => { cleanup(); reject(new Error("Report print preview timed out.")); }, 30000);
  frame.setAttribute("sandbox", "allow-same-origin allow-modals");
  frame.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0";
  frame.title = "Printable Viora report";
  frame.onload = () => {
    const target = frame.contentWindow;
    if (!target) { cleanup(); reject(new Error("Report print preview is unavailable.")); return; }
    window.clearTimeout(timeout);
    target.addEventListener("afterprint", cleanup, { once: true });
    try { target.focus(); target.print(); resolve(); } catch (error) { cleanup(); reject(error); }
  };
  frame.srcdoc = html;
  document.body.appendChild(frame);
  });
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

export async function createAndShareReportPdf(report: HealthReportDoc, webPrint = false): Promise<string> {
  const html = buildReportHtml(report);
  const fileName = sanitizeFileName(`viora-${report.range}-report-${report.endDate}.pdf`);

  if (Platform.OS === "web") {
    if (webPrint) { await printReportOnWeb(html); return "print-dialog"; }
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
    await printReportOnWeb(record.htmlSnapshot);
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
