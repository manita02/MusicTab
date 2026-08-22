export type ViewerRole = "ADMIN" | "USER" | null;

export function normalizeRole(role: string | null | undefined): ViewerRole {
  if (!role) return null;
  return role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
}

export function isAdmin(role: ViewerRole): boolean {
  return role === "ADMIN";
}

export function canManageTabs(isLoggedIn: boolean, role: ViewerRole): boolean {
  return isLoggedIn && isAdmin(role);
}

export function canManageUsers(isLoggedIn: boolean, role: ViewerRole): boolean {
  return isLoggedIn && isAdmin(role);
}

export function canViewFullTabs(isLoggedIn: boolean): boolean {
  return !!isLoggedIn;
}

/** PDF / archivo: solo cuenta autenticada (usuario o admin). */
export function canDownloadTabPdf(isLoggedIn: boolean): boolean {
  return !!isLoggedIn;
}
