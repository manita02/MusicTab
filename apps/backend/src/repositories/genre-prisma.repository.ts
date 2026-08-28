import { Injectable } from '@nestjs/common';
import { IGenreRepository } from '@domain/repositories/IGenreRepository';
import { Genre } from '@domain/entities/Genre';
import { ConflictError } from '@domain/errors/DomainError';
import { PrismaService } from '../prisma/prisma.service';

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  );
}

@Injectable()
export class GenrePrismaRepository implements IGenreRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Genre[]> {
    const records = await this.prisma.genre.findMany({ orderBy: { name: 'asc' } });
    return records.map((r: { id: number; name: string }) => Genre.rehydrate(r.id, r.name));
  }

  async findById(id: number): Promise<Genre | null> {
    const record = await this.prisma.genre.findUnique({ where: { id } });
    if (!record) return null;
    return Genre.rehydrate(record.id, record.name);
  }

  async findByName(name: string): Promise<Genre | null> {
    const record = await this.prisma.genre.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } },
    });
    if (!record) return null;
    return Genre.rehydrate(record.id, record.name);
  }

  async save(genre: Genre): Promise<Genre> {
    try {
      if (genre.id > 0) {
        const existing = await this.prisma.genre.findUnique({ where: { id: genre.id } });
        if (existing) {
          const record = await this.prisma.genre.update({
            where: { id: genre.id },
            data: { name: genre.name },
          });
          return Genre.rehydrate(record.id, record.name);
        }
      }

      const record = await this.prisma.genre.create({
        data: { name: genre.name },
      });
      return Genre.rehydrate(record.id, record.name);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError('A genre with that name already exists');
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    await this.prisma.genre.delete({ where: { id } });
  }

  async countTabsByGenreId(id: number): Promise<number> {
    return this.prisma.tab.count({ where: { genreId: id } });
  }
}
