import { writeFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { BackupSqlService } from './backup-sql.service';
import type { PrismaService } from '../prisma/prisma.service';

async function main() {
  const prisma = new PrismaClient();
  try {
    const service = new BackupSqlService(prisma as unknown as PrismaService);
    const { sql, filename } = await service.generate();
    writeFileSync(filename, sql, 'utf8');
    console.log(`Wrote ${filename} (${Buffer.byteLength(sql, 'utf8')} bytes). Treat as secret.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : 'Backup failed';
  console.error(message);
  process.exit(1);
});
