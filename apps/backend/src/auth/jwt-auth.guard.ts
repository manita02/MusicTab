import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenService } from '../services/token.service';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { SessionPrismaRepository } from '../repositories/session-prisma.repository';
import { Role } from '@domain/entities/User';
import { IS_PUBLIC_KEY } from './auth.constants';
import { RequestUser } from './decorators/current-user.decorator';

function normalizeBearerAuth(header?: string): string | null {
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim();
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
    private readonly sessionRepo: SessionPrismaRepository,
    private readonly userRepo: UserPrismaRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request & { user?: RequestUser }>();
    const token = normalizeBearerAuth(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const sessionOk = await this.sessionRepo.isTokenValid(token);
    if (!sessionOk) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    let payload: { userId?: number };
    try {
      payload = (await this.tokenService.verify(token)) as { userId?: number };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.userId;
    if (typeof userId !== 'number') {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.userRepo.findById(userId);
    if (!user || user.id == null) {
      throw new UnauthorizedException('User not found');
    }

    req.user = { id: user.id, role: user.role as Role };
    return true;
  }
}
