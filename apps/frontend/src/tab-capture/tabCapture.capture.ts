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
  return grabCaptureSource(video).then((source) => {
    const canvas = document.createElement("canvas");
    const w = Math.max(1, Math.round(src.w));
    const h = Math.max(1, Math.round(src.h));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return Promise.reject(new Error("Canvas is not supported in this browser."));
    }
    ctx.drawImage(source, src.x, src.y, src.w, src.h, 0, 0, w, h);
    if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
      source.close();
    }
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) reject(new Error("Failed to capture frame."));
        else resolve(blob);
      }, "image/png");
    });
  });
}

type ImageCaptureLike = {
  grabFrame: () => Promise<ImageBitmap>;
};

function grabCaptureSource(video: HTMLVideoElement): Promise<CanvasImageSource> {
  const stream = video.srcObject;
  if (stream instanceof MediaStream) {
    const track = stream.getVideoTracks()[0];
    const ImageCaptureCtor = (
      window as unknown as { ImageCapture?: new (track: MediaStreamTrack) => ImageCaptureLike }
    ).ImageCapture;
    if (track && ImageCaptureCtor) {
      return new ImageCaptureCtor(track).grabFrame().catch(() => video);
    }
  }
  return Promise.resolve(video);
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

/** Hide overlay, then wait until the tab-capture stream has frames without it. */
export async function waitForCleanCaptureFrame(
  video: HTMLVideoElement,
  extraMs = 320,
): Promise<void> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const rvfc = (
    video as HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
    }
  ).requestVideoFrameCallback;
  if (typeof rvfc === "function") {
    for (let i = 0; i < 4; i += 1) {
      await new Promise<void>((resolve) => {
        rvfc.call(video, () => resolve());
      });
    }
  }
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, extraMs);
  });
}
