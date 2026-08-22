import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { theme } from "../theme/theme";
import { AdminRoute } from "./AdminRoute";
import { GuestOnlyRoute } from "./GuestOnlyRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import { NotFoundPage } from "../pages/NotFoundPage";

vi.mock("../api/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../api/hooks/useAuth";

type AuthStub = {
  isLoggedIn: boolean;
  userRole: "ADMIN" | "USER" | null;
};

function renderGuards(path: string, auth: AuthStub) {
  vi.mocked(useAuth).mockReturnValue(auth as ReturnType<typeof useAuth>);
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<div>home-page</div>} />
          <Route path="/login" element={<div>login-page</div>} />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <div>admin-users-page</div>
              </AdminRoute>
            }
          />
          <Route
            path="/private"
            element={
              <ProtectedRoute>
                <div>private-page</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <GuestOnlyRoute>
                <div>signin-form</div>
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/login-form"
            element={
              <GuestOnlyRoute>
                <div>login-form</div>
              </GuestOnlyRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe("route guards", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("sends a guest from /admin/users to /login", () => {
    renderGuards("/admin/users", { isLoggedIn: false, userRole: null });
    expect(screen.getByText("login-page")).toBeInTheDocument();
    expect(screen.queryByText("admin-users-page")).not.toBeInTheDocument();
  });

  it("sends a logged-in USER from /admin/users to /", () => {
    renderGuards("/admin/users", { isLoggedIn: true, userRole: "USER" });
    expect(screen.getByText("home-page")).toBeInTheDocument();
    expect(screen.queryByText("admin-users-page")).not.toBeInTheDocument();
  });

  it("lets an ADMIN see /admin/users", () => {
    renderGuards("/admin/users", { isLoggedIn: true, userRole: "ADMIN" });
    expect(screen.getByText("admin-users-page")).toBeInTheDocument();
  });

  it("sends a logged-in user from a guest-only login page to /", () => {
    renderGuards("/login-form", { isLoggedIn: true, userRole: "USER" });
    expect(screen.getByText("home-page")).toBeInTheDocument();
    expect(screen.queryByText("login-form")).not.toBeInTheDocument();
  });

  it("lets a guest stay on a guest-only page", () => {
    renderGuards("/signin", { isLoggedIn: false, userRole: null });
    expect(screen.getByText("signin-form")).toBeInTheDocument();
  });

  it("sends a guest from a protected route to /login with redirect", () => {
    renderGuards("/private", { isLoggedIn: false, userRole: null });
    expect(screen.getByText("login-page")).toBeInTheDocument();
    expect(screen.queryByText("private-page")).not.toBeInTheDocument();
  });

  it("renders a 404 for unknown paths", () => {
    renderGuards("/does-not-exist", { isLoggedIn: false, userRole: null });
    expect(screen.getByText("Page not found")).toBeInTheDocument();
  });
});
