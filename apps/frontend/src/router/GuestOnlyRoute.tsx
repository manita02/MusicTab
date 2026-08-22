import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../api/hooks/useAuth";

/** Login / register: bounce an already authenticated viewer to home. */
export const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
