import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CaptureTabPdfButton } from "./CaptureTabPdfButton";
import { theme } from "../../theme/theme";
import { useAuth } from "../../api/hooks/useAuth";

vi.mock("../../api/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

function renderButton() {
  return render(
    <ThemeProvider theme={theme}>
      <CaptureTabPdfButton />
    </ThemeProvider>,
  );
}

describe("CaptureTabPdfButton", () => {
  beforeEach(() => {
    window.matchMedia = ((query: string) =>
      ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      })) as typeof window.matchMedia;
    vi.mocked(useAuth).mockReset();
  });

  it("is disabled for guests", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoggedIn: false, userRole: null } as ReturnType<typeof useAuth>);
    renderButton();
    expect(screen.getByRole("button", { name: /Capture tab PDF/i })).toBeDisabled();
  });

  it("is disabled for USER", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: true,
      userRole: "USER",
    } as ReturnType<typeof useAuth>);
    renderButton();
    expect(screen.getByRole("button", { name: /Capture tab PDF/i })).toBeDisabled();
  });

  it("opens the studio for ADMIN", () => {
    vi.mocked(useAuth).mockReturnValue({
      isLoggedIn: true,
      userRole: "ADMIN",
    } as ReturnType<typeof useAuth>);
    renderButton();
    const btn = screen.getByRole("button", { name: /Capture tab PDF/i });
    expect(btn).toBeEnabled();
    fireEvent.click(btn);
    expect(screen.getByRole("heading", { name: /Capture tab PDF/i })).toBeInTheDocument();
  });
});
