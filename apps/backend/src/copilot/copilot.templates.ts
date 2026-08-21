import { CopilotTabHit } from '@domain/dto/CopilotTabHit';
import type { CopilotIntent } from './graph/copilot.schema';

export const OUT_OF_SCOPE_REPLY =
  'Solo puedo ayudarte con el catálogo de MusicTab: tabs por artista, género o instrumento, las más recientes, las que más o menos visitaste, las que hace rato no abrís o las que nunca visitaste. Por ejemplo: ¿hay tabs de Milo J?, tabs de ukelele, rock de Milo J.';

export function emptyHitsReply(intent: CopilotIntent): string {
  if (intent === 'top_viewed_me' || intent === 'stale_for_me') {
    return 'Todavía no registré visitas tuyas (abrí un PDF).';
  }
  if (intent === 'never_viewed_me') {
    return 'No encontré tabs que no hayas visitado en MusicTab.';
  }
  if (intent === 'latest' || intent === 'top_viewed_global') {
    return 'No hay resultados en MusicTab.';
  }
  return 'No hay resultados en MusicTab para esa búsqueda.';
}

export function hitsTemplateReply(intent: CopilotIntent, hits: CopilotTabHit[]): string {
  const lines = hits.map((hit, index) => {
    const base = `${index + 1}. ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}`;
    if (intent === 'stale_for_me' && hit.lastViewedAt) {
      return `${base} (última visita: ${hit.lastViewedAt})`;
    }
    return base;
  });
  return `Encontré estas tabs en MusicTab:\n${lines.join('\n')}`;
}
