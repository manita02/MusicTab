import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { COPILOT } from './copilot.constants';
import { inputTooLong } from './copilot.exceptions';

function flattenErrors(errors: ValidationError[]): ValidationError[] {
  return errors.flatMap((error) => [error, ...flattenErrors(error.children ?? [])]);
}

export function copilotValidationExceptionFactory(errors: ValidationError[]) {
  const all = flattenErrors(errors);
  if (all.some((error) => error.property === 'message')) {
    return inputTooLong();
  }
  return new BadRequestException({
    statusCode: 400,
    code: 'BAD_REQUEST',
    message: all.flatMap((error) => Object.values(error.constraints ?? {})),
  });
}

export const copilotValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: copilotValidationExceptionFactory,
});

export function assertMessageLength(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length === 0 || trimmed.length > COPILOT.MAX_INPUT_CHARS) {
    throw inputTooLong();
  }
  return trimmed;
}
