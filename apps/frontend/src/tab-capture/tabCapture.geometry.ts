import {
  TAB_CAPTURE_A4_MM,
  TAB_CAPTURE_GAP_MM,
  TAB_CAPTURE_MARGIN_MM,
  TAB_CAPTURE_MIN_CROP_PX,
  TAB_CAPTURE_MIN_WIDTH_PCT,
  TAB_CAPTURE_TITLE_BLOCK_MM,
} from "./tabCapture.constants";
import type { CaptureSlice, CssRect, PlacedSlice } from "./tabCapture.types";

export function normalizeDrawnRect(
  start: { x: number; y: number },
  end: { x: number; y: number },
  bounds: { w: number; h: number },
): CssRect {
  const x = Math.max(0, Math.min(start.x, end.x));
  const y = Math.max(0, Math.min(start.y, end.y));
  const x2 = Math.min(bounds.w, Math.max(start.x, end.x));
  const y2 = Math.min(bounds.h, Math.max(start.y, end.y));
  return { x, y, w: Math.max(0, x2 - x), h: Math.max(0, y2 - y) };
}

export function isCropLargeEnough(rect: CssRect | null): rect is CssRect {
  return !!rect && rect.w >= TAB_CAPTURE_MIN_CROP_PX && rect.h >= TAB_CAPTURE_MIN_CROP_PX;
}

export function tabCaptureLooksLikeViewport(
  videoWidth: number,
  videoHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): boolean {
  if (videoWidth <= 0 || videoHeight <= 0 || viewportWidth <= 0 || viewportHeight <= 0) {
    return false;
  }
  const videoAspect = videoWidth / videoHeight;
  const viewAspect = viewportWidth / viewportHeight;
  return Math.abs(videoAspect - viewAspect) / viewAspect < 0.12;
}

export function mapIframeCropToVideoFrame(args: {
  crop: CssRect;
  iframe: { left: number; top: number; width: number; height: number };
  viewportWidth: number;
  viewportHeight: number;
  videoWidth: number;
  videoHeight: number;
}): CssRect | null {
  const { crop, iframe, viewportWidth, viewportHeight, videoWidth, videoHeight } = args;
  if (viewportWidth <= 0 || viewportHeight <= 0 || videoWidth <= 0 || videoHeight <= 0) {
    return null;
  }
  if (!isCropLargeEnough(crop)) return null;

  const scaleX = videoWidth / viewportWidth;
  const scaleY = videoHeight / viewportHeight;
  const x = (iframe.left + crop.x) * scaleX;
  const y = (iframe.top + crop.y) * scaleY;
  const w = crop.w * scaleX;
  const h = crop.h * scaleY;

  const sx = Math.max(0, Math.min(videoWidth, x));
  const sy = Math.max(0, Math.min(videoHeight, y));
  const sw = Math.max(1, Math.min(videoWidth - sx, w));
  const sh = Math.max(1, Math.min(videoHeight - sy, h));
  if (sw < 2 || sh < 2) return null;
  return { x: sx, y: sy, w: sw, h: sh };
}

export function contentWidthMm(): number {
  return TAB_CAPTURE_A4_MM.width - TAB_CAPTURE_MARGIN_MM * 2;
}

export function clampWidthPct(widthPct: number): number {
  return Math.min(1, Math.max(TAB_CAPTURE_MIN_WIDTH_PCT, widthPct));
}

export function clampXPct(xPct: number): number {
  return Math.min(1, Math.max(0, xPct));
}

export function layoutSlicesForPdf(slices: CaptureSlice[]): PlacedSlice[] {
  const pageH = TAB_CAPTURE_A4_MM.height;
  const margin = TAB_CAPTURE_MARGIN_MM;
  const contentW = contentWidthMm();
  const placed: PlacedSlice[] = [];

  let page = 0;
  let cursorY = margin + TAB_CAPTURE_TITLE_BLOCK_MM;

  for (const slice of slices) {
    const widthPct = clampWidthPct(slice.widthPct);
    const wMm = contentW * widthPct;
    const aspect =
      slice.naturalWidth > 0 ? slice.naturalHeight / slice.naturalWidth : 9 / 16;
    let hMm = wMm * aspect;

    const bottom = pageH - margin;
    if (cursorY + hMm > bottom) {
      page += 1;
      cursorY = margin;
    }

    const pageMaxH = bottom - cursorY;
    hMm = Math.min(hMm, Math.max(8, pageMaxH));
    const extra = contentW - wMm;
    const xMm = margin + extra * clampXPct(slice.xPct);

    placed.push({
      id: slice.id,
      objectUrl: slice.objectUrl,
      page,
      xMm,
      yMm: cursorY,
      wMm,
      hMm,
    });
    cursorY += hMm + TAB_CAPTURE_GAP_MM;
  }

  return placed;
}

export function pdfFilename(title: string): string {
  const base = title
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
  return `${base || "tab-captures"}.pdf`;
}
