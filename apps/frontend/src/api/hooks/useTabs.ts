import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import { useAuth } from "./useAuth";

export type TabAuthenticated = {
  id: number;
  title: string;
  artist: string;
  genreId: number;
  instrumentId: number;
  userId: number;
  userName: string | null;
  createdAt: string;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
  viewCount?: number;
};

export type ViewerTabRow = TabAuthenticated;

/** Respuesta de GET /tabs/public o /tabs/latest/public (sin URLs almacenadas). */
export type PublicTabListItem = {
  id: number;
  title: string;
  artist?: string;
  genreId: number;
  instrumentId: number;
  userId: number;
  userName: string | null;
  createdAt: string;
  youtubeVideoId: string | null;
  coverPath: string;
};

export function mapPublicTabsToViewerRows(data: unknown): ViewerTabRow[] {
  if (!Array.isArray(data)) return [];
  const base = (api.defaults.baseURL || "").replace(/\/$/, "");
  return (data as PublicTabListItem[]).map((t) => {
    const id = Number(t.id);
    const coverPath =
      typeof t.coverPath === "string" && t.coverPath.startsWith("/")
        ? t.coverPath
        : `/tabs/public/${id}/cover`;
    const vid = t.youtubeVideoId != null && String(t.youtubeVideoId) !== "" ? String(t.youtubeVideoId) : null;
    return {
      id,
      title: String(t.title ?? ""),
      artist: String(t.artist ?? ""),
      genreId: Number(t.genreId),
      instrumentId: Number(t.instrumentId),
      userId: Number(t.userId) || 0,
      userName: t.userName ?? null,
      createdAt: String(t.createdAt ?? ""),
      urlPdf: "",
      urlYoutube: vid ? `https://www.youtube.com/watch?v=${vid}` : "",
      urlImg: `${base}${coverPath}`,
    };
  });
}

export function normalizeAuthenticatedTabRows(data: unknown): ViewerTabRow[] {
  if (!Array.isArray(data)) return [];
  return data.map((t: Record<string, unknown>) => ({
    id: Number(t.id),
    title: String(t.title ?? ""),
    artist: String(t.artist ?? ""),
    genreId: Number(t.genreId),
    instrumentId: Number(t.instrumentId),
    userId: typeof t.userId === "number" ? t.userId : Number(t.userId) || 0,
    userName: (t.userName as string | null) ?? null,
    createdAt: String(t.createdAt ?? ""),
    urlPdf: String(t.urlPdf ?? ""),
    urlYoutube: String(t.urlYoutube ?? ""),
    urlImg: String(t.urlImg ?? ""),
  }));
}

export function useTabsForViewer() {
  const { isLoggedIn } = useAuth();

  return useQuery<ViewerTabRow[]>({
    queryKey: ["tabs", isLoggedIn ? "authenticated" : "public"],
    queryFn: async () => {
      if (!isLoggedIn) {
        const { data } = await api.get<PublicTabListItem[]>(ENDPOINTS.tabs.public);
        return mapPublicTabsToViewerRows(data);
      }
      const { data } = await api.get(ENDPOINTS.tabs.list);
      return normalizeAuthenticatedTabRows(data);
    },
  });
}

export const useAllTabs = useTabsForViewer;
