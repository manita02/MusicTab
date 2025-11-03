import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AxiosError } from "axios";

type UpdateTabRequest = {
  id: number;
  title: string;
  userId: number;
  genreId: number;
  instrumentId: number;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
};

type UpdateTabResponse = {
  id: number;
  title: string;
  genreId: number;
  instrumentId: number;
  userId: number;
  createdAt: string;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
};

type ApiErrorResponse = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
};

export const useUpdateTab = () => {
  return useMutation<UpdateTabResponse, AxiosError<ApiErrorResponse>, UpdateTabRequest>({
    mutationFn: async (tab: UpdateTabRequest) => {
      const token = localStorage.getItem("token");
      try {
        const response = await api.put(ENDPOINTS.tabs.update(tab.id), tab, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Unexpected error while updating tab");
      }
    },
  });
};