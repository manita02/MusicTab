import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { copilotErrorFromUnknown } from "./copilotErrors";

function axiosError(status: number, data: unknown): AxiosError {
  const error = new AxiosError("fail");
  error.status = status;
  error.response = {
    status,
    data,
    statusText: "Error",
    headers: {},
    config: { headers: new AxiosHeaders() } as InternalAxiosRequestConfig,
  };
  return error;
}

describe("copilotErrorFromUnknown", () => {
  it("401 invita a login", () => {
    const mapped = copilotErrorFromUnknown(axiosError(401, { code: "UNAUTHORIZED" }));
    expect(mapped.redirectToLogin).toBe(true);
    expect(mapped.message).toMatch(/iniciar sesión/i);
  });

  it("400 INPUT_TOO_LONG explica el máximo", () => {
    const mapped = copilotErrorFromUnknown(
      axiosError(400, { code: "INPUT_TOO_LONG" }),
    );
    expect(mapped.redirectToLogin).toBe(false);
    expect(mapped.message).toMatch(/100/);
  });

  it("429 COPILOT_DAILY_LIMIT muestra el tope diario", () => {
    const mapped = copilotErrorFromUnknown(
      axiosError(429, { code: "COPILOT_DAILY_LIMIT" }),
    );
    expect(mapped.message).toBe("Llegaste al límite de 5 mensajes hoy");
  });

  it("503 avisa que la IA no está disponible", () => {
    const mapped = copilotErrorFromUnknown(
      axiosError(503, { code: "GEMINI_UNAVAILABLE" }),
    );
    expect(mapped.message).toBe(
      "El servicio de IA no está disponible, probá en un rato",
    );
  });
});
