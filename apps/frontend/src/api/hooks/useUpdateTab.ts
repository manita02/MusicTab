import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

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

export const useUpdateTab = () => {
  return useMutation<UpdateTabResponse, Error, UpdateTabRequest>({
    mutationFn: async (tab: UpdateTabRequest) => {
      const token = localStorage.getItem("token");
      const response = await api.put(`${ENDPOINTS.tabs.update(tab.id)}`, tab, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });
};
