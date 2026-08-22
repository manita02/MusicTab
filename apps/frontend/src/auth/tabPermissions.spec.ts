import { describe, it, expect } from "vitest";
import { canDownloadTabPdf, canManageTabs, canManageUsers, normalizeRole } from "./tabPermissions";

describe("tabPermissions", () => {
  it("solo admin puede CRUD administrativo", () => {
    expect(canManageTabs(true, normalizeRole("ADMIN"))).toBe(true);
    expect(canManageTabs(true, normalizeRole("USER"))).toBe(false);
    expect(canManageTabs(false, normalizeRole(null))).toBe(false);
  });

  it("solo admin puede gestionar usuarios", () => {
    expect(canManageUsers(true, normalizeRole("ADMIN"))).toBe(true);
    expect(canManageUsers(true, normalizeRole("USER"))).toBe(false);
    expect(canManageUsers(false, normalizeRole(null))).toBe(false);
  });

  it("cualquier usuario logueado puede descargar (según política UX)", () => {
    expect(canDownloadTabPdf(true)).toBe(true);
    expect(canDownloadTabPdf(false)).toBe(false);
  });
});
