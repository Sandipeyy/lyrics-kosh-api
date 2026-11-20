import type { Env } from "../env";
import type { LyricsRecord } from "../types";
import type { LyricsProvider } from "./types";

const BASE = "https://lrclib.net/api";

export class LrclibProvider implements LyricsProvider {
  readonly name = "lrclib" as const;
  constructor(private env: Env) {}

  private headers(): HeadersInit {
    return { "User-Agent": this.env.LRCLIB_USER_AGENT || "LyricsKosh/1.1 (contact: configure-user-agent)" };
  }

  async search(query: string): Promise<LyricsRecord[]> {
    const response = await fetch(`${BASE}/search?q=${encodeURIComponent(query)}`, { headers: this.headers() });
    if (!response.ok) throw new Error(`LRCLIB search failed (${response.status})`);
    const rows = await response.json() as any[];
    return rows.map(row => this.map(row));
  }

  async getLyrics(providerId: string): Promise<LyricsRecord | null> {
    const response = await fetch(`${BASE}/get/${encodeURIComponent(providerId)}`, { headers: this.headers() });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`LRCLIB lookup failed (${response.status})`);
    return this.map(await response.json());
  }

  private map(row: any): LyricsRecord {
    return {
      id: `lrclib:${row.id}`, provider: "lrclib", providerId: String(row.id),
      title: String(row.trackName ?? ""), artist: String(row.artistName ?? ""),
      album: row.albumName ?? null,
      durationMs: Number.isFinite(row.duration) ? Math.round(row.duration * 1000) : null,
      instrumental: Boolean(row.instrumental),
      synced: Boolean(row.syncedLyrics),
      plainLyrics: row.plainLyrics ?? null, syncedLyrics: row.syncedLyrics ?? null,
      sourceUrl: `https://lrclib.net`
    };
  }
}
