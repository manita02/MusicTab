import { Controller, Get } from '@nestjs/common';
import { GenrePrismaRepository } from '../repositories/genre-prisma.repository';
import { InstrumentPrismaRepository } from '../repositories/instrument-prisma.repository';

type GenreDTO = { id: number; name: string };
type InstrumentDTO = { id: number; name: string };

@Controller('catalogs')
export class CatalogController {
  constructor(
    private readonly genreRepo: GenrePrismaRepository,
    private readonly instrumentRepo: InstrumentPrismaRepository,
  ) {}

  @Get('genres')
  async getGenres(): Promise<GenreDTO[]> {
    const genres = await this.genreRepo.findAll();
    return genres.map(g => ({ id: g.id, name: g.name }));
  }

  @Get('instruments')
  async getInstruments(): Promise<InstrumentDTO[]> {
    const instruments = await this.instrumentRepo.findAll();
    return instruments.map(i => ({ id: i.id, name: i.name }));
  }
}