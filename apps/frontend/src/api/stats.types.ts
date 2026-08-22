import { api } from "./client";

export type StatsHit = {
  id: number;
  title: string;
  artist: string;
  genre: string;
  instrument: string;
  viewCount: number;
  createdAt: string;
  lastViewedAt?: string;
  userViewCount?: number;
};

export type StatsGlobalResponse = {
  most: StatsHit[];
  least: StatsHit[];
};

export type StatsMeResponse = {
  kpis: {
    events: number;
    distinctTabs: number;
    catalogTotal: number;
    coveragePct: number;
  };
  lastViewed: StatsHit | null;
  most: StatsHit[];
  least: StatsHit[];
  never: StatsHit[];
  stale: StatsHit[];
};

export function publicCoverUrl(tabId: number): string {
  const base = (api.defaults.baseURL || "").replace(/\/$/, "");
  return `${base}/tabs/public/${tabId}/cover`;
}

export function opensForBar(hit: StatsHit, personal: boolean): number {
  if (personal && hit.userViewCount != null) return hit.userViewCount;
  return hit.viewCount;
}
