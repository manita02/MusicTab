export function extractYouTubeVideoId(rawUrl: string): string | null {
  if (!rawUrl?.trim()) return null;
  const u = rawUrl.trim();

  const watch = u.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];

  const short = u.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];

  const embed = u.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];

  const shorts = u.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts) return shorts[1];

  return null;
}
