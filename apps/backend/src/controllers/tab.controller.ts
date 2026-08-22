import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  BadGatewayException,
  Res,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserPrismaRepository } from '../repositories/user-prisma.repository';
import { TabPrismaRepository } from '../repositories/tab-prisma.repository';
import { CreateTab } from '@domain/use-cases/CreateTab';
import { GetLatestTabs } from '@domain/use-cases/GetLatestTabs';
import { GetAllTabs } from '@domain/use-cases/GetAllTabs';
import { UpdateTab } from '@domain/use-cases/UpdateTab';
import { DeleteTab } from '@domain/use-cases/DeleteTab';
import { RecordTabView } from '@domain/use-cases/RecordTabView';
import { Role } from '@domain/entities/User';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { Tab } from '@domain/entities/Tab';
import { extractYouTubeVideoId } from '../utils/youtube';
import { fetchSafeCover } from '../utils/safe-cover-url';

type CreateTabBody = {
  title: string;
  artist: string;
  genreId: number;
  instrumentId: number;
  urlPdf: string;
  urlYoutube: string;
  urlImg: string;
};

type UpdateTabBody = {
  title?: string;
  artist?: string;
  genreId?: number;
  instrumentId?: number;
  urlPdf?: string;
  urlYoutube?: string;
  urlImg?: string;
};

@Controller('tabs')
export class TabController {
  private readonly createTab: CreateTab;
  private readonly getLatestTabs: GetLatestTabs;
  private readonly getAllTabs: GetAllTabs;
  private readonly updateTab: UpdateTab;
  private readonly deleteTab: DeleteTab;
  private readonly recordTabView: RecordTabView;

  constructor(
    private readonly userRepo: UserPrismaRepository,
    private readonly tabRepo: TabPrismaRepository,
  ) {
    this.createTab = new CreateTab(this.tabRepo, this.userRepo);
    this.getLatestTabs = new GetLatestTabs(this.tabRepo);
    this.getAllTabs = new GetAllTabs(this.tabRepo);
    this.updateTab = new UpdateTab(this.tabRepo, this.userRepo);
    this.deleteTab = new DeleteTab(this.tabRepo, this.userRepo);
    this.recordTabView = new RecordTabView(this.tabRepo);
  }

  /**
   * Portada servida por el backend: el cliente público no recibe la URL real de la imagen en el JSON.
   */
  @Public()
  @Get('public/:id/cover')
  async publicCoverImage(@Param('id') id: string, @Res({ passthrough: false }) res: Response) {
    const tab = await this.tabRepo.findById(Number(id));
    if (!tab || tab.id == null) {
      throw new NotFoundException('Tab not found');
    }
    const upstream = tab.urlImg.toString();
    try {
      const ac = new AbortController();
      const t = setTimeout(() => ac.abort(), 12_000);
      const r = await fetchSafeCover(upstream, ac.signal);
      clearTimeout(t);
      if (!r.ok) {
        throw new BadGatewayException('Cover upstream error');
      }
      const ct = r.headers.get('content-type') ?? 'application/octet-stream';
      const buf = Buffer.from(await r.arrayBuffer());
      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.send(buf);
    } catch {
      throw new BadGatewayException('Cover unavailable');
    }
  }

  /**
   * Listado público: sin urlPdf ni URLs directas de imagen/YouTube almacenadas.
   * — youtubeVideoId: suficiente para embed en cliente.
   * — coverPath: ruta relativa al proxy de portada (GET …/public/:id/cover).
   */
  @Public()
  @Get('public')
  async listPublic() {
    const tabs = await this.getAllTabs.execute();
    return tabs.map((t) => this.serializePublicListItem(t));
  }

  @Public()
  @Get('latest/public')
  async latestPublic(@Query('limit') rawLimit = '8') {
    const limit = Math.min(Math.max(Number(rawLimit) || 8, 1), 50);
    const tabs = await this.getLatestTabs.execute(limit);
    return tabs.map((t) => this.serializePublicListItem(t));
  }

  @Get('latest')
  async latestAuthenticated(@Query('limit') rawLimit = '8') {
    const limit = Math.min(Math.max(Number(rawLimit) || 8, 1), 50);
    const tabs = await this.getLatestTabs.execute(limit);
    return tabs.map((t) => this.serializeAuthenticatedTab(t));
  }

  @Get()
  async listAuthenticated() {
    const tabs = await this.getAllTabs.execute();
    return tabs.map((t) => this.serializeAuthenticatedTab(t));
  }

