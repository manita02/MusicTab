import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AxiosError } from "axios";

type ApiErrorResponse = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
};

export const useDeleteUser = () => {
  return useMutation<void, AxiosError<ApiErrorResponse>, number>({
    mutationFn: async (id: number) => {
      await api.delete(ENDPOINTS.users.delete(id));
    },
  });
};