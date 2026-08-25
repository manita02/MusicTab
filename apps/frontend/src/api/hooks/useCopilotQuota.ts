import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { CopilotQuota } from "../copilot.types";

export const COPILOT_QUOTA_QUERY_KEY = ["copilot", "quota"] as const;

export function useCopilotQuota(enabled: boolean) {
  return useQuery<CopilotQuota>({
    queryKey: COPILOT_QUOTA_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<CopilotQuota>(ENDPOINTS.copilot.quota);
      return data;
    },
    enabled,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });
}
