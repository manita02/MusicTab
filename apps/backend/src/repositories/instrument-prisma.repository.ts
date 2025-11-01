import { Injectable } from '@nestjs/common';
import { IInstrumentRepository } from '@domain/repositories/IInstrumentRepository';
import { Instrument } from '@domain/entities/Instrument';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstrumentPrismaRepository implements IInstrumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Instrument[]> {
    const records = await this.prisma.instrument.findMany();
    return records.map(r => Instrument.rehydrate(r.id, r.name));
  }

  async findById(id: number): Promise<Instrument | null> {
    const record = await this.prisma.instrument.findUnique({ where: { id } });
    if (!record) return null;
    return Instrument.rehydrate(record.id, record.name);
  }
}