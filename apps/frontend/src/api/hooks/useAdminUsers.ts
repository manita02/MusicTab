import { useQuery } from "@tanstack/react-query";
import { api } from "../client";
import { ENDPOINTS } from "../endpoints";

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  birthDate: string;
  urlImg: string;
  signupIp?: string | null;
};

export function useAdminUsers(enabled = true) {
  return useQuery<AdminUser[]>({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<AdminUser[]>(ENDPOINTS.users.list);
      return Array.isArray(data) ? data : [];
    },
    enabled,
  });
}
