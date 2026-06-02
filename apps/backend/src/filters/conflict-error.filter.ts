import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainError } from '@domain/errors/DomainError';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status =
      exception.code === 'Conflict'
        ? HttpStatus.CONFLICT
        : exception.code === 'AuthError'
          ? HttpStatus.FORBIDDEN
          : HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      code: exception.code,
    });
  }
}
