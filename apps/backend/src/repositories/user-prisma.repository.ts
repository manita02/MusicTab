import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User, Role } from '@domain/entities/User';
import { signupIpLookupValues } from '@domain/value-objects/SignupIp';

type UserRecord = {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  birthDate: Date;
  urlImg: string;
  signupIp: string | null;
};

function coerceRole(role: string): Role {
  const r = (role ?? '').trim().toUpperCase();
  return r === Role.ADMIN ? Role.ADMIN : Role.USER;
}

function toUser(record: UserRecord): User {
  return User.rehydrate(
    record.id,
    record.username,
    record.email,
    record.passwordHash,
    coerceRole(record.role),
    record.createdAt,
    record.birthDate,
    record.urlImg,
    record.signupIp,
  );
}

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!record) return null;
    return toUser(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!record) return null;
    return toUser(record);
  }

  async findByUsername(username: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!record) return null;
    return toUser(record);
  }

  async findBySignupIp(ip: string): Promise<User[]> {
    const values = signupIpLookupValues(ip);
    const records = await this.prisma.user.findMany({
      where: { signupIp: { in: values } },
    });
    return records.map(toUser);
  }

  async findAll(): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }, { username: 'asc' }],
    });
    return records.map(toUser);
  }

  async findByUsernameInsensitive(username: string): Promise<User | null> {
    const exact = await this.findByUsername(username.trim());
    if (exact) return exact;
    const q = username.trim().toLowerCase();
    if (!q) return null;
    const rows = await this.prisma.user.findMany();
    const record = rows.find((row: { username: string }) => row.username.toLowerCase() === q);
    if (!record) return null;
    return toUser(record);
  }

  async save(user: User): Promise<User> {
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
          signupIp: user.signupIp,
        },
      });
    }

    return toUser(record);
  }

  async deleteById(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
