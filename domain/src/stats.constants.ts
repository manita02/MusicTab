export const STATS_RESULT_LIMIT = 3;
export const STATS_LIST_LIMIT = 8;

export function capTake(take: number, max: number): number {
  return Math.min(Math.max(take, 1), max);
}
