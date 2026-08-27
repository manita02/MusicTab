const VIDEO_ID = "([a-zA-Z0-9_-]{11})";

export function extractYouTubeVideoId(rawUrl: string): string | null {
  if (!rawUrl?.trim()) return null;
  const u = rawUrl.trim();

  const watch = u.match(new RegExp(`[?&]v=${VIDEO_ID}`));
  if (watch) return watch[1];

  const short = u.match(new RegExp(`youtu\\.be/${VIDEO_ID}`));
  if (short) return short[1];

  const embed = u.match(new RegExp(`youtube\\.com/embed/${VIDEO_ID}`));
  if (embed) return embed[1];

  const shorts = u.match(new RegExp(`youtube\\.com/shorts/${VIDEO_ID}`));
  if (shorts) return shorts[1];

  return null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
}
