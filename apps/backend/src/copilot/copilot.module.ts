import { Module } from '@nestjs/common';
import { CopilotController } from './copilot.controller';
import { CopilotService } from './copilot.service';
import { CopilotQuotaService } from './quota/copilot-quota.service';
import { CopilotGraphService } from './graph/copilot.graph';
import { TabPrismaRepository } from '../repositories/tab-prisma.repository';
import { GenrePrismaRepository } from '../repositories/genre-prisma.repository';
import { InstrumentPrismaRepository } from '../repositories/instrument-prisma.repository';

@Module({
  controllers: [CopilotController],
  providers: [
    CopilotService,
    CopilotQuotaService,
    CopilotGraphService,
    TabPrismaRepository,
    GenrePrismaRepository,
    InstrumentPrismaRepository,
  ],
})
export class CopilotModule {}
