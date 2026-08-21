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
      await screen.findByText(/Iniciá sesión para chatear con Copilot/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Mensaje para Copilot")).toBeDisabled();
    expect(screen.getByRole("button", { name: /Enviar/i })).toBeDisabled();
    expect(api.get).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("logueado carga quota y un mensaje corto obtiene reply + chips", async () => {
    const user = userEvent.setup();
    vi.mocked(api.get).mockResolvedValue({
      data: { used: 1, limit: 5, remaining: 4, resetAt: "2026-08-22T03:00:00.000Z" },
    });
    vi.mocked(api.post).mockResolvedValue({
      data: {
        reply: "Encontré estas tabs de Milo J.",
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
        quota: { used: 2, remaining: 3, limit: 5 },
      },
    });

    renderDrawer(true);
    await user.click(screen.getByTestId("copilot-fab"));

    expect(await screen.findByText("mensajes hoy 1/5")).toBeInTheDocument();
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/copilot/quota");
    });

    await user.type(screen.getByLabelText("Mensaje para Copilot"), "Milo J");
    await user.click(screen.getByRole("button", { name: /Enviar/i }));

    expect(await screen.findByText("Encontré estas tabs de Milo J.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Buscar tab Rara Vez/i })).toBeInTheDocument();
    expect(screen.queryByText(/hidden.example/)).not.toBeInTheDocument();
    expect(api.post).toHaveBeenCalledWith("/copilot/chat", {
      message: "Milo J",
      history: [],
    });
  });
});
