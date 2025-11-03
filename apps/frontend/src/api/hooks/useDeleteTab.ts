import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

export const useDeleteTab = () => {
  return useMutation({
    mutationFn: async ({ id, userId }: { id: number; userId: number }) => {
      const token = localStorage.getItem("token");
      const response = await api.delete(`${ENDPOINTS.tabs.delete(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userId },
      });
      return response.data;
    },
  });
};