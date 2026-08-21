import { CopilotTabHit } from '@domain/dto/CopilotTabHit';
import { CountCatalog } from '@domain/use-cases/CountCatalog';
import { CountMyViews } from '@domain/use-cases/CountMyViews';
import { CountTabsByArtist } from '@domain/use-cases/CountTabsByArtist';
import { GetGenres } from '@domain/use-cases/GetGenres';
import { GetInstruments } from '@domain/use-cases/GetInstruments';
import { GetLastViewedByUser } from '@domain/use-cases/GetLastViewedByUser';
import { GetLatestTabs } from '@domain/use-cases/GetLatestTabs';
import { GetNeverViewedByUser } from '@domain/use-cases/GetNeverViewedByUser';
import { GetStaleViewedByUser } from '@domain/use-cases/GetStaleViewedByUser';
import { GetTabsByUser } from '@domain/use-cases/GetTabsByUser';
import { GetTopViewedByUser } from '@domain/use-cases/GetTopViewedByUser';
import { GetTopViewedGlobal } from '@domain/use-cases/GetTopViewedGlobal';
import { ListDistinctArtists } from '@domain/use-cases/ListDistinctArtists';
import { SearchTabs } from '@domain/use-cases/SearchTabs';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  Annotation,
  END,
  isNodeTimeoutError,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  COPILOT,
  copilotModelName,
  copilotTemplateReplyEnabled,
} from '../copilot.constants';
import { CopilotHttpException, geminiUnavailable } from '../copilot.exceptions';
import {
  emptyHitsReply,
  hitsTemplateReply,
  countByArtistReply,
  countCatalogReply,
  listFacetsReply,
  lastViewedReply,
  countMyViewsReply,
  uploaderReply,
  quotaReply,
  HELP_REPLY,
  OUT_OF_SCOPE_REPLY,
} from '../copilot.templates';
import { GenrePrismaRepository } from '../../repositories/genre-prisma.repository';
import { InstrumentPrismaRepository } from '../../repositories/instrument-prisma.repository';
import { TabPrismaRepository } from '../../repositories/tab-prisma.repository';
import { UserPrismaRepository } from '../../repositories/user-prisma.repository';
import { CopilotQuotaService } from '../quota/copilot-quota.service';
import { REPLY_SYSTEM, UNDERSTAND_SYSTEM } from './copilot.prompts';
import {
  CopilotIntent,
  CopilotSlots,
  normalizeUnderstandOutput,
  UnderstandOutputSchema,
} from './copilot.schema';

export type CopilotHistoryTurn = { role: 'user' | 'assistant'; content: string };

export type CopilotGraphResult = {
  reply: string;
  hits: CopilotTabHit[];
  intent: CopilotIntent;
};

const CopilotGraphState = Annotation.Root({
  userId: Annotation<number>(),
  message: Annotation<string>(),
  history: Annotation<CopilotHistoryTurn[]>(),
  intent: Annotation<CopilotIntent>(),
  slots: Annotation<CopilotSlots>(),
  hits: Annotation<CopilotTabHit[]>(),
  matchCount: Annotation<number>(),
  extraCount: Annotation<number>(),
  facetValues: Annotation<string[]>(),
  subjectLabel: Annotation<string>(),
  replyText: Annotation<string>(),
});

type GraphState = typeof CopilotGraphState.State;
type GraphUpdate = Partial<GraphState>;

const INSTRUMENT_ALIASES: Record<string, string> = {
  ukelele: 'Ukulele',
  ukulele: 'Ukulele',
  guitarra: 'Guitar',
  guitar: 'Guitar',
  piano: 'Piano',
};

const SELF_UPLOADER = /^(yo|mí|mi|me|mias|míos|mios|mis|mía|mine)$/i;

const TEMPLATE_INTENTS = new Set<CopilotIntent>([
  'count_by_artist',
  'count_catalog',
  'list_facets',
  'last_viewed_me',
  'count_my_views',
  'search_by_uploader',
  'help',
  'my_quota',
  'out_of_scope',
]);

