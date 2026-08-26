import { describe, it, expect } from "vitest";
import {
  canDownloadTabPdf,
  canManageTabs,
  canManageUsers,
  canMutateTab,
  normalizeRole,
} from "./tabPermissions";

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

  it("admin dueño puede mutar su tab", () => {
    expect(canMutateTab(true, "ADMIN", 7, 7)).toBe(true);
    expect(canMutateTab(true, "ADMIN", "7", 7)).toBe(true);
  });

  it("admin no puede mutar una tab de otro", () => {
    expect(canMutateTab(true, "ADMIN", 7, 9)).toBe(false);
  });

  it("USER no puede mutar tabs", () => {
    expect(canMutateTab(true, "USER", 7, 7)).toBe(false);
  });

  it("guest no puede mutar tabs", () => {
    expect(canMutateTab(false, null, null, 7)).toBe(false);
    expect(canMutateTab(false, "ADMIN", 7, 7)).toBe(false);
  });
});
