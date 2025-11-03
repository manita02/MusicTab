import { Injectable } from '@nestjs/common';
import { ITabRepository } from '@domain/repositories/ITabRepository';
import { Tab } from '@domain/entities/Tab';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TabPrismaRepository implements ITabRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(tab: Tab): Promise<Tab> {
    const record = await this.prisma.tab.create({
      data: {
        title: tab.title,
        urlPdf: tab.urlPdf.toString(),
        urlYoutube: tab.urlYoutube.toString(),
        urlImagen: tab.urlImg.toString(),
        userId: tab.userId,
        genreId: tab.genreId,
        instrumentId: tab.instrumentId,
      },
    });

    return Tab.rehydrate(
      record.id,
      record.title,
      record.userId,
      record.genreId,
      record.instrumentId,
      record.urlPdf,
      record.urlYoutube!,
      record.urlImagen!,
      record.createdAt
    );
  }

  async findById(id: number): Promise<Tab | null> {
    const record = await this.prisma.tab.findUnique({ where: { id } });
    if (!record) return null;
    return Tab.rehydrate(
      record.id,
      record.title,
      record.userId,
      record.genreId,
      record.instrumentId,
      record.urlPdf,
      record.urlYoutube!,
      record.urlImagen!,
      record.createdAt
    );
  }

  async findByUser(userId: number): Promise<Tab[]> {
    const records = await this.prisma.tab.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) =>
      Tab.rehydrate(
        r.id,
        r.title,
        r.userId,
        r.genreId,
        r.instrumentId,
        r.urlPdf,
        r.urlYoutube!,
        r.urlImagen!,
        r.createdAt
      )
    );
  }

  async countByUserAndDate(userId: number, date: Date): Promise<number> {
    if (!this.prisma || !this.prisma.tab) {
      console.error('Prisma o prisma.tab es undefined!', this.prisma);
      throw new Error('Prisma o prisma.tab no está definido');
    }
  
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
  
    const count = await this.prisma.tab.count({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    return count;
  }
  

  async delete(id: number): Promise<void> {
    await this.prisma.tab.delete({ where: { id } });
  }

  async findByTitle(title: string): Promise<Tab | null> {
    const record = await this.prisma.tab.findUnique({ where: { title } });
    if (!record) return null;
    return Tab.rehydrate(
      record.id,
      record.title,
      record.userId,
      record.genreId,
      record.instrumentId,
      record.urlPdf,
      record.urlYoutube!,
      record.urlImagen!,
      record.createdAt
    );
  }

  async findLatest(limit: number): Promise<Tab[]> {
    const records = await this.prisma.tab.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return records.map(r =>
      Tab.rehydrate(
        r.id,
        r.title,
        r.userId,
        r.genreId,
        r.instrumentId,
        r.urlPdf,
        r.urlYoutube!,
        r.urlImagen!,
        r.createdAt,
        r.user.username
      )
    );
  }

  async findAll(): Promise<Tab[]> {
    const result = await this.prisma.tab.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return result.map((t) =>
      Tab.rehydrate(
        t.id,
        t.title,
        t.userId,
        t.genreId,
        t.instrumentId,
        t.urlPdf,
        t.urlYoutube,
        t.urlImagen,
        t.createdAt,
        t.user.username
      )
    );
  }

  async update(tab: Tab): Promise<Tab> {
    if (!tab.id) {
      throw new Error("Cannot update a tab without an ID");
    }

    const record = await this.prisma.tab.update({
      where: { id: tab.id },
      data: {
        title: tab.title,
        urlPdf: tab.urlPdf.toString(),
        urlYoutube: tab.urlYoutube.toString(),
        urlImagen: tab.urlImg.toString(),
        genreId: tab.genreId,
        instrumentId: tab.instrumentId,
      },
    });

    return Tab.rehydrate(
      record.id,
      record.title,
      record.userId,
      record.genreId,
      record.instrumentId,
      record.urlPdf,
      record.urlYoutube!,
      record.urlImagen!,
      record.createdAt
    );
  }
}