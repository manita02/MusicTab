export type CssRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CaptureSlice = {
  id: string;
  blob: Blob;
  objectUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  widthPct: number;
  xPct: number;
};

export type PlacedSlice = {
  id: string;
  objectUrl: string;
  page: number;
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
};
