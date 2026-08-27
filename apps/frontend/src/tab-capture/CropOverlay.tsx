import React, { useRef, useState } from "react";
import { Box } from "@mui/material";
import { isCropLargeEnough, normalizeDrawnRect } from "./tabCapture.geometry";
import type { CssRect } from "./tabCapture.types";

type CropOverlayProps = {
  drawing: boolean;
  crop: CssRect | null;
  onCropChange: (crop: CssRect | null) => void;
  children: React.ReactNode;
};

export const CropOverlay: React.FC<CropOverlayProps> = ({
  drawing,
  crop,
  onCropChange,
  children,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<CssRect | null>(null);

  const toLocal = (clientX: number, clientY: number) => {
    const r = wrapRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(r.width, clientX - r.left)),
      y: Math.max(0, Math.min(r.height, clientY - r.top)),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing || !wrapRef.current) return;
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    const p = toLocal(e.clientX, e.clientY);
    dragStart.current = p;
    setDraft({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing || !dragStart.current || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const end = toLocal(e.clientX, e.clientY);
    setDraft(normalizeDrawnRect(dragStart.current, end, { w: r.width, h: r.height }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawing || !dragStart.current || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const end = toLocal(e.clientX, e.clientY);
    const next = normalizeDrawnRect(dragStart.current, end, { w: r.width, h: r.height });
    dragStart.current = null;
    setDraft(null);
    onCropChange(isCropLargeEnough(next) ? next : null);
  };

  const rect = draft ?? crop;

  return (
    <Box ref={wrapRef} sx={{ position: "relative", width: "100%", height: "100%" }}>
      {children}
      <Box
        data-testid="tab-capture-crop-overlay"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          cursor: drawing ? "crosshair" : "default",
          pointerEvents: drawing ? "auto" : "none",
        }}
      >
        {rect && isCropLargeEnough(rect) ? (
          <Box
            data-testid="tab-capture-crop-rect"
            sx={{
              position: "absolute",
              left: rect.x,
              top: rect.y,
              width: rect.w,
              height: rect.h,
              border: "2px solid #FF9730",
              backgroundColor: "rgba(255,151,48,0.18)",
              pointerEvents: "none",
              boxSizing: "border-box",
            }}
          />
        ) : null}
      </Box>
    </Box>
  );
};
