import { lookup } from 'dns/promises';
import { isIP } from 'net';

const MAX_REDIRECTS = 5;

export type HostLookup = (hostname: string) => Promise<Array<{ address: string }>>;

export class UnsafeCoverUrlError extends Error {
  constructor(message = 'Cover URL is not allowed') {
    super(message);
    this.name = 'UnsafeCoverUrlError';
  }
}

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return -1;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n < 0) return false;
  return (
    n <= 0x00ffffff || // 0.0.0.0/8
    (n >= 0x0a000000 && n <= 0x0affffff) || // 10.0.0.0/8
    (n >= 0x7f000000 && n <= 0x7fffffff) || // 127.0.0.0/8
    (n >= 0xa9fe0000 && n <= 0xa9feffff) || // 169.254.0.0/16
    (n >= 0xac100000 && n <= 0xac1fffff) || // 172.16.0.0/12
    (n >= 0xc0a80000 && n <= 0xc0a8ffff) || // 192.168.0.0/16
    (n >= 0x64400000 && n <= 0x647fffff) // 100.64.0.0/10
  );
}

export function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '::' || lower === '0:0:0:0:0:0:0:1') return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('fe80')) return true;
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost') || host === '0.0.0.0') return true;
  if (host === 'metadata.google.internal' || host.endsWith('.internal')) return true;
  const ipVersion = isIP(host);
  if (ipVersion === 4) return isPrivateIPv4(host);
  if (ipVersion === 6) return isPrivateIPv6(host);
  return false;
}

export function parseCoverUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeCoverUrlError();
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeCoverUrlError();
  }
  if (url.username || url.password) {
    throw new UnsafeCoverUrlError();
  }
  if (isBlockedHostname(url.hostname)) {
    throw new UnsafeCoverUrlError();
  }
  return url;
}

const defaultLookup: HostLookup = async (hostname) => lookup(hostname, { all: true });

export async function assertSafeCoverUrl(raw: string, resolve: HostLookup = defaultLookup): Promise<URL> {
  const url = parseCoverUrl(raw);
  if (isIP(url.hostname.replace(/^\[|\]$/g, ''))) {
    return url;
  }
  let addrs: Array<{ address: string }>;
  try {
    addrs = await resolve(url.hostname);
  } catch {
    throw new UnsafeCoverUrlError();
  }
  if (!addrs?.length) {
    throw new UnsafeCoverUrlError();
  }
  for (const addr of addrs) {
    const ip = addr.address;
    const version = isIP(ip);
    if (version === 4 && isPrivateIPv4(ip)) throw new UnsafeCoverUrlError();
    if (version === 6 && isPrivateIPv6(ip)) throw new UnsafeCoverUrlError();
  }
  return url;
}

export async function fetchSafeCover(
  raw: string,
  signal: AbortSignal,
  resolve: HostLookup = defaultLookup,
): Promise<Response> {
  let current = await assertSafeCoverUrl(raw, resolve);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current.toString(), { redirect: 'manual', signal });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) {
        throw new UnsafeCoverUrlError();
      }
      current = await assertSafeCoverUrl(new URL(location, current).toString(), resolve);
      continue;
    }
    return res;
  }
  throw new UnsafeCoverUrlError();
}
