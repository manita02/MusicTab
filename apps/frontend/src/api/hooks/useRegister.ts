import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";
import type { AxiosError } from "axios";

type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  birthDate: string;
  urlImg: string;
};

type RegisterResponse = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  birthDate: string;
  urlImg: string;
};

type ApiErrorResponse = {
  statusCode?: number;
  message?: string;
  error?: string;
  code?: string;
};

export const useRegister = () => {
  return useMutation<RegisterResponse, AxiosError<ApiErrorResponse>, RegisterRequest>({
    mutationFn: async (data: RegisterRequest) => {
      const res = await api.post(ENDPOINTS.users.register, {
        ...data,
        birthDate: new Date(data.birthDate).toISOString(), // ISO format
      });
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("userId", data.id.toString());
      localStorage.setItem("userName", data.username);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userImg", data.urlImg);
      localStorage.setItem("birthDate", data.birthDate);
    },
  });
};