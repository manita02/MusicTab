import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateTabDialog } from "./CreateTabDialog";
import { theme } from "../theme/theme";

vi.mock("../api/hooks/useAuth", () => ({
  useAuth: () => ({ isLoggedIn: true, userRole: "ADMIN" }),
}));

vi.mock("../api/hooks/useCreateTab", () => ({
  useCreateTab: () => ({ mutate: vi.fn(), isPending: false }),
}));

const createGenre = vi.fn();

vi.mock("../api/hooks/useCatalog", () => ({
  useGenres: () => ({ data: [{ id: 1, name: "Rock" }], isLoading: false }),
  useInstruments: () => ({ data: [{ id: 1, name: "Guitar", urlIco: "" }], isLoading: false }),
  useCreateGenre: () => ({ mutate: createGenre, isPending: false }),
  useUpdateGenre: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteGenre: () => ({ mutate: vi.fn(), isPending: false }),
}));

function desktopMatchMedia(query: string): MediaQueryList {
  return {
    matches: true,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
}

describe("CreateTabDialog genre manager", () => {
  beforeEach(() => {
    window.matchMedia = desktopMatchMedia as typeof window.matchMedia;
    createGenre.mockReset();
  });

  it("opens the manage genres modal from the create tab form", () => {
    render(
      <ThemeProvider theme={theme}>
        <CreateTabDialog open onClose={() => {}} onSave={() => {}} />
      </ThemeProvider>,
    );

    expect(screen.queryByRole("heading", { name: "Manage genres" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Manage genres/i }));
    expect(screen.getByRole("heading", { name: "Manage genres" })).toBeInTheDocument();
  });
});