const NO_RETRY = { maxAttempts: 1 as const };

@Injectable()
export class CopilotGraphService {
  private readonly logger = new Logger(CopilotGraphService.name);
  private readonly searchTabs: SearchTabs;
  private readonly countTabsByArtist: CountTabsByArtist;
  private readonly countCatalog: CountCatalog;
  private readonly getLatestTabs: GetLatestTabs;
  private readonly getTopViewedByUser: GetTopViewedByUser;
  private readonly getTopViewedGlobal: GetTopViewedGlobal;
  private readonly getStaleViewedByUser: GetStaleViewedByUser;
  private readonly getNeverViewedByUser: GetNeverViewedByUser;
  private readonly getLastViewedByUser: GetLastViewedByUser;
  private readonly countMyViews: CountMyViews;
  private readonly getTabsByUser: GetTabsByUser;
  private readonly listDistinctArtists: ListDistinctArtists;
  private readonly getGenres: GetGenres;
  private readonly getInstruments: GetInstruments;
  private readonly graph;

  constructor(
    private readonly config: ConfigService,
    tabRepo: TabPrismaRepository,
    private readonly genreRepo: GenrePrismaRepository,
    private readonly instrumentRepo: InstrumentPrismaRepository,
    private readonly userRepo: UserPrismaRepository,
    private readonly quota: CopilotQuotaService,
  ) {
    if (!this.config.get<string>('GEMINI_API_KEY')?.trim()) {
      this.logger.warn(
        'GEMINI_API_KEY no está definida. Copiá apps/backend/.env.example a apps/backend/.env y reiniciá Nest.',
      );
    }
    this.searchTabs = new SearchTabs(tabRepo);
    this.countTabsByArtist = new CountTabsByArtist(tabRepo);
    this.countCatalog = new CountCatalog(tabRepo);
    this.getLatestTabs = new GetLatestTabs(tabRepo);
    this.getTopViewedByUser = new GetTopViewedByUser(tabRepo);
    this.getTopViewedGlobal = new GetTopViewedGlobal(tabRepo);
    this.getStaleViewedByUser = new GetStaleViewedByUser(tabRepo);
    this.getNeverViewedByUser = new GetNeverViewedByUser(tabRepo);
    this.getLastViewedByUser = new GetLastViewedByUser(tabRepo);
    this.countMyViews = new CountMyViews(tabRepo);
    this.getTabsByUser = new GetTabsByUser(tabRepo);
    this.listDistinctArtists = new ListDistinctArtists(tabRepo);
    this.getGenres = new GetGenres(genreRepo);
    this.getInstruments = new GetInstruments(instrumentRepo);

    this.graph = new StateGraph(CopilotGraphState)
      .addNode('understand', (state) => this.understand(state as GraphState), {
        timeout: COPILOT.GEMINI_TIMEOUT_MS,
        retryPolicy: NO_RETRY,
      })
      .addNode('act', (state) => this.act(state as GraphState), { retryPolicy: NO_RETRY })
      .addNode('reply', (state) => this.reply(state as GraphState), {
        timeout: COPILOT.GEMINI_TIMEOUT_MS,
        retryPolicy: NO_RETRY,
      })
      .addEdge(START, 'understand')
      .addEdge('understand', 'act')
      .addEdge('act', 'reply')
      .addEdge('reply', END)
      .compile();
  }

  async run(input: {
    userId: number;
    message: string;
    history: CopilotHistoryTurn[];
  }): Promise<CopilotGraphResult> {
    try {
      const state = await this.graph.invoke(
        {
          userId: input.userId,
          message: input.message,
          history: input.history.slice(-COPILOT.HISTORY_MESSAGES),
          intent: 'out_of_scope',
          slots: {},
          hits: [],
          matchCount: 0,
          extraCount: 0,
          facetValues: [],
          subjectLabel: '',
          replyText: '',
        },
        { recursionLimit: COPILOT.MAX_TOOL_ROUNDS + 4 },
      );
      return {
        reply: state.replyText,
        hits: this.clipHits(state.hits),
        intent: state.intent,
      };
    } catch (err) {
      if (err instanceof CopilotHttpException) throw err;
      if (isNodeTimeoutError(err) || this.looksLikeGeminiOutage(err)) {
        throw geminiUnavailable();
      }
      throw err;
    }
  }

