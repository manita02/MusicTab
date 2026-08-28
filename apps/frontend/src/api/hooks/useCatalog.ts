import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

export type CatalogItem = { id: number; name: string };
export type InstrumentItem = CatalogItem & { urlIco: string };

export const GENRES_QUERY_KEY = ["genres"] as const;

type ApiErrorResponse = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
};

export const useGenres = () => {
  return useQuery<CatalogItem[]>({
    queryKey: [...GENRES_QUERY_KEY],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.catalogs.genres);
      return res.data;
    },
  });
};

export const useInstruments = () => {
  return useQuery<InstrumentItem[]>({
    queryKey: ["instruments"],
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.catalogs.instruments);
      return res.data;
    },
  });
};

export const useCreateGenre = () => {
  const queryClient = useQueryClient();
  return useMutation<CatalogItem, AxiosError<ApiErrorResponse>, { name: string }>({
    mutationFn: async ({ name }) => {
      const res = await api.post(ENDPOINTS.catalogs.genres, { name });
      return res.data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<CatalogItem[]>([...GENRES_QUERY_KEY], (old) => {
        const list = old ?? [];
        if (list.some((genre) => genre.id === created.id)) return list;
        return [...list, created].sort((a, b) => a.name.localeCompare(b.name));
      });
      void queryClient.invalidateQueries({ queryKey: [...GENRES_QUERY_KEY] });
    },
  });
};

export const useUpdateGenre = () => {
  const queryClient = useQueryClient();
  return useMutation<CatalogItem, AxiosError<ApiErrorResponse>, { id: number; name: string }>({
    mutationFn: async ({ id, name }) => {
      const res = await api.put(ENDPOINTS.catalogs.genre(id), { name });
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<CatalogItem[]>([...GENRES_QUERY_KEY], (old) =>
        (old ?? [])
          .map((genre) => (genre.id === updated.id ? updated : genre))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      void queryClient.invalidateQueries({ queryKey: [...GENRES_QUERY_KEY] });
    },
  });
};

export const useDeleteGenre = () => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id) => {
      await api.delete(ENDPOINTS.catalogs.genre(id));
    },
    onSuccess: (_data, id) => {
      queryClient.setQueryData<CatalogItem[]>([...GENRES_QUERY_KEY], (old) =>
        (old ?? []).filter((genre) => genre.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: [...GENRES_QUERY_KEY] });
    },
  });
};
