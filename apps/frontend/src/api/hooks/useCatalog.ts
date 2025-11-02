import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

export type CatalogItem = { id: number; name: string };

export const useGenres = () => {
  return useQuery<CatalogItem[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.catalogs.genres);
      return res.data;
    },
  });
};

export const useInstruments = () => {
  return useQuery<CatalogItem[]>({
    queryKey: ["instruments"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.catalogs.instruments);
      return res.data;
    },
  });
};