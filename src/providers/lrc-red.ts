import type { Env } from "../env";
import type { LyricsRecord } from "../types";
import type { LyricsProvider } from "./types";
import { parseTtml } from "../lib/ttml";

const BASE = "https://lrcred.com";

export class LrcRedProvider implements LyricsProvider {
  readonly name = "lrc-red" as const;
  constructor(private env: Env) {}

  private headers(): HeadersInit {
    return { "User-Agent": this.env.LRC_RED_USER_AGENT || "LyricsKosh/1.1 (contact: configure-user-agent)" };
  }

  async search(query: string): Promise<LyricsRecord[]> {
    const response = await fetch(`${BASE}/search.json?q=${encodeURIComponent(query)}`, { headers: this.headers() });
    if (!response.ok) throw new Error(`lrc.red search failed (${response.status})`);
    const body = await response.json() as any;
    const hits = Array.isArray(body) ? body : (body.hits ?? []);
    return hits.map((hit: any) => ({
      id: `lrc-red:${hit.isrc ?? hit.id ?? hit.title}`,
      provider: "lrc-red", providerId: String(hit.isrc ?? hit.id ?? ""),
      title: String(hit.title ?? ""), artist: String(hit.artist ?? ""),
      album: hit.album ?? null,
      durationMs: Number.isFinite(hit.duration) ? Math.round(hit.duration * 1000) : null,
      instrumental: false, synced: false, plainLyrics: null, syncedLyrics: null,
      sourceUrl: BASE
    })).filter((item: LyricsRecord) => item.providerId);
  }

  async getLyrics(providerId: string): Promise<LyricsRecord | null> {
    const response = await fetch(`${BASE}/s/${encodeURIComponent(providerId)}.json`, { headers: this.headers() });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`lrc.red lookup failed (${response.status})`);
    const body = await response.json() as any;
    const files: any[] = body.files ?? [];
    const lrc = files.find(file => String(file.format ?? file.type ?? "").toLowerCase().includes("lrc"));
    const ttml = files.find(file => String(file.format ?? file.type ?? "").toLowerCase().includes("ttml"));
    let syncedLyrics: string | null = null;
    let plainLyrics: string | null = null;
    const selected = lrc ?? ttml;
    if (selected?.url) {
      const lyricResponse = await fetch(selected.url, { headers: this.headers() });
      if (lyricResponse.ok) {
        const content = await lyricResponse.text();
        if (ttml === selected) {
          syncedLyrics = parseTtml(content).map(line => {
            const minutes = Math.floor(line.beginMs / 60000);
            const seconds = Math.floor((line.beginMs % 60000) / 1000);
            const hundredths = Math.floor((line.beginMs % 1000) / 10);
            return `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}]${line.text}`;
          }).join("\n");
        } else syncedLyrics = content;
        plainLyrics = content.replace(/\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]/g, "").trim();
      }
    }
    return {
      id: `lrc-red:${providerId}`, provider: "lrc-red", providerId,
      title: String(body.title ?? ""), artist: String(body.artist ?? ""),
      album: body.album ?? null, durationMs: Number.isFinite(body.duration) ? Math.round(body.duration * 1000) : null,
      instrumental: false, synced: Boolean(syncedLyrics), plainLyrics, syncedLyrics, sourceUrl: BASE
    };
  }
}