  private async understand(state: GraphState): Promise<GraphUpdate> {
    try {
      const model = this.createModel(COPILOT.MAX_OUTPUT_TOKENS, true);
      const structured = model.withStructuredOutput(UnderstandOutputSchema);
      const parsed = await structured.invoke(
        [
          new SystemMessage(UNDERSTAND_SYSTEM),
          ...this.toLangChainHistory(state.history),
          new HumanMessage(state.message),
        ],
        { timeout: COPILOT.GEMINI_TIMEOUT_MS },
      );
      const normalized = normalizeUnderstandOutput(parsed);
      return { intent: normalized.intent, slots: normalized.slots };
    } catch (err) {
      throw this.wrapGeminiFailure(err);
    }
  }

  private async act(state: GraphState): Promise<GraphUpdate> {
    if (state.intent === 'out_of_scope' || state.intent === 'help') {
      return { hits: [], matchCount: 0, extraCount: 0, facetValues: [], subjectLabel: '' };
    }

    const take = COPILOT.RESULT_LIMIT;
    const userId = state.userId;
    let hits: CopilotTabHit[] = [];
    let matchCount = 0;
    let extraCount = 0;
    let facetValues: string[] = [];
    let subjectLabel = '';

    switch (state.intent) {
      case 'latest':
        hits = await this.latestHits(take);
        break;
      case 'count_by_artist': {
        const artist = state.slots.artist?.trim() ?? '';
        subjectLabel = artist;
        matchCount = await this.countTabsByArtist.execute(artist);
        if (artist) {
          hits = await this.searchTabs.execute({ artist, take });
        }
        break;
      }
      case 'count_catalog': {
        const artist = state.slots.artist;
        const genreName = state.slots.genre;
        const instrumentName = this.normalizeInstrument(state.slots.instrument);
        matchCount = await this.countCatalog.execute({ artist, genreName, instrumentName });
        hits = await this.searchTabs.execute({ artist, genreName, instrumentName, take });
        subjectLabel = artist || genreName || instrumentName || '';
        break;
      }
      case 'list_facets': {
        const facet = state.slots.facet ?? 'genre';
        subjectLabel = facet;
        if (facet === 'instrument') {
          facetValues = (await this.getInstruments.execute()).map((item) => item.name);
        } else if (facet === 'artist') {
          facetValues = await this.listDistinctArtists.execute();
        } else {
          facetValues = (await this.getGenres.execute()).map((item) => item.name);
        }
        break;
      }
      case 'last_viewed_me': {
        const last = await this.getLastViewedByUser.execute(userId);
        hits = last ? [last] : [];
        break;
      }
      case 'count_my_views': {
        const stats = await this.countMyViews.execute(userId);
        matchCount = stats.events;
        extraCount = stats.distinctTabs;
        break;
      }
      case 'search_by_uploader': {
        const resolved = await this.resolveUploader(userId, state.slots.uploader);
        if (!resolved) {
          subjectLabel = state.slots.uploader?.trim() || 'ese usuario';
          break;
        }
        subjectLabel = resolved.username;
        const uploaded = await this.getTabsByUser.execute(resolved.id, take);
        hits = uploaded.hits;
        matchCount = uploaded.total;
        break;
      }
      case 'my_quota': {
        const snapshot = await this.quota.getQuota(userId);
        matchCount = snapshot.used;
        extraCount = snapshot.remaining;
        break;
      }
      case 'search_catalog':
        hits = await this.searchTabs.execute({
          artist: state.slots.artist,
          genreName: state.slots.genre,
          instrumentName: this.normalizeInstrument(state.slots.instrument),
          title: state.slots.title,
          sort: state.slots.sort ?? 'recent',
          take,
        });
        break;
      case 'top_viewed_me':
        hits = await this.getTopViewedByUser.execute(userId, state.slots.order ?? 'desc', take);
        break;
      case 'top_viewed_global':
        hits = await this.getTopViewedGlobal.execute(state.slots.order ?? 'desc', take);
        break;
      case 'stale_for_me':
        hits = await this.getStaleViewedByUser.execute(userId, COPILOT.STALE_AFTER_DAYS, take);
        break;
      case 'never_viewed_me':
        hits = await this.getNeverViewedByUser.execute(userId, take);
        break;
      default:
        hits = [];
    }

    return {
      hits: this.clipHits(hits),
      matchCount,
      extraCount,
      facetValues,
      subjectLabel,
    };
  }

