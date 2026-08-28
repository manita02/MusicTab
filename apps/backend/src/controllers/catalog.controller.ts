import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GenrePrismaRepository } from '../repositories/genre-prisma.repository';
import { InstrumentPrismaRepository } from '../repositories/instrument-prisma.repository';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@domain/entities/User';
import { CreateGenre } from '@domain/use-cases/CreateGenre';
import { UpdateGenre } from '@domain/use-cases/UpdateGenre';
import { DeleteGenre } from '@domain/use-cases/DeleteGenre';
import { DomainError } from '@domain/errors/DomainError';

type GenreDTO = { id: number; name: string };
type InstrumentDTO = { id: number; name: string; urlIco: string };
type GenreBody = { name: string };

@Controller('catalogs')
export class CatalogController {
  private readonly createGenre: CreateGenre;
  private readonly updateGenre: UpdateGenre;
  private readonly deleteGenre: DeleteGenre;

  constructor(
    private readonly genreRepo: GenrePrismaRepository,
    private readonly instrumentRepo: InstrumentPrismaRepository,
    userRepo: UserPrismaRepository,
  ) {
    this.createGenre = new CreateGenre(this.genreRepo, userRepo);
    this.updateGenre = new UpdateGenre(this.genreRepo, userRepo);
    this.deleteGenre = new DeleteGenre(this.genreRepo, userRepo);
  }

  @Public()
  @Get('genres')
  async getGenres(): Promise<GenreDTO[]> {
    const genres = await this.genreRepo.findAll();
    return genres.map((g) => ({ id: g.id, name: g.name }));
  }

  @Public()
  @Get('instruments')
  async getInstruments(): Promise<InstrumentDTO[]> {
    const instruments = await this.instrumentRepo.findAll();
    return instruments.map((i) => ({ id: i.id, name: i.name, urlIco: i.urlIco }));
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post('genres')
  async create(@CurrentUser() user: RequestUser, @Body() dto: GenreBody): Promise<GenreDTO> {
    const genre = await this.createGenre.execute({ userId: user.id, name: dto.name ?? '' });
    return { id: genre.id, name: genre.name };
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Put('genres/:id')
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: GenreBody,
  ): Promise<GenreDTO> {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new DomainError('InvalidId', 'ID must be a number');
    }
    const genre = await this.updateGenre.execute({
      userId: user.id,
      id: numericId,
      name: dto.name ?? '',
    });
    return { id: genre.id, name: genre.name };
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('genres/:id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string): Promise<void> {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new DomainError('InvalidId', 'ID must be a number');
    }
    await this.deleteGenre.execute({ userId: user.id, id: numericId });
  }
}
