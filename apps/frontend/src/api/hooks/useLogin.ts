import { useMutation } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

type LoginRequest = {
  email: string;
  password: string;
  expiresInSeconds?: number;
};

type LoginResponse = {
  token: string;
  userId: number;
  expiresAt: string;
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: async (data: LoginRequest) => {
      const res = await api.post(ENDPOINTS.users.login, {
        ...data,
        expiresInSeconds: data.expiresInSeconds ?? 3600,
      });
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("user_id", data.userId.toString());
    },
  });
};