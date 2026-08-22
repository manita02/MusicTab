import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { StatsGlobalResponse, StatsMeResponse } from "../stats.types";

export const STATS_GLOBAL_QUERY_KEY = ["stats", "global"] as const;
export const STATS_ME_QUERY_KEY = ["stats", "me"] as const;

export function useStatsGlobal() {
  return useQuery<StatsGlobalResponse>({
    queryKey: STATS_GLOBAL_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<StatsGlobalResponse>(ENDPOINTS.stats.global, {
        params: { take: 3 },
      });
      return {
        most: Array.isArray(data.most) ? data.most : [],
        least: Array.isArray(data.least) ? data.least : [],
      };
    },
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useStatsMe(enabled: boolean) {
  return useQuery<StatsMeResponse>({
    queryKey: STATS_ME_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<StatsMeResponse>(ENDPOINTS.stats.me);
      return data;
    },
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
