import { jsPDF } from "jspdf";
import { loadImageFromUrl } from "./tabCapture.capture";
import { TAB_CAPTURE_MARGIN_MM } from "./tabCapture.constants";
import { layoutSlicesForPdf, pdfFilename } from "./tabCapture.geometry";
import type { CaptureSlice } from "./tabCapture.types";

export async function exportTabCapturePdf(title: string, slices: CaptureSlice[]): Promise<void> {
  if (slices.length === 0) {
    throw new Error("Add at least one capture before downloading.");
  }

  const placed = layoutSlicesForPdf(slices);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const safeTitle = title.trim() || "Untitled tablature";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(safeTitle, TAB_CAPTURE_MARGIN_MM, TAB_CAPTURE_MARGIN_MM + 6);

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
