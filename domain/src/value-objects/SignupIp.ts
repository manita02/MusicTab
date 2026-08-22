import { DomainError } from "../errors/DomainError";

const LOCALHOST = ["127.0.0.1", "::1"] as const;

/** Trim, strip IPv4-mapped IPv6, reject empty / unknown. */
export function normalizeSignupIp(raw: string): string {
  let ip = (raw ?? "").trim();
  if (ip.toLowerCase().startsWith("::ffff:")) {
    ip = ip.slice("::ffff:".length).trim();
  }
  if (!ip || ip.toLowerCase() === "unknown") {
    throw new DomainError("InvalidSignupIp", "Could not determine client IP");
  }
  return ip;
}

/** Localhost v4/v6 are the same network for signup uniqueness. */
export function signupIpLookupValues(ip: string): string[] {
  const normalized = ip.trim();
  if ((LOCALHOST as readonly string[]).includes(normalized)) {
    return [...LOCALHOST];
  }
  return [normalized];
}
