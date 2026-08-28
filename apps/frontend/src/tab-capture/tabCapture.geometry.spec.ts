import { describe, expect, it } from "vitest";
import {
  isCropLargeEnough,
  layoutSlicesForPdf,
  mapIframeCropToVideoFrame,
  normalizeDrawnRect,
  pdfFilename,
  tabCaptureLooksLikeViewport,
} from "./tabCapture.geometry";
import type { CaptureSlice } from "./tabCapture.types";

describe("tabCapture.geometry", () => {
  it("normalizes a drag into a positive rectangle clamped to bounds", () => {
    expect(normalizeDrawnRect({ x: 80, y: 90 }, { x: 20, y: 30 }, { w: 100, h: 100 })).toEqual({
      x: 20,
      y: 30,
      w: 60,
      h: 60,
    });
  });

  it("rejects tiny crops", () => {
    expect(isCropLargeEnough({ x: 0, y: 0, w: 4, h: 40 })).toBe(false);
    expect(isCropLargeEnough({ x: 0, y: 0, w: 40, h: 40 })).toBe(true);
  });

  it("maps an iframe-relative crop onto the shared-tab video frame", () => {
    const mapped = mapIframeCropToVideoFrame({
      crop: { x: 10, y: 20, w: 100, h: 50 },
      iframe: { left: 100, top: 80, width: 640, height: 360 },
      viewportWidth: 1000,
      viewportHeight: 500,
      videoWidth: 2000,
      videoHeight: 1000,
    });
    expect(mapped).toEqual({ x: 220, y: 200, w: 200, h: 100 });
  });

  it("detects a tab capture that matches the viewport aspect", () => {
    expect(tabCaptureLooksLikeViewport(1920, 1080, 1920, 1080)).toBe(true);
    expect(tabCaptureLooksLikeViewport(1920, 1080, 800, 1200)).toBe(false);
  });

  it("stacks slices below each other on the first page", () => {
    const slice = (id: string): CaptureSlice => ({
      id,
      blob: new Blob(),
      objectUrl: `blob:${id}`,
      naturalWidth: 200,
      naturalHeight: 40,
      widthPct: 1,
      xPct: 0,
    });
    const placed = layoutSlicesForPdf([slice("a"), slice("b")]);
    expect(placed).toHaveLength(2);
    expect(placed[0].page).toBe(0);
    expect(placed[1].page).toBe(0);
    expect(placed[1].yMm).toBeGreaterThan(placed[0].yMm);
  });

  it("sanitizes the download filename", () => {
    expect(pdfFilename('My <song> / "tab"')).toBe("My song tab.pdf");
    expect(pdfFilename("   ")).toBe("tab-captures.pdf");
  });
});
