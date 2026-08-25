export function cooldownUntilFrom(
  lastCopilotMessageAt: Date | null | undefined,
  now: Date,
  cooldownMs: number,
): Date | null {
  if (!lastCopilotMessageAt) return null;
  const until = new Date(lastCopilotMessageAt.getTime() + cooldownMs);
  if (until.getTime() <= now.getTime()) return null;
  return until;
}

export function remainingMs(until: Date | null, now: Date): number {
  if (!until) return 0;
  return Math.max(0, until.getTime() - now.getTime());
}
