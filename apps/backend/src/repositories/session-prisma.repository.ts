import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session';
import { PrismaService } from '../prisma/prisma.service';

@Injectable() // 👈 NECESARIO PARA LA INYECCIÓN
export class SessionPrismaRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: Session): Promise<void> {
    await this.prisma.session.create({
      data: {
        tokenId: session.token,
        userId: session.userId,
        expiresAt: session.expiresAt,
      },
    });
  }

  async findByToken(tokenId: string): Promise<Session | null> {
    const record = await this.prisma.session.findUnique({
      where: { tokenId },
    });
    if (!record) return null;
    return Session.rehydrate(record.tokenId, record.userId, record.expiresAt);
  }

  async delete(tokenId: string): Promise<void> {
    await this.prisma.session.delete({ where: { tokenId } });
  }
}
