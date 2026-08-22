/**
 * Client IP for signup uniqueness.
 * x-forwarded-for is only trustworthy behind a reverse proxy you control.
 */
export function extractClientIp(req: {
  ip?: string;
  socket?: { remoteAddress?: string };
  headers: { [key: string]: string | string[] | undefined };
}): string {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedFirst =
    typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : Array.isArray(forwarded)
        ? forwarded[0]
        : undefined;

  const raw = forwardedFirst?.trim() || req.ip?.trim() || req.socket?.remoteAddress?.trim() || 'unknown';
  return stripIpv4Mapped(raw);
}

function stripIpv4Mapped(ip: string): string {
  if (ip.toLowerCase().startsWith('::ffff:')) {
    return ip.slice('::ffff:'.length);
  }
  return ip;
}
