import { CopilotTabHit } from "./dto/CopilotTabHit";

export function opensOf(hit: CopilotTabHit, personal: boolean): number {
  if (personal && hit.userViewCount != null) return hit.userViewCount;
  return hit.viewCount;
}

/** Least bars must not reuse most IDs or the same open counts. */
export function pickDistinctLeast(
  most: CopilotTabHit[],
  leastPool: CopilotTabHit[],
  take: number,
  personal: boolean,
): CopilotTabHit[] {
  const mostIds = new Set(most.map((h) => h.id));
  const mostMin = most.length
    ? Math.min(...most.map((h) => opensOf(h, personal)))
    : Number.POSITIVE_INFINITY;

  return leastPool
    .filter((h) => !mostIds.has(h.id) && opensOf(h, personal) < mostMin)
    .slice(0, take);
}
