import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

export const useAllTabs = () => {
  return useQuery({
    queryKey: ["tabs", "all"],
    queryFn: async () => {
      const { data } = await api.get(ENDPOINTS.tabs.all);
      return data;
    },
  });
};