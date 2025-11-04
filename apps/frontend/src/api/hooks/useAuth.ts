import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"ADMIN" | "USER" | null>(null);
  const [userImg, setUserImg] = useState<string | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("userImg");
    localStorage.removeItem("birthDate");
  };

  const logout = useCallback(() => {
    clearSession();
    setIsLoggedIn(false);
    setUserId(null);
    setUserName(null);
    setUserRole(null);
    setUserImg(null);

    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    navigate("/");
    window.location.reload();
  }, [navigate]);

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
    const img = localStorage.getItem("userImg");

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
    if (role) setUserRole(role as "ADMIN" | "USER");
    if (img) setUserImg(img);
    scheduleLogout(expiresAt);
  }, [logout, scheduleLogout]);

  const login = useCallback(
    (token: string, id: number, user: string, role: string, expiresAt: string, img: string) => {
      localStorage.setItem("token", token);
      localStorage.setItem("userId", String(id));
      localStorage.setItem("userName", user);
      localStorage.setItem("userRole", role);
      localStorage.setItem("expiresAt", expiresAt);
      localStorage.setItem("userImg", img);

      setIsLoggedIn(true);
      setUserId(id);
      setUserName(user);
      setUserRole(role as "ADMIN" | "USER");
      setUserImg(img);
      scheduleLogout(expiresAt);
    },
    [scheduleLogout]
  );

  return { isLoggedIn, userId, userName, userRole, userImg, login, logout };
};