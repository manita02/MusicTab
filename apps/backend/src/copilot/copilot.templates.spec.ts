import { countByArtistReply, quotaReply } from './copilot.templates';

describe('countByArtistReply', () => {
  it('dice el total aunque los hits estén recortados a 3', () => {
    const hits = [
      { id: 1, title: 'A', artist: 'Milo J', genre: 'Rock', instrument: 'Guitar', viewCount: 0, createdAt: '2024' },
      { id: 2, title: 'B', artist: 'Milo J', genre: 'Pop', instrument: 'Piano', viewCount: 0, createdAt: '2024' },
      { id: 3, title: 'C', artist: 'Milo J', genre: 'Jazz', instrument: 'Ukulele', viewCount: 0, createdAt: '2024' },
    ];
    const text = countByArtistReply('Milo J', 4, hits);
    expect(text).toContain('Hay 4 tabs de Milo J');
    expect(text).toContain('A');
    expect(text).not.toContain('urlPdf');
  });

  it('es honesto si no hay resultados', () => {
    expect(countByArtistReply('Nadie', 0, [])).toBe('No hay tabs de Nadie en MusicTab.');
  });
});

describe('quotaReply', () => {
  it('informa usados y restantes', () => {
    expect(quotaReply(2, 3, 5)).toContain('2 de 5');
  });
});
