import { CopilotTabHit } from '@domain/dto/CopilotTabHit';
import type { CopilotIntent } from './graph/copilot.schema';

export const OUT_OF_SCOPE_REPLY =
  'Solo puedo ayudarte con el catálogo de MusicTab. Preguntame por tabs, conteos, géneros, instrumentos, artistas, quién las subió, tus visitas al PDF o cuántos mensajes te quedan. Escribí "qué podés hacer" para ver ejemplos.';

export const HELP_REPLY = `Puedo ayudarte con el catálogo de MusicTab (sin inventar canciones):

• Buscar por artista, género, instrumento o título (ej. ¿hay tabs de Milo J?, Bohemian Rhapsody, ukelele).
• Contar tabs: de un artista, de rock, de guitarra, o cuántas hay en total.
• Listar qué géneros, instrumentos o artistas hay cargados.
• Ranking: las más/menos visitadas, las que más/menos visitaste, las más recientes.
• Tu historial de View PDF: la última que abriste, cuántos PDFs abriste, las que hace rato no abrís o nunca visitaste.
• Tabs que subió un usuario (por username) o las que subiste vos.
• Cuántos mensajes de Copilot te quedan hoy.

No leo el PDF, no doy letras ni acordes, ni ranking de descargas.`;

export function emptyHitsReply(intent: CopilotIntent): string {
  if (intent === 'top_viewed_me' || intent === 'stale_for_me' || intent === 'last_viewed_me') {
    return 'Todavía no registré visitas tuyas (abrí un PDF).';
  }
  if (intent === 'never_viewed_me') {
    return 'No encontré tabs que no hayas visitado en MusicTab.';
  }
  if (intent === 'latest' || intent === 'top_viewed_global') {
    return 'No hay resultados en MusicTab.';
  }
  if (intent === 'count_by_artist') {
    return 'No hay tabs de ese artista en MusicTab.';
  }
  if (intent === 'search_by_uploader') {
    return 'No encontré tabs subidas por ese usuario.';
  }
  if (intent === 'list_facets') {
    return 'No hay datos de catálogo para listar.';
  }
  return 'No hay resultados en MusicTab para esa búsqueda.';
}

export function countCatalogReply(label: string, count: number, hits: CopilotTabHit[]): string {
  if (count === 0) {
    return label
      ? `No hay tabs de ${label} en MusicTab.`
      : 'No hay tabs en MusicTab.';
  }
  const noun = count === 1 ? 'tab' : 'tabs';
  const intro = label
    ? `Hay ${count} ${noun} de ${label} en MusicTab.`
    : `Hay ${count} ${noun} en MusicTab.`;
  if (hits.length === 0) return intro;
  const samples = hits
    .map((hit, index) => `${index + 1}. ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}`)
    .join('\n');
  return `${intro} Te muestro hasta ${hits.length}:\n${samples}`;
}

export function countByArtistReply(artist: string, count: number, hits: CopilotTabHit[]): string {
  if (!artist.trim()) {
    return 'Decime de qué artista querés el conteo. Por ejemplo: ¿cuántas tabs de Milo J hay?';
  }
  return countCatalogReply(artist.trim(), count, hits);
}

export function listFacetsReply(facet: string, names: string[]): string {
  if (names.length === 0) return 'No hay datos de catálogo para listar.';
  const labels: Record<string, string> = {
    genre: 'Géneros en MusicTab',
    instrument: 'Instrumentos en MusicTab',
    artist: 'Artistas con tabs en MusicTab',
  };
  const title = labels[facet] ?? 'Catálogo de MusicTab';
  return `${title}: ${names.join(', ')}.`;
}

export function lastViewedReply(hit: CopilotTabHit): string {
  const when = hit.lastViewedAt ? ` (última vez: ${hit.lastViewedAt})` : '';
  return `La última tab cuyo PDF abriste es ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}.${when}`;
}

export function countMyViewsReply(events: number, distinctTabs: number): string {
  if (events === 0) {
    return 'Todavía no registré visitas tuyas (abrí un PDF).';
  }
  const pdfNoun = events === 1 ? 'vez' : 'veces';
  const tabNoun = distinctTabs === 1 ? 'tab distinta' : 'tabs distintas';
  return `Abriste un PDF ${events} ${pdfNoun} (${distinctTabs} ${tabNoun}).`;
}

export function uploaderReply(username: string, total: number, hits: CopilotTabHit[]): string {
  if (total === 0) {
    return `No encontré tabs subidas por ${username}.`;
  }
  const noun = total === 1 ? 'tab' : 'tabs';
  const intro = `${username} subió ${total} ${noun} a MusicTab.`;
  if (hits.length === 0) return intro;
  const samples = hits
    .map((hit, index) => `${index + 1}. ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}`)
    .join('\n');
  return `${intro} Te muestro hasta ${hits.length}:\n${samples}`;
}

export function quotaReply(used: number, remaining: number, limit: number): string {
  if (remaining <= 0) {
    return `Ya usaste los ${limit} mensajes de Copilot de hoy. Mañana se reinicia el cupo.`;
  }
  return `Hoy usaste ${used} de ${limit} mensajes. Te quedan ${remaining}.`;
}

export function hitsTemplateReply(intent: CopilotIntent, hits: CopilotTabHit[]): string {
  const lines = hits.map((hit, index) => {
    const base = `${index + 1}. ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}`;
    if ((intent === 'stale_for_me' || intent === 'last_viewed_me') && hit.lastViewedAt) {
      return `${base} (última visita: ${hit.lastViewedAt})`;
    }
    return base;
  });
  return `Encontré estas tabs en MusicTab:\n${lines.join('\n')}`;
}
