import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AxiosError } from "axios";

type UpdateUserRequest = {
  id: number;
  username?: string;
  email?: string;
  password?: string;
  birthDate?: string;
  urlImg?: string;
};

type UpdateUserResponse = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  birthDate: string;
  urlImg: string;
};

type ApiErrorResponse = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
};

export const useUpdateUser = () => {
  return useMutation<UpdateUserResponse, AxiosError<ApiErrorResponse>, UpdateUserRequest>({
    mutationFn: async (data: UpdateUserRequest) => {
      const res = await api.put(ENDPOINTS.users.update(data.id), {
        username: data.username,
        email: data.email,
        password: data.password,
        birthDate: data.birthDate,
        urlImg: data.urlImg,
      });
      return res.data;
    },
  });
};