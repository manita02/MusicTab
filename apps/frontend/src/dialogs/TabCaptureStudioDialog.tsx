import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Slider,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import CropFreeIcon from "@mui/icons-material/CropFree";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ScreenshotMonitorIcon from "@mui/icons-material/ScreenshotMonitor";
import { Button } from "../components/Button/Button";
import { InputField } from "../components/InputField/InputField";
import {
  cropVideoFrameToBlob,
  loadImageFromUrl,
  startTabDisplayStream,
  stopMediaStream,
  waitForCleanCaptureFrame,
} from "../tab-capture/tabCapture.capture";
import { MAX_TAB_CAPTURES, TAB_CAPTURE_MIN_WIDTH_PCT } from "../tab-capture/tabCapture.constants";
import { CropOverlay, type CropOverlayHandle } from "../tab-capture/CropOverlay";
import {
  clampWidthPct,
  isCropLargeEnough,
  layoutSlicesForPdf,
  mapIframeCropToVideoFrame,
  tabCaptureLooksLikeViewport,
} from "../tab-capture/tabCapture.geometry";
import { exportTabCapturePdf } from "../tab-capture/tabCapture.pdf";
import type { CaptureSlice, CssRect } from "../tab-capture/tabCapture.types";
import { getYouTubeEmbedUrl } from "../utils/youtube";

type TabCaptureStudioDialogProps = {
  open: boolean;
  onClose: () => void;
};