  private async reply(state: GraphState): Promise<GraphUpdate> {
    if (state.intent === 'out_of_scope') {
      return { replyText: OUT_OF_SCOPE_REPLY, hits: [] };
    }
    if (state.intent === 'help') {
      return { replyText: HELP_REPLY, hits: [] };
    }

    const hits = this.clipHits(state.hits);

    if (state.intent === 'count_by_artist') {
      return {
        hits,
        replyText: countByArtistReply(state.slots.artist ?? '', state.matchCount ?? 0, hits),
      };
    }
    if (state.intent === 'count_catalog') {
      return {
        hits,
        replyText: countCatalogReply(state.subjectLabel ?? '', state.matchCount ?? 0, hits),
      };
    }
    if (state.intent === 'list_facets') {
      return {
        hits: [],
        replyText: listFacetsReply(state.subjectLabel || state.slots.facet || 'genre', state.facetValues ?? []),
      };
    }
    if (state.intent === 'last_viewed_me') {
      return {
        hits,
        replyText: hits[0] ? lastViewedReply(hits[0]) : emptyHitsReply(state.intent),
      };
    }
    if (state.intent === 'count_my_views') {
      return {
        hits: [],
        replyText: countMyViewsReply(state.matchCount ?? 0, state.extraCount ?? 0),
      };
    }
    if (state.intent === 'search_by_uploader') {
      return {
        hits,
        replyText: uploaderReply(state.subjectLabel || 'ese usuario', state.matchCount ?? 0, hits),
      };
    }
    if (state.intent === 'my_quota') {
      return {
        hits: [],
        replyText: quotaReply(
          state.matchCount ?? 0,
          state.extraCount ?? 0,
          COPILOT.DAILY_MESSAGE_LIMIT,
        ),
      };
    }

    const useTemplate =
      copilotTemplateReplyEnabled(this.config.get<string>('COPILOT_TEMPLATE_REPLY')) ||
      TEMPLATE_INTENTS.has(state.intent);

    if (useTemplate || hits.length === 0) {
      return {
        hits,
        replyText: hits.length === 0 ? emptyHitsReply(state.intent) : hitsTemplateReply(state.intent, hits),
      };
    }

    try {
      const model = this.createModel(COPILOT.MAX_OUTPUT_TOKENS);
      const payload = hits.map((hit) => ({
        id: hit.id,
        title: hit.title,
        artist: hit.artist,
        genre: hit.genre,
        instrument: hit.instrument,
        viewCount: hit.viewCount,
        lastViewedAt: hit.lastViewedAt,
        createdAt: hit.createdAt,
      }));
      const result = await model.invoke(
        [
          new SystemMessage(REPLY_SYSTEM),
          new HumanMessage(
            `Intent: ${state.intent}\nQuestion: ${state.message}\nHits (JSON, max 3, no URLs):\n${JSON.stringify(payload)}`,
          ),
        ],
        { timeout: COPILOT.GEMINI_TIMEOUT_MS },
      );
      const text = this.messageText(result).trim();
      return {
        hits,
        replyText: text.length > 0 ? text : hitsTemplateReply(state.intent, hits),
      };
    } catch (err) {
      throw this.wrapGeminiFailure(err);
    }
  }

