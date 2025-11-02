import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

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

export const useCreateTab = () => {
  return useMutation<CreateTabResponse, Error, CreateTabRequest>({
    mutationFn: async (data: CreateTabRequest) => {
      const res = await api.post(ENDPOINTS.tabs.create, data);
      return res.data;
    },
  });
};