import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AxiosError } from "axios";

type CreateTabRequest = {
  title: string;
  userId: number;
  genreId: number;
  instrumentId: number;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
};

type CreateTabResponse = {
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

export const useCreateTab = () => {
  return useMutation<CreateTabResponse, AxiosError<ApiErrorResponse>, CreateTabRequest>({
    mutationFn: async (data: CreateTabRequest) => {
      try {
        const res = await api.post(ENDPOINTS.tabs.create, data);
        return res.data;
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Unexpected error while creating tab");
      }
    },
  });
};