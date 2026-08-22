/** Only same-origin relative paths. Rejects protocol-relative and absolute URLs. */
export function safeInternalPath(raw: string | null | undefined): string {
  if (!raw) return "/";
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return "/";
  }
  return path;
}
