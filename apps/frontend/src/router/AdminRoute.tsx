import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../api/hooks/useAuth";
import { canManageUsers, normalizeRole } from "../auth/tabPermissions";

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, userRole } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!canManageUsers(isLoggedIn, normalizeRole(userRole))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
