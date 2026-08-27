export const INSERT_BATCH_SIZE = 250;

export const DUMP_TABLE_ORDER = [
  'User',
  'Genre',
  'Instrument',
  'Tab',
  'TabView',
  'CopilotDailyUsage',
] as const;

export type DumpTableName = (typeof DUMP_TABLE_ORDER)[number];

export const TABLE_COLUMNS: Record<DumpTableName, readonly string[]> = {
  User: [
    'id',
    'username',
    'email',
    'passwordHash',
    'role',
    'createdAt',
    'birthDate',
    'urlImg',
    'signupIp',
    'lastCopilotMessageAt',
  ],
  Genre: ['id', 'name'],
  Instrument: ['id', 'name', 'urlIco'],
  Tab: [
    'id',
    'title',
    'artist',
    'urlYoutube',
    'urlImagen',
    'urlPdf',
    'createdAt',
    'userId',
    'genreId',
    'instrumentId',
    'viewCount',
  ],
  TabView: ['id', 'userId', 'tabId', 'viewedAt'],
  CopilotDailyUsage: ['id', 'userId', 'date', 'count', 'updatedAt'],
};

export type DumpRow = Record<string, unknown>;

export type BackupTableData = Record<DumpTableName, DumpRow[]>;

/** UTC ISO-8601 from a Prisma Date (always Z). */
export function formatTimestampUtc(date: Date): string {
  return date.toISOString();
}

export function backupFilename(generatedAt: Date): string {
  const iso = generatedAt.toISOString();
  const date = iso.slice(0, 10);
  const hms = iso.slice(11, 19).replace(/:/g, '');
  return `musictab-backup-${date}T${hms}Z.sql`;
}

/**
 * PostgreSQL literal (Neon: standard_conforming_strings = on).
 * NUL is stripped (illegal in text). `'` is doubled. Backslash and newlines
 * stay as-is — doubling `\` would restore two backslashes.
 */
export function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error('Cannot serialize a non-finite number as SQL');
    }
    return String(value);
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }
  if (value instanceof Date) {
    return quoteSqlString(formatTimestampUtc(value));
  }
  if (typeof value === 'string') {
    return quoteSqlString(value);
  }
  throw new Error(`Unsupported SQL value type: ${typeof value}`);
}

function quoteSqlString(s: string): string {
  let escaped = '';
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (ch === '\0') {
      continue;
    }
    if (ch === "'") {
      escaped += "''";
      continue;
    }
    escaped += ch;
  }
  return `'${escaped}'`;
}

export function buildInsertSql(
  table: DumpTableName,
  rows: DumpRow[],
  batchSize: number = INSERT_BATCH_SIZE,
): string {
  const columns = TABLE_COLUMNS[table];
  if (rows.length === 0) {
    return '-- 0 rows';
  }

  const quotedCols = columns.map((c) => `"${c}"`).join(',');
  const size = Math.max(1, batchSize);
  const batches: string[] = [];

  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const values = chunk
      .map((row) => {
        const literals = columns.map((col) => sqlLiteral(row[col]));
        return `  (${literals.join(', ')})`;
      })
      .join(',\n');
    batches.push(`INSERT INTO "${table}" (${quotedCols}) VALUES\n${values};`);
  }

  return batches.join('\n');
}

function tableSection(table: DumpTableName, rows: DumpRow[], batchSize: number): string {
  return `-- ===== "${table}" =====\n${buildInsertSql(table, rows, batchSize)}`;
}

function setvalStatements(): string {
  return DUMP_TABLE_ORDER.map(
    (table) =>
      `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX("id") FROM "${table}"), 1), true);`,
  ).join('\n');
}

export function buildBackupSql(
  data: BackupTableData,
  generatedAt: Date,
  batchSize: number = INSERT_BATCH_SIZE,
): string {
  const generatedAtIso = generatedAt.toISOString();
  const sections = DUMP_TABLE_ORDER.map((table) =>
    tableSection(table, data[table] ?? [], batchSize),
  ).join('\n');

  return `-- MusicTab data backup
-- GeneratedAt: ${generatedAtIso}
-- Source: Prisma models (PostgreSQL / Neon compatible)
--
-- PREREQUISITO: schema aplicado con \`npx prisma migrate deploy\`.
-- Este archivo NO crea tablas.
--
-- RESTORE MANUAL EN NEON:
-- 1) Abrir SQL Editor (o psql con DIRECT_URL, no el pooler).
-- 2) Si SEED_ON_BOOT ya insertó admin/géneros, este script TRUNCATE y reemplaza TODO.
-- 3) Ejecutar el archivo completo en una transacción.
-- 4) NO correr prisma seed después (chocaría unique de title/email/name).
--
-- Advertencia: incluye passwordHash. Tratar el archivo como secreto.
BEGIN;
SET session_replication_role = replica;
TRUNCATE TABLE
  "TabView",
  "CopilotDailyUsage",
  "Session",
  "Tab",
  "Genre",
  "Instrument",
  "User"
RESTART IDENTITY CASCADE;
${sections}
SET session_replication_role = DEFAULT;
${setvalStatements()}
COMMIT;
`;
}
