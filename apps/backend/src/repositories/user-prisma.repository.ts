import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '@domain/repositories/IUserRepository';

import { User, Role } from '@domain/entities/User';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!record) return null;

    return User.rehydrate(
      record.id,
      record.username,
      record.email,
      record.passwordHash,
      record.role as Role,
      record.createdAt
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!record) return null;

    return User.rehydrate(
      record.id,
      record.username,
      record.email,
      record.passwordHash,
      record.role as Role,
      record.createdAt
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!record) return null;
    return User.rehydrate(
      record.id,
      record.username,
      record.email,
      record.passwordHash,
      record.role as Role,
      record.createdAt
    );
  }
  
  async save(user: User): Promise<User> {
    // si id existe, hace update; si no, create
    let record;
    if (user.id) {
      record = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          username: user.username,
          email: user.email.toString(),
          passwordHash: user.passwordHash,
          role: user.role,
        },
      });
    } else {
      record = await this.prisma.user.create({
        data: {
          username: user.username,
          email: user.email.toString(),
          passwordHash: user.passwordHash,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    }

    return User.rehydrate(
      record.id,
      record.username,
      record.email,
      record.passwordHash,
      record.role as Role,
      record.createdAt
    );
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
