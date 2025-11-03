import { useState, useEffect, useCallback } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("userName");
    const id = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");

    setIsLoggedIn(!!token);
    if (user) setUserName(user);
    if (id) setUserId(Number(id));
    if (role) setUserRole(role);
  }, []);

  const login = useCallback((token: string, id: number, user: string, role: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", String(id));
    localStorage.setItem("userName", user);
    localStorage.setItem("userRole", role);
    setIsLoggedIn(true);
    setUserId(id);
    setUserName(user);
    setUserRole(role);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    window.location.href = "/login";
  };

  return { isLoggedIn, userId, userName, userRole, login, logout };
};