  /** @deprecated Use GET /tabs — same response, still requires authentication. */
  @Get('all')
  async listAuthenticatedLegacy() {
    return this.listAuthenticated();
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() dto: CreateTabBody) {
    const tab = await this.createTab.execute({
      ...dto,
      userId: user.id,
    });
    return this.serializeAuthenticatedTab(tab);
  }

  /** Compatibility: legacy clients POST /tabs/create */
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Post('create')
  async createLegacy(@CurrentUser() user: RequestUser, @Body() dto: CreateTabBody) {
    return this.create(user, dto);
  }

  @Get(':id/download')
  async downloadAuthenticated(@Param('id') id: string) {
    const row = await this.tabRepo.findAuthorizedRow(Number(id));
    if (!row) throw new NotFoundException('Tab not found');
    return { downloadUrl: row.urlPdf };
  }

  @Get(':id')
  async detailAuthenticated(@Param('id') id: string) {
    const row = await this.tabRepo.findAuthorizedRow(Number(id));
    if (!row) throw new NotFoundException('Tab not found');
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      genreId: row.genreId,
      instrumentId: row.instrumentId,
      userId: row.userId,
      userName: row.userName,
      userImg: row.userImg ?? null,
      createdAt: row.createdAt,
      urlPdf: row.urlPdf,
      urlYoutube: row.urlYoutube,
      urlImg: row.urlImg,
      viewCount: row.viewCount,
    };
  }

  @HttpCode(200)
  @Post(':id/view')
  async recordViewAuthenticated(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    const tabId = Number(id);
    if (!Number.isInteger(tabId) || tabId <= 0) {
      throw new NotFoundException('Tab not found');
    }
    const result = await this.recordTabView.execute(user.id, tabId);
    return { ok: true, counted: result.counted };
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Put(':id')
  async updateAuthenticated(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTabBody,
  ) {
    const updated = await this.updateTab.execute({
      id: Number(id),
      userId: user.id,
      title: dto.title,
      artist: dto.artist,
      genreId: dto.genreId,
      instrumentId: dto.instrumentId,
      urlPdf: dto.urlPdf,
      urlYoutube: dto.urlYoutube,
      urlImg: dto.urlImg,
    });
    const row = await this.tabRepo.findAuthorizedRow(updated.id!);
    if (!row) {
      return {
        id: updated.id,
        title: updated.title,
        artist: updated.artist,
        userId: updated.userId,
        genreId: updated.genreId,
        instrumentId: updated.instrumentId,
        urlPdf: updated.urlPdf.toString(),
        urlYoutube: updated.urlYoutube.toString(),
        urlImg: updated.urlImg.toString(),
        viewCount: updated.viewCount,
      };
    }
    return {
      id: row.id,
      title: row.title,
      artist: row.artist,
      userId: row.userId,
      genreId: row.genreId,
      instrumentId: row.instrumentId,
      createdAt: row.createdAt,
      urlPdf: row.urlPdf,
      urlYoutube: row.urlYoutube,
      urlImg: row.urlImg,
      userName: row.userName,
      userImg: row.userImg ?? null,
      viewCount: row.viewCount,
    };
  }

  /** Compatibility: PUT /tabs/update/:id */
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Put('update/:id')
  async updateLegacy(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTabBody,
  ) {
    return this.updateAuthenticated(user, id, dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Delete(':id')
  async deleteAuthenticated(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    await this.deleteTab.execute(Number(id), user.id);
    return { success: true, message: 'Tab deleted successfully' };
  }

  private serializeAuthenticatedTab(tab: Tab) {
    return {
      id: tab.id,
      title: tab.title,
      artist: tab.artist,
      genreId: tab.genreId,
      instrumentId: tab.instrumentId,
      userId: tab.userId,
      userName: tab.userName ?? null,
      userImg: tab.userImg ?? null,
      createdAt: tab.createdAt,
      urlPdf: tab.urlPdf.toString(),
      urlYoutube: tab.urlYoutube.toString(),
      urlImg: tab.urlImg.toString(),
      viewCount: tab.viewCount,
    };
  }

  private serializePublicListItem(tab: Tab) {
    if (!tab.id) {
      throw new Error('serializePublicListItem: tab without id');
    }
    return {
      id: tab.id,
      title: tab.title,
      artist: tab.artist,
      genreId: tab.genreId,
      instrumentId: tab.instrumentId,
      userId: tab.userId,
      userName: tab.userName ?? null,
      userImg: tab.userImg ?? null,
      createdAt: tab.createdAt,
      youtubeVideoId: extractYouTubeVideoId(tab.urlYoutube.toString()),
      coverPath: `/tabs/public/${tab.id}/cover`,
    };
  }
}
