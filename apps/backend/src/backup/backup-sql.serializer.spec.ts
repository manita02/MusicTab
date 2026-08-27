import { describe, expect, it } from 'vitest';
import {
  backupFilename,
  buildBackupSql,
  buildInsertSql,
  DUMP_TABLE_ORDER,
  formatTimestampUtc,
  sqlLiteral,
  type BackupTableData,
} from './backup-sql.serializer';

function emptyData(): BackupTableData {
  return {
    User: [],
    Genre: [],
    Instrument: [],
    Tab: [],
    TabView: [],
    CopilotDailyUsage: [],
  };
}

describe('sqlLiteral', () => {
  it('serializes NULL', () => {
    expect(sqlLiteral(null)).toBe('NULL');
    expect(sqlLiteral(undefined)).toBe('NULL');
  });

  it('serializes numbers without quotes', () => {
    expect(sqlLiteral(0)).toBe('0');
    expect(sqlLiteral(42)).toBe('42');
    expect(sqlLiteral(-7)).toBe('-7');
  });

  it('escapes apostrophes (O\'Brien)', () => {
    expect(sqlLiteral("O'Brien")).toBe("'O''Brien'");
  });

  it('preserves unicode (Chamamé)', () => {
    expect(sqlLiteral('Chamamé')).toBe("'Chamamé'");
  });

  it('keeps backslashes as-is (standard_conforming_strings)', () => {
    expect(sqlLiteral('C:\\Users\\a')).toBe("'C:\\Users\\a'");
  });

  it('strips NUL characters', () => {
    expect(sqlLiteral('a\0b')).toBe("'ab'");
  });

  it('keeps newlines inside the quoted literal', () => {
    expect(sqlLiteral('line1\nline2')).toBe("'line1\nline2'");
  });

  it('serializes timestamps as quoted UTC ISO-8601', () => {
    const date = new Date('2026-08-27T21:12:00.000Z');
    expect(formatTimestampUtc(date)).toBe('2026-08-27T21:12:00.000Z');
    expect(sqlLiteral(date)).toBe("'2026-08-27T21:12:00.000Z'");
  });
});

describe('backupFilename', () => {
  it('uses YYYY-MM-DDTHHMMSSZ', () => {
    expect(backupFilename(new Date('2026-08-27T21:12:00.123Z'))).toBe(
      'musictab-backup-2026-08-27T211200Z.sql',
    );
  });
});

describe('buildInsertSql', () => {
  it('emits -- 0 rows for empty tables', () => {
    expect(buildInsertSql('Genre', [])).toBe('-- 0 rows');
  });

  it('batches multi-row INSERTs', () => {
    const sql = buildInsertSql(
      'Genre',
      [
        { id: 1, name: 'Rock' },
        { id: 2, name: 'Folk' },
        { id: 3, name: "O'Brien" },
      ],
      2,
    );
    expect(sql).toContain('INSERT INTO "Genre" ("id","name") VALUES');
    expect(sql.match(/INSERT INTO/g)).toHaveLength(2);
    expect(sql).toContain("'O''Brien'");
  });
});

describe('buildBackupSql', () => {
  const generatedAt = new Date('2026-08-27T21:12:00.000Z');

  it('includes header, TRUNCATE, setval, and table order', () => {
    const sql = buildBackupSql(emptyData(), generatedAt);

    expect(sql).toContain('-- MusicTab data backup');
    expect(sql).toContain('-- GeneratedAt: 2026-08-27T21:12:00.000Z');
    expect(sql).toContain('BEGIN;');
    expect(sql).toContain('SET session_replication_role = replica;');
    expect(sql).toContain('TRUNCATE TABLE');
    expect(sql).toContain('"Session"');
    expect(sql).toContain('RESTART IDENTITY CASCADE;');
    expect(sql).toContain('SET session_replication_role = DEFAULT;');
    expect(sql).toContain('COMMIT;');

    const positions = DUMP_TABLE_ORDER.map((table) => sql.indexOf(`-- ===== "${table}" =====`));
    expect(positions.every((p) => p >= 0)).toBe(true);
    for (let i = 1; i < positions.length; i += 1) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }

    for (const table of DUMP_TABLE_ORDER) {
      expect(sql).toContain(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX("id") FROM "${table}"), 1), true);`,
      );
    }

    expect(sql).not.toMatch(/INSERT INTO "Session"/);
    expect(sql).not.toContain('_prisma_migrations');
    expect(sql).toContain('-- ===== "Genre" =====');
    expect(sql).toContain('-- 0 rows');
  });

  it('includes passwordHash, urlIco, and explicit ids', () => {
    const sql = buildBackupSql(
      {
        User: [
          {
            id: 1,
            username: "O'Brien",
            email: 'obrien@example.com',
            passwordHash: '$2a$10$hash',
            role: 'ADMIN',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            birthDate: new Date('1990-05-20T00:00:00.000Z'),
            urlImg: 'https://img.example/a.png',
            signupIp: '127.0.0.1',
            lastCopilotMessageAt: null,
          },
        ],
        Genre: [{ id: 1, name: 'Chamamé' }],
        Instrument: [{ id: 2, name: 'Guitar', urlIco: 'https://ico.example/g.svg' }],
        Tab: [],
        TabView: [],
        CopilotDailyUsage: [],
      },
      generatedAt,
    );

    expect(sql).toContain(
      'INSERT INTO "User" ("id","username","email","passwordHash","role","createdAt","birthDate","urlImg","signupIp","lastCopilotMessageAt") VALUES',
    );
    expect(sql).toContain("$2a$10$hash");
    expect(sql).toContain("'O''Brien'");
    expect(sql).toContain("'Chamamé'");
    expect(sql).toContain('INSERT INTO "Instrument" ("id","name","urlIco") VALUES');
    expect(sql).toContain("'https://ico.example/g.svg'");
    expect(sql).toContain('NULL');
    expect(sql).not.toMatch(/INSERT INTO "Session"/);
    expect(sql).not.toContain('CREATE TABLE');
  });
});
