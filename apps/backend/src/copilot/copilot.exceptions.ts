import { HttpException, HttpStatus } from '@nestjs/common';
import { COPILOT } from './copilot.constants';

export class CopilotHttpException extends HttpException {
  readonly copilotCode: string;

  constructor(status: number, code: string, message: string) {
    super({ statusCode: status, code, message }, status);
    this.copilotCode = code;
  }
}

export function inputTooLong(): CopilotHttpException {
  return new CopilotHttpException(
    HttpStatus.BAD_REQUEST,
    'INPUT_TOO_LONG',
    `Message must be between 1 and ${COPILOT.MAX_INPUT_CHARS} characters`,
  );
}

export function copilotDailyLimit(): CopilotHttpException {
  return new CopilotHttpException(
    HttpStatus.TOO_MANY_REQUESTS,
    'COPILOT_DAILY_LIMIT',
    "You've reached the 5-message limit for today",
  );
}

export function geminiUnavailable(): CopilotHttpException {
  return new CopilotHttpException(
    HttpStatus.SERVICE_UNAVAILABLE,
    'GEMINI_UNAVAILABLE',
    'The AI service is unavailable, try again in a bit',
  );
}
