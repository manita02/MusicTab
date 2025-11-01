import { useState, useEffect, useCallback } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("userName");
    setIsLoggedIn(!!token);
    if (user) setUserName(user);
  }, []);

  const login = useCallback((token: string, user: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userName", user);
    setIsLoggedIn(true);
    setUserName(user);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName(null);
    window.location.href = "/login";
  };

  return { isLoggedIn, userName, login, logout };
};