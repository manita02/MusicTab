import { describe, expect, it } from 'vitest';
import { countByArtistReply, quotaReply } from './copilot.templates';

describe('countByArtistReply', () => {
  it('dice el total aunque los hits estén recortados a 3', () => {
    const hits = [
      { id: 1, title: 'A', artist: 'Milo J', genre: 'Rock', instrument: 'Guitar', viewCount: 0, createdAt: '2024' },
      { id: 2, title: 'B', artist: 'Milo J', genre: 'Pop', instrument: 'Piano', viewCount: 0, createdAt: '2024' },
      { id: 3, title: 'C', artist: 'Milo J', genre: 'Jazz', instrument: 'Ukulele', viewCount: 0, createdAt: '2024' },
    ];
    const text = countByArtistReply('Milo J', 4, hits);
    expect(text).toContain('There are 4 tabs for Milo J');
    expect(text).toContain('A');
    expect(text).not.toContain('urlPdf');
  });

  it('es honesto si no hay resultados', () => {
    expect(countByArtistReply('Nadie', 0, [])).toBe('There are no tabs for Nadie in MusicTab.');
  });
});

describe('quotaReply', () => {
  it('informa usados y restantes', () => {
    expect(quotaReply(2, 8, 10)).toContain('2 of 10');
  });
});
