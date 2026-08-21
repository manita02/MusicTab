import { Injectable } from '@nestjs/common';
import { COPILOT } from './copilot.constants';
import { CopilotGraphService, CopilotHistoryTurn } from './graph/copilot.graph';
import { CopilotQuotaService } from './quota/copilot-quota.service';
import { assertMessageLength } from './copilot.validation';

@Injectable()
export class CopilotService {
  constructor(
    private readonly graph: CopilotGraphService,
    private readonly quota: CopilotQuotaService,
  ) {}

  getQuota(userId: number) {
    return this.quota.getQuota(userId);
  }

  async chat(userId: number, message: string, history: CopilotHistoryTurn[] = []) {
    const trimmed = assertMessageLength(message);
    const clippedHistory = history.slice(-COPILOT.HISTORY_MESSAGES);

    await this.quota.assertCanConsume(userId);

    const { reply, hits } = await this.graph.run({
      userId,
      message: trimmed,
      history: clippedHistory,
    });

    const quota = await this.quota.increment(userId);
    return { reply, hits, quota };
  }
}
