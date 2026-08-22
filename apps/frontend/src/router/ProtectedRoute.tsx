import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../api/hooks/useAuth";

/** Session required. Do not wrap public catalog routes (/, /tabs, /stats). */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return <>{children}</>;
};
