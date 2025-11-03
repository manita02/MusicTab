import { useState, useEffect, useCallback, useRef } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("expiresAt");
  };

  const logout = useCallback(() => {
    clearSession();
    setIsLoggedIn(false);
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  }, []);

  const scheduleLogout = useCallback(
    (expiresAt: string) => {
      const expirationTime = new Date(expiresAt).getTime();
      const now = Date.now();
      const timeout = expirationTime - now;

      if (timeout > 0) {
        logoutTimer.current = setTimeout(logout, timeout);
      } else {
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("userName");
    const id = localStorage.getItem("userId");
    const role = localStorage.getItem("userRole");
    const expiresAt = localStorage.getItem("expiresAt");
    if (!token || !expiresAt) {
      setIsLoggedIn(false);
      return;
    }

    const expired = new Date(expiresAt).getTime() < Date.now();
    if (expired) {
      logout();
      return;
    }

    setIsLoggedIn(true);
    if (user) setUserName(user);
    if (id) setUserId(Number(id));
    if (role) setUserRole(role);
    scheduleLogout(expiresAt);
  }, [logout, scheduleLogout]);

  const login = useCallback(
    (token: string, id: number, user: string, role: string, expiresAt: string) => {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", String(id));
      localStorage.setItem("userName", user);
      localStorage.setItem("userRole", role);
      localStorage.setItem("expiresAt", expiresAt);
      setIsLoggedIn(true);
      setUserId(id);
      setUserName(user);
      setUserRole(role);
      scheduleLogout(expiresAt);
    },
    [scheduleLogout]
  );

  return { isLoggedIn, userId, userName, userRole, login, logout };
};