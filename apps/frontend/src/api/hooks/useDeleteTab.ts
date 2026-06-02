import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

export const useDeleteTab = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const token = localStorage.getItem("token");
      const response = await api.delete(`${ENDPOINTS.tabs.delete(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });
};