import { jsPDF } from "jspdf";
import { loadImageFromUrl } from "./tabCapture.capture";
import { TAB_CAPTURE_A4_MM, TAB_CAPTURE_MARGIN_MM } from "./tabCapture.constants";
import { contentWidthMm, layoutSlicesForPdf, pdfFilename } from "./tabCapture.geometry";
import type { CaptureSlice } from "./tabCapture.types";

export async function exportTabCapturePdf(
  title: string,
  slices: CaptureSlice[],
  sourceUrl = "",
): Promise<void> {
  if (slices.length === 0) {
    throw new Error("Add at least one capture before downloading.");
  }

  const placed = layoutSlicesForPdf(slices);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const safeTitle = title.trim() || "Untitled tablature";
  const centerX = TAB_CAPTURE_A4_MM.width / 2;
  const url = sourceUrl.trim();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text(safeTitle, centerX, TAB_CAPTURE_MARGIN_MM + 6, { align: "center" });

  if (url) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90);
    const lines = doc.splitTextToSize(url, contentWidthMm());
    doc.text(lines, centerX, TAB_CAPTURE_MARGIN_MM + 12, { align: "center" });
  }

  doc.setTextColor(0);

  let currentPage = 0;
  for (const item of placed) {
    while (item.page > currentPage) {
      doc.addPage();
      currentPage += 1;
    }
    const img = await loadImageFromUrl(item.objectUrl);
    doc.addImage(img, "PNG", item.xMm, item.yMm, item.wMm, item.hMm);
  }

  doc.save(pdfFilename(safeTitle));
}
