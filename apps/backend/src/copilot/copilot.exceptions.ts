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
    `El mensaje debe tener entre 1 y ${COPILOT.MAX_INPUT_CHARS} caracteres`,
  );
}

export function copilotDailyLimit(): CopilotHttpException {
  return new CopilotHttpException(
    HttpStatus.TOO_MANY_REQUESTS,
    'COPILOT_DAILY_LIMIT',
    'Llegaste al límite de 5 mensajes hoy',
  );
}

export function geminiUnavailable(): CopilotHttpException {
  return new CopilotHttpException(
    HttpStatus.SERVICE_UNAVAILABLE,
    'GEMINI_UNAVAILABLE',
    'El servicio de IA no está disponible, probá en un rato',
  );
}