function newSliceId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `slice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const TabCaptureStudioDialog: React.FC<TabCaptureStudioDialogProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const titleFieldId = useId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cropOverlayRef = useRef<CropOverlayHandle>(null);

  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [crop, setCrop] = useState<CssRect | null>(null);
  const [sharing, setSharing] = useState(false);
  const [slices, setSlices] = useState<CaptureSlice[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
  const atCap = slices.length >= MAX_TAB_CAPTURES;

  const revokeSlices = useCallback((items: CaptureSlice[]) => {
    items.forEach((item) => URL.revokeObjectURL(item.objectUrl));
  }, []);

  const stopSharing = useCallback(() => {
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setSharing(false);
  }, []);

  const resetStudio = useCallback(() => {
    stopSharing();
    setSlices((prev) => {
      revokeSlices(prev);
      return [];
    });
    setTitle("");
    setYoutubeUrl("");
    setDrawing(false);
    setCrop(null);
    setBusy(false);
    setError(null);
  }, [revokeSlices, stopSharing]);

  useEffect(() => {
    if (!open) {
      resetStudio();
    }
  }, [open, resetStudio]);

  const handleClose = () => {
    resetStudio();
    onClose();
  };

  const handleShareTab = async () => {
    setError(null);
    try {
      const stream = await startTabDisplayStream();
      stopMediaStream(streamRef.current);
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        throw new Error("Capture preview is not ready.");
      }
      video.srcObject = stream;
      await video.play();
      const [track] = stream.getVideoTracks();
      track?.addEventListener("ended", () => {
        stopSharing();
      });
      setSharing(true);
    } catch (err) {
      stopSharing();
      const message = err instanceof Error ? err.message : "Could not share this tab.";
      if (/not allowed|permission|denied|abort/i.test(message)) {
        setError("Tab sharing was cancelled. Choose this browser tab (not the whole screen).");
        return;
      }
      setError(message);
    }
  };

  const handleCapture = async () => {
    setError(null);
    const video = videoRef.current;
    const iframe = iframeRef.current;
    if (!sharing || !video || !iframe) {
      setError("Share this tab first, then draw a crop over the tablature.");
      return;
    }
    if (!isCropLargeEnough(crop)) {
      setError("Draw a crop rectangle over the tablature area first.");
      return;
    }
    if (atCap) {
      setError(`Maximum of ${MAX_TAB_CAPTURES} captures reached.`);
      return;
    }
    if (video.videoWidth < 2 || video.videoHeight < 2) {
      setError("The shared tab stream is not ready yet. Try sharing again.");
      return;
    }
    if (
      !tabCaptureLooksLikeViewport(
        video.videoWidth,
        video.videoHeight,
        window.innerWidth,
        window.innerHeight,
      )
    ) {
      setError("The capture does not match this tab. Share this browser tab, not the whole screen.");
      return;
    }

    const mapped = mapIframeCropToVideoFrame({
      crop,
      iframe: iframe.getBoundingClientRect(),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
    });
    if (!mapped) {
      setError("Could not map the crop onto the shared tab. Redraw the rectangle and try again.");
      return;
    }

    setBusy(true);
    cropOverlayRef.current?.setCapturing(true);
    try {
      await waitForCleanCaptureFrame(video);
      const blob = await cropVideoFrameToBlob(video, mapped);
      const objectUrl = URL.createObjectURL(blob);
      const img = await loadImageFromUrl(objectUrl);
      setSlices((prev) => [
        ...prev,
        {
          id: newSliceId(),
          blob,
          objectUrl,
          naturalWidth: img.naturalWidth || img.width,
          naturalHeight: img.naturalHeight || img.height,
          widthPct: 1,
          xPct: 0,
        },
      ]);
      setDrawing(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not capture this frame.";
      setError(message);
    } finally {
      cropOverlayRef.current?.setCapturing(false);
      setBusy(false);
    }
  };

  const moveSlice = (index: number, dir: -1 | 1) => {
    setSlices((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const removeSlice = (index: number) => {
    setSlices((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.objectUrl);
      return copy;
    });
  };

  const handleDownload = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Enter a PDF title before downloading.");
      return;
    }
    if (slices.length === 0) {
      setError("Capture at least one frame before downloading.");
      return;
    }
    setBusy(true);
    try {
      await exportTabCapturePdf(title, slices, youtubeUrl.trim() || embedUrl || "");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not generate the PDF.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const placed = layoutSlicesForPdf(slices);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth={false}
      fullScreen={!isDesktop}
      aria-labelledby={titleFieldId}
      PaperProps={{
        sx: {
          width: { xs: "100%", md: "calc(100% - 32px)" },
          height: { xs: "100%", md: "calc(100dvh - 32px)" },
          maxHeight: { md: "calc(100dvh - 32px)" },
          m: { xs: 0, md: 2 },
          borderRadius: { xs: 0, md: 3 },
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 1,
          px: 2,
          pr: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          id={titleFieldId}
          component="h2"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            fontSize: "1.15rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Capture tab PDF
        </Typography>
        {isDesktop ? (
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "grid",
              gridTemplateColumns: "minmax(140px, 0.7fr) minmax(220px, 1.3fr)",
              gap: 1,
            }}
          >
            <InputField
              label="PDF title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song name"
              size="small"
            />
            <InputField
              label="YouTube URL"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              size="small"
            />
          </Box>
        ) : null}
        <IconButton aria-label="Close capture studio" onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 1, overflow: "hidden", p: 1.5 }}
      >
        {!isDesktop ? (
          <Alert severity="info">This tool is available on desktop only.</Alert>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { md: "minmax(0, 1.85fr) minmax(200px, 0.55fr)" },
              gap: 1.5,
              minHeight: 0,
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0, minHeight: 0, height: "100%" }}>
              {error ? (
                <Alert severity="error" onClose={() => setError(null)} sx={{ flexShrink: 0 }}>
                  {error}
                </Alert>
              ) : null}

              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: "#1a1a1a",
                }}
              >
                {embedUrl ? (
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "16 / 9",
                      flexShrink: 0,
                    }}
                  >
                    <CropOverlay
                      ref={cropOverlayRef}
                      drawing={drawing}
                      crop={crop}
                      onCropChange={setCrop}
                    >
                      <iframe
                        ref={iframeRef}
                        src={embedUrl}
                        title="YouTube tablature video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          display: "block",
                          width: "100%",
                          height: "100%",
                          border: 0,
                        }}
                      />
                    </CropOverlay>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      px: 2,
                      py: 4,
                      color: "#fff",
                      textAlign: "center",
                    }}
                  >
                    Paste a YouTube URL to load the video.
                  </Box>
                )}
              </Box>

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                aria-hidden
                data-testid="tab-capture-hidden-video"
                style={{
                  position: "fixed",
                  left: "-10000px",
                  top: 0,
                  width: 1280,
                  height: 720,
                  opacity: 0.01,
                  pointerEvents: "none",
                }}
              />

              <Box
                sx={{
                  flexShrink: 0,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.75,
                  "& .MuiButton-root": {
                    fontSize: "0.75rem",
                    padding: "4px 12px",
                    minHeight: 32,
                    "& .MuiButton-startIcon": {
                      marginRight: 0.5,
                      "& > *:nth-of-type(1)": { fontSize: "1rem" },
                    },
                  },
                }}
              >
                <Button
                  size="small"
                  label={sharing ? "Share tab again" : "Share this tab"}
                  variantType="secondary"
                  startIcon={<ScreenshotMonitorIcon />}
                  onClick={() => void handleShareTab()}
                  disabled={busy || !embedUrl}
                />
                <Button
                  size="small"
                  label={drawing ? "Drawing crop…" : "Draw crop"}
                  variantType={drawing ? "secondary" : "primary"}
                  startIcon={<CropFreeIcon />}
                  onClick={() => setDrawing((v) => !v)}
                  disabled={busy || !embedUrl}
                />
                <Button
                  size="small"
                  label="Capture frame"
                  startIcon={<CameraAltIcon />}
                  onClick={() => void handleCapture()}
                  disabled={busy || !sharing || !isCropLargeEnough(crop) || atCap || !embedUrl}
                />
                <Button
                  size="small"
                  label="Clear crop"
                  variantType="danger"
                  onClick={() => {
                    setCrop(null);
                    setDrawing(false);
                  }}
                  disabled={busy || !crop}
                />
              </Box>
            </Box>

            <Box
              sx={{
                minWidth: 0,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                gap: 1,
                overflow: "hidden",
              }}
            >
              <Typography fontWeight={700} variant="body2">
                PDF preview ({slices.length} / {MAX_TAB_CAPTURES})
              </Typography>
              <Box
                data-testid="tab-capture-preview"
                sx={{
                  flex: 1,
                  overflow: "auto",
                  borderRadius: 2,
                  p: 1.5,
                  backgroundColor: "rgba(255,255,255,0.55)",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {slices.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Captures will stack here, one below the other.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {slices.map((slice, index) => {
                      const layout = placed.find((p) => p.id === slice.id);
                      return (
                        <Box
                          key={slice.id}
                          data-testid={`tab-capture-slice-${index}`}
                          sx={{
                            borderRadius: 1,
                            border: `1px solid ${theme.palette.divider}`,
                            p: 1,
                            backgroundColor: "#fff",
                          }}
                        >
                          <Box
                            component="img"
                            src={slice.objectUrl}
                            alt={`Capture ${index + 1}`}
                            sx={{
                              display: "block",
                              width: `${clampWidthPct(slice.widthPct) * 100}%`,
                              ml: layout ? `${Math.max(0, slice.xPct) * (100 - slice.widthPct * 100)}%` : 0,
                              height: "auto",
                              borderRadius: 0.5,
                            }}
                          />
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
                            <Typography variant="caption" sx={{ minWidth: 52 }}>
                              Size
                            </Typography>
                            <Slider
                              size="small"
                              min={TAB_CAPTURE_MIN_WIDTH_PCT * 100}
                              max={100}
                              value={Math.round(clampWidthPct(slice.widthPct) * 100)}
                              onChange={(_, value) => {
                                const pct = Array.isArray(value) ? value[0] : value;
                                setSlices((prev) =>
                                  prev.map((item, i) =>
                                    i === index ? { ...item, widthPct: clampWidthPct(pct / 100) } : item,
                                  ),
                                );
                              }}
                              aria-label={`Resize capture ${index + 1}`}
                            />
                            <Tooltip title="Move up">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={index === 0}
                                  aria-label={`Move capture ${index + 1} up`}
                                  onClick={() => moveSlice(index, -1)}
                                >
                                  <KeyboardArrowUpIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Move down">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={index === slices.length - 1}
                                  aria-label={`Move capture ${index + 1} down`}
                                  onClick={() => moveSlice(index, 1)}
                                >
                                  <KeyboardArrowDownIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton
                                size="small"
                                aria-label={`Remove capture ${index + 1}`}
                                onClick={() => removeSlice(index)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          gap: 1,
          flexWrap: "wrap",
          py: 1,
          "& .MuiButton-root": {
            fontSize: "0.8rem",
            padding: "4px 14px",
            minHeight: 34,
          },
        }}
      >
        {isDesktop ? (
          <Button
            size="small"
            label={busy ? "Working…" : "Download PDF"}
            variantType="secondary"
            onClick={() => void handleDownload()}
            disabled={busy || slices.length === 0 || !title.trim()}
          />
        ) : null}
        <Button size="small" label="Close" variantType="danger" onClick={handleClose} disabled={busy} />
      </DialogActions>
    </Dialog>
  );
};
