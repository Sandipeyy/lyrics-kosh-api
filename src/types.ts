export type LyricsProviderName = "lrclib" | "lrc-red";

export interface LyricsRecord {
  id: string;
  provider: LyricsProviderName;
  providerId: string;
  title: string;
  artist: string;
  album: string | null;
  durationMs: number | null;
  instrumental: boolean;
  synced: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
  language?: string | null;
  sourceUrl: string;
}

export interface ProviderSearchResult {
  provider: LyricsProviderName;
  results: LyricsRecord[];
  error?: string;
}
