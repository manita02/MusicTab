import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@domain/entities/User';

export type RequestUser = { id: number; role: Role };

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as RequestUser;
});
