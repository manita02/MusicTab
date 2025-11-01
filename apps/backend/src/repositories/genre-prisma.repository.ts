import { Injectable } from '@nestjs/common';
import { IGenreRepository } from '@domain/repositories/IGenreRepository';
import { Genre } from '@domain/entities/Genre';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenrePrismaRepository implements IGenreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Genre[]> {
    const records = await this.prisma.genre.findMany();
    return records.map(r => Genre.rehydrate(r.id, r.name));
  }

  async findById(id: number): Promise<Genre | null> {
    const record = await this.prisma.genre.findUnique({ where: { id } });
    if (!record) return null;
    return Genre.rehydrate(record.id, record.name);
  }
}