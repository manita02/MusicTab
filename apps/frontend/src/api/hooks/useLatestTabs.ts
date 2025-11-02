import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

export interface TabPreview {
  id: number;
  title: string;
  genreId: number;
  instrumentId: number;
  userId: number;
  userName: string;
  createdAt: string;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
}

export const useLatestTabs = (limit: number = 8) => {
  return useQuery<TabPreview[], Error>({
    queryKey: ["latestTabs", limit],
    queryFn: async () => {
      const { data } = await api.get<TabPreview[]>("/tabs/latest", { params: { limit } });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};