  private async latestHits(take: number): Promise<CopilotTabHit[]> {
    const tabs = await this.getLatestTabs.execute(take);
    const [genres, instruments] = await Promise.all([
      this.genreRepo.findAll(),
      this.instrumentRepo.findAll(),
    ]);
    const genreName = new Map(genres.map((g) => [g.id, g.name]));
    const instrumentName = new Map(instruments.map((i) => [i.id, i.name]));

    return tabs.slice(0, COPILOT.RESULT_LIMIT).flatMap((tab) => {
      if (tab.id == null) return [];
      const hit: CopilotTabHit = {
        id: tab.id,
        title: tab.title,
        artist: tab.artist,
        genre: genreName.get(tab.genreId) ?? '',
        instrument: instrumentName.get(tab.instrumentId) ?? '',
        viewCount: tab.viewCount,
        createdAt: tab.createdAt.toISOString(),
      };
      return [hit];
    });
  }

  private clipHits(hits: CopilotTabHit[] | undefined): CopilotTabHit[] {
    return (hits ?? []).slice(0, COPILOT.RESULT_LIMIT).map((hit) => ({
      id: hit.id,
      title: hit.title,
      artist: hit.artist,
      genre: hit.genre,
      instrument: hit.instrument,
      viewCount: hit.viewCount,
      createdAt: hit.createdAt,
      ...(hit.lastViewedAt ? { lastViewedAt: hit.lastViewedAt } : {}),
    }));
  }

  private normalizeInstrument(name?: string): string | undefined {
    if (!name) return undefined;
    const alias = INSTRUMENT_ALIASES[name.trim().toLowerCase()];
    return alias ?? name.trim();
  }

  private async resolveUploader(
    viewerUserId: number,
    uploader?: string,
  ): Promise<{ id: number; username: string } | null> {
    if (!uploader || SELF_UPLOADER.test(uploader)) {
      const me = await this.userRepo.findById(viewerUserId);
      return { id: me?.id ?? viewerUserId, username: me?.username ?? 'you' };
    }
    const user = await this.userRepo.findByUsernameInsensitive(uploader);
    if (!user || user.id == null) return null;
    return { id: user.id, username: user.username };
  }

  private toLangChainHistory(history: CopilotHistoryTurn[]) {
    return history.slice(-COPILOT.HISTORY_MESSAGES).map((turn) => {
      const content = turn.content.slice(0, COPILOT.MAX_INPUT_CHARS);
      return turn.role === 'assistant' ? new AIMessage(content) : new HumanMessage(content);
    });
  }

  private messageText(message: AIMessage | { content: unknown }): string {
    const content = message.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') {
            return part.text;
          }
          return '';
        })
        .join('');
    }
    return '';
  }

  private createModel(maxOutputTokens: number, json = false): ChatGoogleGenerativeAI {
    const apiKey = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!apiKey) {
      throw geminiUnavailable();
    }
    return new ChatGoogleGenerativeAI({
      model: copilotModelName(this.config.get<string>('COPILOT_MODEL')),
      apiKey,
      temperature: 0,
      maxOutputTokens,
      maxRetries: 0,
      json,
      thinkingConfig: { thinkingLevel: 'LOW' },
    });
  }

  private wrapGeminiFailure(err: unknown): CopilotHttpException {
    if (err instanceof CopilotHttpException) {
      return err;
    }
    const message = err instanceof Error ? err.message : String(err);
    this.logger.warn(`Gemini no disponible: ${message}`);
    return geminiUnavailable();
  }

  private looksLikeGeminiOutage(err: unknown): boolean {
    const record = err as {
      status?: number;
      statusCode?: number;
      message?: string;
      name?: string;
    };
    if (record?.status === 429 || record?.statusCode === 429) return true;
    const blob = `${record?.name ?? ''} ${record?.message ?? ''}`;
    return /429|RESOURCE_EXHAUSTED|resource exhausted|Too Many Requests|timeout|aborted|AbortError|ETIMEDOUT/i.test(
      blob,
    );
  }
}
