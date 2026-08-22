import { CopilotTabHit } from '@domain/dto/CopilotTabHit';
import type { CopilotIntent } from './graph/copilot.schema';

export const OUT_OF_SCOPE_REPLY =
  'I can only help with the MusicTab catalog. Ask about tabs, counts, genres, instruments, artists, who uploaded them, your PDF views, or how many Pua messages you have left. Type "what can you do" for examples.';

export const HELP_REPLY = `I can help with the MusicTab catalog (I never invent songs). You can ask in English or Spanish; I always reply in English.

• Search by artist, genre, instrument, or title (e.g. are there tabs by Milo J?, Bohemian Rhapsody, ukulele).
• Count tabs: by artist, rock, guitar, or how many there are in total.
• List which genres, instruments, or artists are in the catalog.
• Rankings: most/least viewed, the ones you viewed most/least, most recent.
• Your View PDF history: last one you opened, how many PDFs you opened, ones you haven't opened in a while, or never visited.
• Tabs uploaded by a username, or the ones you uploaded.
• How many Pua messages you have left today.

I don't read the PDF, I don't give lyrics or chords, and there's no download ranking.`;

export function emptyHitsReply(intent: CopilotIntent): string {
  if (intent === 'top_viewed_me' || intent === 'stale_for_me' || intent === 'last_viewed_me') {
    return "I haven't recorded any of your visits yet (open a PDF).";
  }
  if (intent === 'never_viewed_me') {
    return "I couldn't find tabs you haven't visited in MusicTab.";
  }
  if (intent === 'latest' || intent === 'top_viewed_global') {
    return 'No results in MusicTab.';
  }
  if (intent === 'count_by_artist') {
    return 'There are no tabs by that artist in MusicTab.';
  }
  if (intent === 'search_by_uploader') {
    return "I couldn't find tabs uploaded by that user.";
  }
  if (intent === 'list_facets') {
    return "There's no catalog data to list.";
  }
  return 'No results in MusicTab for that search.';
}

export function countCatalogReply(label: string, count: number, hits: CopilotTabHit[]): string {
  if (count === 0) {
    return label
      ? `There are no tabs for ${label} in MusicTab.`
      : 'There are no tabs in MusicTab.';
  }
  const verb = count === 1 ? 'is' : 'are';
  const noun = count === 1 ? 'tab' : 'tabs';
  const intro = label
    ? `There ${verb} ${count} ${noun} for ${label} in MusicTab.`
    : `There ${verb} ${count} ${noun} in MusicTab.`;
  if (hits.length === 0) return intro;
  const samples = hits
    .map((hit, index) => `${index + 1}. ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}`)
    .join('\n');
  return `${intro} Here are up to ${hits.length}:\n${samples}`;
}

export function countByArtistReply(artist: string, count: number, hits: CopilotTabHit[]): string {
  if (!artist.trim()) {
    return 'Tell me which artist you want a count for. For example: how many tabs by Milo J are there?';
  }
  return countCatalogReply(artist.trim(), count, hits);
}

export function listFacetsReply(facet: string, names: string[]): string {
  if (names.length === 0) return "There's no catalog data to list.";
  const labels: Record<string, string> = {
    genre: 'Genres in MusicTab',
    instrument: 'Instruments in MusicTab',
    artist: 'Artists with tabs in MusicTab',
  };
  const title = labels[facet] ?? 'MusicTab catalog';
  return `${title}: ${names.join(', ')}.`;
}

export function lastViewedReply(hit: CopilotTabHit): string {
  const when = hit.lastViewedAt ? ` (last time: ${hit.lastViewedAt})` : '';
  return `The last tab whose PDF you opened is ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}.${when}`;
}

export function countMyViewsReply(events: number, distinctTabs: number): string {
  if (events === 0) {
    return "I haven't recorded any of your visits yet (open a PDF).";
  }
  const timeNoun = events === 1 ? 'time' : 'times';
  const tabNoun = distinctTabs === 1 ? 'distinct tab' : 'distinct tabs';
  return `You opened a PDF ${events} ${timeNoun} (${distinctTabs} ${tabNoun}).`;
}

export function uploaderReply(username: string, total: number, hits: CopilotTabHit[]): string {
  if (total === 0) {
    return `I couldn't find tabs uploaded by ${username}.`;
  }
  const noun = total === 1 ? 'tab' : 'tabs';
  const intro = `${username} uploaded ${total} ${noun} to MusicTab.`;
  if (hits.length === 0) return intro;
  const samples = hits
    .map((hit, index) => `${index + 1}. ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}`)
    .join('\n');
  return `${intro} Here are up to ${hits.length}:\n${samples}`;
}

export function quotaReply(used: number, remaining: number, limit: number): string {
  if (remaining <= 0) {
    return `You've used all ${limit} Pua messages for today. Your quota resets tomorrow.`;
  }
  return `Today you used ${used} of ${limit} messages. You have ${remaining} left.`;
}

export function hitsTemplateReply(intent: CopilotIntent, hits: CopilotTabHit[]): string {
  const lines = hits.map((hit, index) => {
    const base = `${index + 1}. ${hit.title} — ${hit.artist} — ${hit.genre} — ${hit.instrument}`;
    if ((intent === 'stale_for_me' || intent === 'last_viewed_me') && hit.lastViewedAt) {
      return `${base} (last visit: ${hit.lastViewedAt})`;
    }
    return base;
  });
  return `I found these tabs in MusicTab:\n${lines.join('\n')}`;
}
