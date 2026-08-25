import type { CopilotQuota } from "./copilot.types";

export function remainingMsFromQuota(
  quota: Pick<CopilotQuota, "cooldownUntil" | "cooldownRemainingMs"> | undefined,
  nowMs: number,
): number {
  if (!quota) return 0;
  if (quota.cooldownUntil) {
    const until = Date.parse(quota.cooldownUntil);
    if (Number.isFinite(until)) return Math.max(0, until - nowMs);
  }
  return Math.max(0, quota.cooldownRemainingMs ?? 0);
}

export function formatCooldownMmSs(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
