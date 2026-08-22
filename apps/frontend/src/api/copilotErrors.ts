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
  "Could not send the message. Try again in a moment.";

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
      message: `You need to sign in to use ${COPILOT_UI.BRAND_NAME}`,
      redirectToLogin: true,
    };
  }

  if (status === 400 && code === "INPUT_TOO_LONG") {
    return {
      message: `Message is too long: maximum ${COPILOT_UI.MAX_INPUT_CHARS} characters`,
      redirectToLogin: false,
    };
  }

  if (status === 429 || code === "COPILOT_DAILY_LIMIT") {
    return {
      message: "You've reached the 5-message limit for today",
      redirectToLogin: false,
    };
  }

  if (status === 503) {
    return {
      message: "The AI service is unavailable, try again in a bit",
      redirectToLogin: false,
    };
  }

  return { message: FALLBACK, redirectToLogin: false };
}
