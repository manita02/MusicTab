import { Controller, Post, Body, Get, Query, Put, Param, Delete } from '@nestjs/common';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { TabPrismaRepository } from '../repositories/tab-prisma.repository';
import { CreateTab } from '@domain/use-cases/CreateTab';
import { GetLatestTabs } from '@domain/use-cases/GetLatestTabs';
import { GetAllTabs } from '@domain/use-cases/GetAllTabs';
import { UpdateTab } from '@domain/use-cases/UpdateTab';
import { DeleteTab } from '@domain/use-cases/DeleteTab';

type CreateTabDTO = {
  title: string;
  userId: number;
  genreId: number;
  instrumentId: number;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
};

@Controller('tabs')
export class TabController {
  private readonly createTab: CreateTab;
  private readonly getLatestTabs: GetLatestTabs;
  private readonly getAllTabs: GetAllTabs;
  private readonly updateTab: UpdateTab;
  private readonly deleteTab: DeleteTab;

  constructor(
    private readonly userRepo: UserPrismaRepository,
    private readonly tabRepo: TabPrismaRepository,
  ) {
    this.createTab = new CreateTab(this.tabRepo, this.userRepo);
    this.getLatestTabs = new GetLatestTabs(this.tabRepo);
    this.getAllTabs = new GetAllTabs(this.tabRepo);
    this.updateTab = new UpdateTab(this.tabRepo, this.userRepo);
    this.deleteTab = new DeleteTab(this.tabRepo, this.userRepo);
  }

  @Post('create')
  async create(@Body() dto: CreateTabDTO) {
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
  }


  @Get('latest')
  async latest(@Query('limit') limit = 8) {
    const tabs = await this.getLatestTabs.execute(Number(limit));
    return tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      genreId: tab.genreId,
      instrumentId: tab.instrumentId,
      userId: tab.userId,
      userName: tab.userName,
      createdAt: tab.createdAt,
      urlPdf: tab.urlPdf.toString(),
      urlYoutube: tab.urlYoutube.toString(),
      urlImg: tab.urlImg.toString(),
    }));
  }

  @Get('all')
  async getAll() {
    const tabs = await this.getAllTabs.execute();
    return tabs.map(tab => ({
      id: tab.id,
      title: tab.title,
      genreId: tab.genreId,
      instrumentId: tab.instrumentId,
      userId: tab.userId,
      userName: tab.userName,
      createdAt: tab.createdAt,
      urlPdf: tab.urlPdf.toString(),
      urlYoutube: tab.urlYoutube.toString(),
      urlImg: tab.urlImg.toString(),
    }));
  }

  @Put('update/:id')
  async update(@Param('id') id: string, @Body() dto: any) {
    const updated = await this.updateTab.execute({
        id: Number(id),
        userId: dto.userId,
        title: dto.title,
        genreId: dto.genreId,
        instrumentId: dto.instrumentId,
        urlPdf: dto.urlPdf,
        urlYoutube: dto.urlYoutube,
        urlImg: dto.urlImg,
      });

      return {
        id: updated.id,
        title: updated.title,
        userId: updated.userId,
        genreId: updated.genreId,
        instrumentId: updated.instrumentId,
        urlPdf: updated.urlPdf,
        urlYoutube: updated.urlYoutube,
        urlImg: updated.urlImg,
      }; 
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Body('userId') userId: number) {
    await this.deleteTab.execute(Number(id), userId);
    return { success: true, message: 'Tab deleted successfully' };
  }
}