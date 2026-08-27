import { describe, expect, it } from 'vitest';
import {
  countByArtistReply,
  countCatalogReply,
  countMyViewsReply,
  emptyHitsReply,
  HELP_REPLY,
  hitsTemplateReply,
  lastViewedReply,
  listFacetsReply,
  OUT_OF_SCOPE_REPLY,
  quotaReply,
  uploaderReply,
} from './copilot.templates';
import { COPILOT_INTENTS } from './graph/copilot.schema';

const hit = {
  id: 1,
  title: 'A',
  artist: 'Milo J',
  genre: 'Rock',
  instrument: 'Guitar',
  viewCount: 0,
  createdAt: '2024',
};

describe('countByArtistReply', () => {
  it('dice el total aunque los hits estén recortados a 3', () => {
    const hits = [
      hit,
      { ...hit, id: 2, title: 'B', genre: 'Pop', instrument: 'Piano' },
      { ...hit, id: 3, title: 'C', genre: 'Jazz', instrument: 'Ukulele' },
    ];
    const text = countByArtistReply('Milo J', 4, hits);
    expect(text).toContain('There are 4 tabs for Milo J');
    expect(text).toContain('A');
    expect(text).not.toContain('urlPdf');
  });

  it('es honesto si no hay resultados', () => {
    expect(countByArtistReply('Nadie', 0, [])).toBe('There are no tabs for Nadie in MusicTab.');
  });

  it('pide el artista si el slot viene vacío', () => {
    expect(countByArtistReply('  ', 0, [])).toContain('which artist');
  });
});

describe('quotaReply', () => {
  it('informa usados y restantes', () => {
    expect(quotaReply(2, 8, 10)).toContain('2 of 10');
  });

  it('avisa cuando no queda cupo', () => {
    expect(quotaReply(10, 0, 10)).toContain('all 10 Pua messages');
  });
});

describe('fixed copy', () => {
  it('help y out_of_scope no inventan canciones ni PDFs', () => {
    expect(HELP_REPLY).toContain('I never invent songs');
    expect(HELP_REPLY).toContain('I always reply in English');
    expect(OUT_OF_SCOPE_REPLY).toContain('MusicTab catalog');
    expect(OUT_OF_SCOPE_REPLY.toLowerCase()).not.toContain('urlpdf');
  });
});

describe('countCatalogReply', () => {
  it('total sin label', () => {
    expect(countCatalogReply('', 1, [])).toBe('There is 1 tab in MusicTab.');
  });

  it('lista muestras cuando hay hits', () => {
    const text = countCatalogReply('Rock', 2, [hit]);
    expect(text).toContain('There are 2 tabs for Rock');
    expect(text).toContain('1. A — Milo J — Rock — Guitar');
  });
});

describe('listFacetsReply', () => {
  it('lista géneros', () => {
    expect(listFacetsReply('genre', ['Rock', 'Jazz'])).toBe(
      'Genres in MusicTab: Rock, Jazz.',
    );
  });

  it('empty', () => {
    expect(listFacetsReply('genre', [])).toBe("There's no catalog data to list.");
  });
});

describe('lastViewedReply / countMyViews / uploader', () => {
  it('cita lastViewedAt si existe', () => {
    expect(lastViewedReply({ ...hit, lastViewedAt: '2024-02-01' })).toContain('2024-02-01');
  });

  it('count my views cero vs plural', () => {
    expect(countMyViewsReply(0, 0)).toContain('open a PDF');
    expect(countMyViewsReply(2, 1)).toContain('2 times');
    expect(countMyViewsReply(2, 1)).toContain('1 distinct tab');
  });

  it('uploader sin tabs vs con muestras', () => {
    expect(uploaderReply('pepe', 0, [])).toContain('pepe');
    expect(uploaderReply('pepe', 1, [hit])).toContain('pepe uploaded 1 tab');
  });
});

describe('emptyHitsReply', () => {
  it('cubre los empty states de la intent matrix', () => {
    expect(emptyHitsReply('last_viewed_me')).toContain('open a PDF');
    expect(emptyHitsReply('top_viewed_me')).toContain('open a PDF');
    expect(emptyHitsReply('stale_for_me')).toContain('open a PDF');
    expect(emptyHitsReply('never_viewed_me')).toContain("haven't visited");
    expect(emptyHitsReply('latest')).toBe('No results in MusicTab.');
    expect(emptyHitsReply('top_viewed_global')).toBe('No results in MusicTab.');
    expect(emptyHitsReply('count_by_artist')).toContain('that artist');
    expect(emptyHitsReply('search_by_uploader')).toContain('uploaded by that user');
    expect(emptyHitsReply('list_facets')).toContain('no catalog data');
    expect(emptyHitsReply('search_catalog')).toContain('that search');
  });

  it('tiene rama para cada intent conocido (fallback genérico inclusive)', () => {
    for (const intent of COPILOT_INTENTS) {
      expect(emptyHitsReply(intent).length).toBeGreaterThan(0);
    }
  });
});

describe('hitsTemplateReply', () => {
  it('formato title — artist — genre — instrument', () => {
    const text = hitsTemplateReply('search_catalog', [hit]);
    expect(text).toContain('1. A — Milo J — Rock — Guitar');
    expect(text).not.toContain('urlPdf');
  });

  it('agrega last visit en stale/last_viewed', () => {
    const withDate = { ...hit, lastViewedAt: '2024-03-01' };
    expect(hitsTemplateReply('stale_for_me', [withDate])).toContain('last visit: 2024-03-01');
    expect(hitsTemplateReply('search_catalog', [withDate])).not.toContain('last visit');
  });
});
