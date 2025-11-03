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
  userName: string;
  expiresAt: string;
  userRole: string;
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.userName);
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("userRole", data.userRole);
      localStorage.setItem("expiresAt", data.expiresAt);
    },
  });
};