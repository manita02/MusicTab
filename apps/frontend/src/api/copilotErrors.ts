import axios from "axios";
import { COPILOT_UI } from "./copilot.constants";

type CopilotApiErrorBody = {
  code?: string;
  message?: string | string[];
};

export type CopilotClientError = {
  message: string;
  redirectToLogin: boolean;
};

const FALLBACK =
  "No se pudo enviar el mensaje. Probá de nuevo en un momento.";

function bodyOf(error: unknown): CopilotApiErrorBody | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data = error.response?.data;
  if (!data || typeof data !== "object") return undefined;
  return data as CopilotApiErrorBody;
}

export function copilotErrorFromUnknown(error: unknown): CopilotClientError {
  if (!axios.isAxiosError(error)) {
    return { message: FALLBACK, redirectToLogin: false };
  }

  const status = error.response?.status;
  const code = bodyOf(error)?.code;

  if (status === 401) {
    return {
      message: "Tenés que iniciar sesión para usar Copilot",
      redirectToLogin: true,
    };
  }

  if (status === 400 && code === "INPUT_TOO_LONG") {
    return {
      message: `El mensaje es demasiado largo: máximo ${COPILOT_UI.MAX_INPUT_CHARS} caracteres`,
      redirectToLogin: false,
    };
  }

  if (status === 429 || code === "COPILOT_DAILY_LIMIT") {
    return {
      message: "Llegaste al límite de 5 mensajes hoy",
      redirectToLogin: false,
    };
  }

  if (status === 503) {
    return {
      message: "El servicio de IA no está disponible, probá en un rato",
      redirectToLogin: false,
    };
  }

  return { message: FALLBACK, redirectToLogin: false };
}
