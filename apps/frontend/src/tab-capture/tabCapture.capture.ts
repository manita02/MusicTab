import type { CssRect } from "./tabCapture.types";

export async function startTabDisplayStream(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Screen capture is not supported in this browser. Use desktop Chrome or Edge.");
  }

  const options: DisplayMediaStreamOptions & {
    preferCurrentTab?: boolean;
    selfBrowserSurface?: string;
    surfaceSwitching?: string;
    monitorTypeSurfaces?: string;
  } = {
    video: true,
    audio: false,
    preferCurrentTab: true,
    selfBrowserSurface: "include",
    surfaceSwitching: "exclude",
    monitorTypeSurfaces: "exclude",
  };

  return navigator.mediaDevices.getDisplayMedia(options);
}

export function cropVideoFrameToBlob(
  video: HTMLVideoElement,
  src: CssRect,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const w = Math.max(1, Math.round(src.w));
  const h = Math.max(1, Math.round(src.h));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Promise.reject(new Error("Canvas is not supported in this browser."));
  }
  ctx.drawImage(video, src.x, src.y, src.w, src.h, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to capture frame."));
      else resolve(blob);
    }, "image/png");
  });
}

export function stopMediaStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read captured image."));
    img.src = url;
  });
}
