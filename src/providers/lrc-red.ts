import type { Env } from "../env";
import type { LyricsProvider, LyricsRecord } from "./types";

const BASE = "https://lrc.red";

function normalize(item: any): LyricsRecord {
  const files = item.files ?? {};
  return {
    id: String(item.isrc ?? item.id ?? ""),
    title: String(item.title ?? ""),
    artist: String(item.artist ?? ""),
    album: item.album ?? null,
    duration: typeof item.duration === "number" ? item.duration : null,
    instrumental: false,
    lyrics: {
      plain: null,
      synced: typeof files.lrc === "string" ? files.lrc : null,
      ttml: typeof files.ttml === "string" ? files.ttml : null
    },
    source: {
      name: "lrc.red",
      id: String(item.isrc ?? item.id ?? ""),
      attributionUrl: "https://lrc.red/"
    }
  };
}

export const lrcRedProvider: LyricsProvider = {
  name: "lrc-red",
  attributionUrl: "https://lrc.red/",
  async search(query, env: Env) {
    const response = await fetch(
      `${BASE}/search.json?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": env.LRC_RED_USER_AGENT ?? "LyricsKosh/1.0.0"
        },
        signal: AbortSignal.timeout(8000)
      }
    );
    if (!response.ok) throw new Error(`lrc.red search failed: ${response.status}`);
    const payload = await response.json() as any;
    const hits = Array.isArray(payload.hits) ? payload.hits : [];
    return hits.map(normalize);
  },
  async getById(id, env) {
    const response = await fetch(`${BASE}/s/${encodeURIComponent(id)}.json`, {
      headers: {
        "Accept": "application/json",
        "User-Agent": env.LRC_RED_USER_AGENT ?? "LyricsKosh/1.0.0"
      },
      signal: AbortSignal.timeout(8000)
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`lrc.red lookup failed: ${response.status}`);
    return normalize(await response.json());
  }
};
