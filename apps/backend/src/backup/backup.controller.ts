import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Role } from '@domain/entities/User';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { BackupSqlService } from './backup-sql.service';

@Controller('admin')
export class BackupController {
  constructor(private readonly backupSql: BackupSqlService) {}

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @Get('backup.sql')
  async download(@Res() res: Response) {
    const { sql, filename } = await this.backupSql.generate();
    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(sql);
  }
}
