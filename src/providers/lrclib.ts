import type { Env } from "../env";
import type { LyricsProvider, LyricsRecord } from "./types";

const BASE = "https://lrclib.net/api";

function normalize(item: any): LyricsRecord {
  return {
    id: String(item.id),
    title: String(item.trackName ?? item.name ?? ""),
    artist: String(item.artistName ?? ""),
    album: item.albumName ?? null,
    duration: typeof item.duration === "number" ? item.duration : null,
    instrumental: Boolean(item.instrumental),
    lyrics: {
      plain: item.plainLyrics ?? null,
      synced: item.syncedLyrics ?? null,
      ttml: null
    },
    source: {
      name: "LRCLIB",
      id: String(item.id),
      attributionUrl: "https://lrclib.net/"
    }
  };
}

async function request(url: string, env: Env): Promise<Response> {
  return fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": env.LRCLIB_USER_AGENT ?? "LyricsKosh/1.0.0"
    },
    signal: AbortSignal.timeout(8000)
  });
}

export const lrclibProvider: LyricsProvider = {
  name: "lrclib",
  attributionUrl: "https://lrclib.net/",
  async search(query, env) {
    const response = await request(
      `${BASE}/search?q=${encodeURIComponent(query)}`,
      env
    );
    if (!response.ok) throw new Error(`LRCLIB search failed: ${response.status}`);
    const data = await response.json() as any[];
    return data.map(normalize);
  },
  async getById(id, env) {
    const response = await request(`${BASE}/get/${encodeURIComponent(id)}`, env);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`LRCLIB lookup failed: ${response.status}`);
    return normalize(await response.json());
  }
};
