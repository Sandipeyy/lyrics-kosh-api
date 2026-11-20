import type { LyricsRecord, LyricsProviderName } from "../types";

export interface LyricsProvider {
  readonly name: LyricsProviderName;
  search(query: string): Promise<LyricsRecord[]>;
  getLyrics(providerId: string): Promise<LyricsRecord | null>;
}
