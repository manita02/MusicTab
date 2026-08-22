import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatsPage } from "./StatsPage";
import { theme } from "../theme/theme";
import { api } from "../api/client";

vi.mock("../api/client", () => ({
  api: {
    get: vi.fn(),
    defaults: { baseURL: "http://localhost:3000" },
  },
}));

vi.mock("../api/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../api/hooks/useAuth";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <StatsPage />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("StatsPage", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    localStorage.clear();
  });

  it("guest sees community stats, login CTA, and does not call /stats/me", async () => {
    vi.mocked(useAuth).mockReturnValue({ isLoggedIn: false } as ReturnType<typeof useAuth>);
    vi.mocked(api.get).mockResolvedValue({
      data: {
        most: [{ id: 1, title: "Rara Vez", artist: "Milo J", genre: "Trap", instrument: "Guitar", viewCount: 4, createdAt: "2024" }],
        least: [{ id: 2, title: "Quiet Tab", artist: "A", genre: "Jazz", instrument: "Piano", viewCount: 1, createdAt: "2024" }],
      },
    });

    renderPage();

    expect(await screen.findByText("Your listening vs the community.")).toBeInTheDocument();
    expect(screen.getByText("Based on PDF opens")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sign in to see your stats/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /For you/i })).toBeDisabled();
    expect(await screen.findByText("Rara Vez")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    expect(vi.mocked(api.get).mock.calls.every((c) => String(c[0]).includes("/stats/global"))).toBe(true);
    expect(vi.mocked(api.get).mock.calls.some((c) => String(c[0]).includes("/stats/me"))).toBe(false);
  });

  it("logged-in user can open For you and navigates from a bar", async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({ isLoggedIn: true } as ReturnType<typeof useAuth>);
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (String(url).includes("/stats/me")) {
        return {
          data: {
            kpis: { events: 3, distinctTabs: 2, catalogTotal: 8, coveragePct: 25 },
            lastViewed: { id: 1, title: "Rara Vez", artist: "Milo J", genre: "Trap", instrument: "Guitar", viewCount: 4, createdAt: "2024", lastViewedAt: "2024-01-01" },
            most: [{ id: 1, title: "Rara Vez", artist: "Milo J", genre: "Trap", instrument: "Guitar", viewCount: 4, userViewCount: 3, createdAt: "2024" }],
            least: [],
            never: [{ id: 9, title: "Unseen", artist: "B", genre: "Rock", instrument: "Guitar", viewCount: 0, createdAt: "2024" }],
            stale: [],
          },
        };
      }
      return { data: { most: [], least: [] } };
    });

    renderPage();

    expect(await screen.findByText("Last opened")).toBeInTheDocument();
    expect(screen.getByText("Pick up again")).toBeInTheDocument();
    expect(screen.getByText("Never opened")).toBeInTheDocument();
    expect(screen.queryByText(/tabs opened/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Rara Vez by Milo J, 3 opens/i }));
  });

  it("does not put a tab opened today into Pick up again", async () => {
    vi.mocked(useAuth).mockReturnValue({ isLoggedIn: true } as ReturnType<typeof useAuth>);
    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (String(url).includes("/stats/me")) {
        return {
          data: {
            kpis: { events: 2, distinctTabs: 2, catalogTotal: 4, coveragePct: 50 },
            lastViewed: null,
            most: [
              { id: 1, title: "Luciérnagas", artist: "Milo J", genre: "Trap", instrument: "Guitar", viewCount: 1, userViewCount: 1, createdAt: "2024" },
            ],
            least: [],
            never: [],
            stale: [
              {
                id: 1,
                title: "Luciérnagas",
                artist: "Milo J",
                genre: "Trap",
                instrument: "Guitar",
                viewCount: 1,
                createdAt: "2024",
                lastViewedAt: new Date().toISOString(),
              },
            ],
          },
        };
      }
      return { data: { most: [], least: [] } };
    });

    renderPage();

    expect(await screen.findByText("Pick up again")).toBeInTheDocument();
    expect(screen.getByText("You are all caught up")).toBeInTheDocument();
    expect(screen.queryByText(/Last opened/)).not.toBeInTheDocument();
  });
});
