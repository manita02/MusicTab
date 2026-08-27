import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  backupFilename,
  buildBackupSql,
  type BackupTableData,
  type DumpRow,
} from './backup-sql.serializer';

export type BackupSqlResult = {
  sql: string;
  filename: string;
};

@Injectable()
export class BackupSqlService {
  private readonly logger = new Logger(BackupSqlService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generate(now: Date = new Date()): Promise<BackupSqlResult> {
    const [users, genres, instruments, tabs, tabViews, copilotUsage] = await Promise.all([
      this.prisma.user.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.genre.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.instrument.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.tab.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.tabView.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.copilotDailyUsage.findMany({ orderBy: { id: 'asc' } }),
    ]);

    const data: BackupTableData = {
      User: users as DumpRow[],
      Genre: genres as DumpRow[],
      Instrument: instruments as DumpRow[],
      Tab: tabs as DumpRow[],
      TabView: tabViews as DumpRow[],
      CopilotDailyUsage: copilotUsage as DumpRow[],
    };

    const sql = buildBackupSql(data, now);
    const filename = backupFilename(now);

    this.logger.log(
      `Generated ${filename} (users=${users.length} genres=${genres.length} instruments=${instruments.length} tabs=${tabs.length} tabViews=${tabViews.length} copilotUsage=${copilotUsage.length})`,
    );

    return { sql, filename };
  }
}
