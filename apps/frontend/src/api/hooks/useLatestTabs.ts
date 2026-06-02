import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import { useAuth } from "./useAuth";
import { mapPublicTabsToViewerRows, normalizeAuthenticatedTabRows, type ViewerTabRow } from "./useTabs";

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

function toTabPreview(v: ViewerTabRow): TabPreview {
  const uid = v.userId;
  return {
    id: v.id,
    title: v.title,
    genreId: v.genreId,
    instrumentId: v.instrumentId,
    userId: uid,
    userName: v.userName != null && v.userName !== "" ? v.userName : uid ? `User #${uid}` : "-",
    createdAt: v.createdAt,
    urlPdf: v.urlPdf,
    urlYoutube: v.urlYoutube,
    urlImg: v.urlImg,
  };
}

export const useLatestTabs = (limit: number = 8) => {
  const { isLoggedIn } = useAuth();

  return useQuery<TabPreview[], Error>({
    queryKey: ["latestTabs", limit, isLoggedIn ? "authenticated" : "public"],
    queryFn: async () => {
      const path = isLoggedIn ? ENDPOINTS.tabs.latest : ENDPOINTS.tabs.latestPublic;
      const { data } = await api.get(path, { params: { limit } });
      const rows = isLoggedIn ? normalizeAuthenticatedTabRows(data) : mapPublicTabsToViewerRows(data);
      return rows.map(toTabPreview);
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
