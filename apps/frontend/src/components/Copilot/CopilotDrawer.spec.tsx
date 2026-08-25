import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CopilotDrawer } from "./CopilotDrawer";
import { theme } from "../../theme/theme";
import { api } from "../../api/client";

vi.mock("../../api/client", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

function renderDrawer(isLoggedIn: boolean) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <CopilotDrawer isLoggedIn={isLoggedIn} />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe("CopilotDrawer", () => {
  beforeEach(() => {
    vi.mocked(api.get).mockReset();
    vi.mocked(api.post).mockReset();
  });

  it("guest abre el drawer, invita a login y no llama a /copilot/*", async () => {
    const user = userEvent.setup();
    renderDrawer(false);

    await user.click(screen.getByTestId("copilot-fab"));

    expect(
      await screen.findByText(/Sign in to chat with Pua/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Message for Pua")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Send/i })).toBeDisabled();
    expect(api.get).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("logueado carga quota y un mensaje corto obtiene reply + chips", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValue({
      data: {
        used: 1,
        limit: 10,
        remaining: 9,
        resetAt: "2026-08-22T03:00:00.000Z",
        cooldownUntil: null,
        cooldownRemainingMs: 0,
      },
    });
    vi.mocked(api.post).mockResolvedValue({
      data: {
        reply: "I found these tabs by Milo J.",
        hits: [
          {
            id: 10,
            title: "Rara Vez",
            artist: "Milo J",
            genre: "Trap",
            instrument: "Guitar",
            viewCount: 0,
            createdAt: "2024-01-01",
            urlPdf: "https://hidden.example/file.pdf",
          },
        ],
        quota: {
          used: 2,
          remaining: 8,
          limit: 10,
          cooldownUntil: new Date(Date.now() + 60_000).toISOString(),
          cooldownRemainingMs: 60_000,
        },
      },
    });

    renderDrawer(true);
    await user.click(screen.getByTestId("copilot-fab"));

    expect(await screen.findByText("messages today 1/10")).toBeInTheDocument();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/copilot/quota");
    });

    await user.type(screen.getByLabelText("Message for Pua"), "Milo J");
    await user.click(screen.getByRole("button", { name: /Send/i }));

    expect(await screen.findByText("I found these tabs by Milo J.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search tab Rara Vez/i })).toBeInTheDocument();
    expect(screen.queryByText(/hidden.example/)).not.toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith("/copilot/chat", {
      message: "Milo J",
      history: [],
    });
  });

  it("logueado con cooldownUntil futuro deshabilita Send y muestra la espera", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValue({
      data: {
        used: 1,
        limit: 10,
        remaining: 9,
        resetAt: "2026-08-22T03:00:00.000Z",
        cooldownUntil: new Date(Date.now() + 47_000).toISOString(),
        cooldownRemainingMs: 47_000,
      },
    });

    renderDrawer(true);
    await user.click(screen.getByTestId("copilot-fab"));

    expect(await screen.findByTestId("copilot-cooldown")).toHaveTextContent(/Wait 0:4\d/);
    await user.type(screen.getByLabelText("Message for Pua"), "Milo J");
    expect(screen.getByRole("button", { name: /Send/i })).toBeDisabled();
    expect(api.post).not.toHaveBeenCalled();
  });
});
