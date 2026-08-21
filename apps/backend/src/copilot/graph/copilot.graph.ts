import { CopilotTabHit } from '@domain/dto/CopilotTabHit';
import { GetLatestTabs } from '@domain/use-cases/GetLatestTabs';
import { GetNeverViewedByUser } from '@domain/use-cases/GetNeverViewedByUser';
import { GetStaleViewedByUser } from '@domain/use-cases/GetStaleViewedByUser';
import { GetTopViewedByUser } from '@domain/use-cases/GetTopViewedByUser';
import { GetTopViewedGlobal } from '@domain/use-cases/GetTopViewedGlobal';
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
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  COPILOT,
  copilotModelName,
  copilotTemplateReplyEnabled,
} from '../copilot.constants';
import { CopilotHttpException, geminiUnavailable } from '../copilot.exceptions';
import { emptyHitsReply, hitsTemplateReply, OUT_OF_SCOPE_REPLY } from '../copilot.templates';
import { GenrePrismaRepository } from '../../repositories/genre-prisma.repository';
import { InstrumentPrismaRepository } from '../../repositories/instrument-prisma.repository';
import { TabPrismaRepository } from '../../repositories/tab-prisma.repository';
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
};

const CopilotGraphState = Annotation.Root({
  userId: Annotation<number>(),
  message: Annotation<string>(),
  history: Annotation<CopilotHistoryTurn[]>(),
  intent: Annotation<CopilotIntent>(),
  slots: Annotation<CopilotSlots>(),
  hits: Annotation<CopilotTabHit[]>(),
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

const NO_RETRY = { maxAttempts: 1 as const };

@Injectable()
export class CopilotGraphService {
  private readonly searchTabs: SearchTabs;
  private readonly getLatestTabs: GetLatestTabs;
  private readonly getTopViewedByUser: GetTopViewedByUser;
  private readonly getTopViewedGlobal: GetTopViewedGlobal;
  private readonly getStaleViewedByUser: GetStaleViewedByUser;
  private readonly getNeverViewedByUser: GetNeverViewedByUser;
  private readonly graph;

  constructor(
    private readonly config: ConfigService,
    tabRepo: TabPrismaRepository,
    private readonly genreRepo: GenrePrismaRepository,
    private readonly instrumentRepo: InstrumentPrismaRepository,
  ) {
    this.searchTabs = new SearchTabs(tabRepo);
    this.getLatestTabs = new GetLatestTabs(tabRepo);
    this.getTopViewedByUser = new GetTopViewedByUser(tabRepo);
    this.getTopViewedGlobal = new GetTopViewedGlobal(tabRepo);
    this.getStaleViewedByUser = new GetStaleViewedByUser(tabRepo);
    this.getNeverViewedByUser = new GetNeverViewedByUser(tabRepo);

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
          replyText: '',
        },
        { recursionLimit: COPILOT.MAX_TOOL_ROUNDS + 4 },
      );
      return {
        reply: state.replyText,
        hits: this.clipHits(state.hits),
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
      const model = this.createModel(COPILOT.MAX_OUTPUT_TOKENS);
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
    if (state.intent === 'out_of_scope') {
      return { hits: [] };
    }

    const take = COPILOT.RESULT_LIMIT;
    const userId = state.userId;
    let hits: CopilotTabHit[] = [];

    switch (state.intent) {
      case 'latest':
        hits = await this.latestHits(take);
        break;
      case 'search_catalog':
        hits = await this.searchTabs.execute({
          artist: state.slots.artist,
          genreName: state.slots.genre,
          instrumentName: this.normalizeInstrument(state.slots.instrument),
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

    return { hits: this.clipHits(hits) };
  }

  private async reply(state: GraphState): Promise<GraphUpdate> {
    if (state.intent === 'out_of_scope') {
      return { replyText: OUT_OF_SCOPE_REPLY, hits: [] };
    }

    const hits = this.clipHits(state.hits);
    const useTemplate = copilotTemplateReplyEnabled(this.config.get<string>('COPILOT_TEMPLATE_REPLY'));

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
            `Intent: ${state.intent}\nPregunta: ${state.message}\nHits (JSON, máximo 3, sin URLs):\n${JSON.stringify(payload)}`,
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

  private createModel(maxOutputTokens: number): ChatGoogleGenerativeAI {
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
      thinkingConfig: { thinkingBudget: 0 },
    });
  }

  private wrapGeminiFailure(err: unknown): CopilotHttpException {
    if (err instanceof CopilotHttpException) {
      return err;
    }
    if (isNodeTimeoutError(err) || this.looksLikeGeminiOutage(err)) {
      return geminiUnavailable();
    }
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
