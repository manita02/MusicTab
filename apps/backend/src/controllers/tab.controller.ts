import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { TabPrismaRepository } from '../repositories/tab-prisma.repository';
import { CreateTab } from '@domain/use-cases/CreateTab';
import { ConflictErrorFilter } from '../filters/conflict-error.filter';
import { DomainError } from '@domain/errors/DomainError';

type CreateTabDTO = {
  title: string;
  userId: number;
  genreId: number;
  instrumentId: number;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
};

@UseFilters(ConflictErrorFilter)
@Controller('tabs')
export class TabController {
  private readonly createTab: CreateTab;

  constructor(
    private readonly userRepo: UserPrismaRepository,
    private readonly tabRepo: TabPrismaRepository,
  ) {
    this.createTab = new CreateTab(this.tabRepo, this.userRepo);
  }

  @Post('create')
  async create(@Body() dto: CreateTabDTO) {
    try {
      const tab = await this.createTab.execute(dto);
      return {
        id: tab.id,
        title: tab.title,
        genreId: tab.genreId,
        instrumentId: tab.instrumentId,
        userId: tab.userId,
        createdAt: tab.createdAt,
        urlPdf: tab.urlPdf.toString(),
        urlYoutube: tab.urlYoutube.toString(),
        urlImg: tab.urlImg.toString(),
      };
    } catch (error) {
      console.error('Error en TabController.create:', error);
      if (error instanceof DomainError) {
        return { error: error.name, message: error.message };
      }
      throw error;
    }
  }
}