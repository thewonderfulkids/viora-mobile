import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { HealthReportDoc, ReportExportRecord } from "../../types";
import { buildReportHtml } from "./reportService";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

async function printReportOnWeb(html: string): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Printing is not available on this device.");
  }
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;";
  frame.setAttribute("sandbox", "allow-same-origin allow-modals");
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => frame.remove();
    const timeout = window.setTimeout(() => { cleanup(); reject(new Error("Report preview timed out.")); }, 15000);
    frame.onload = async () => {
      window.clearTimeout(timeout);
      try {
        const target = frame.contentWindow;
        if (!target) throw new Error("Report preview is unavailable.");
        await frame.contentDocument?.fonts?.ready;
        target.addEventListener("afterprint", cleanup, { once: true });
        target.focus();
        target.print();
        resolve();
      } catch (error) { cleanup(); reject(error); }
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}

export async function createAndShareReportPdf(report: HealthReportDoc): Promise<string> {
  const html = buildReportHtml(report);
  const fileName = sanitizeFileName(`viora-${report.range}-report-${report.endDate}.pdf`);

  if (Platform.OS === "web") {
    await printReportOnWeb(html);
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
    await printReportOnWeb(record.htmlSnapshot);
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
