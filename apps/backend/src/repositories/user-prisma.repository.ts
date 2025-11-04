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
      record.createdAt,
      record.birthDate,
      record.urlImg
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
      record.createdAt,
      record.birthDate,
      record.urlImg
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
      record.createdAt,
      record.birthDate,
      record.urlImg
    );
  }
  
  async save(user: User): Promise<User> {
    // If id exists, update; if not, create
    let record;
    if (user.id) {
      record = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          username: user.username,
          email: user.email.toString(),
          passwordHash: user.passwordHash,
          role: user.role,
          birthDate: user.birthDate,
          urlImg: user.urlImg.toString(),
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
          birthDate: user.birthDate,
          urlImg: user.urlImg.toString(),
        },
      });
    }

    return User.rehydrate(
      record.id,
      record.username,
      record.email,
      record.passwordHash,
      record.role as Role,
      record.createdAt,
      record.birthDate,
      record.urlImg
    );
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
