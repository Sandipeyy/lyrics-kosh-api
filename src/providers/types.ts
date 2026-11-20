export interface LyricsRecord {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  duration: number | null;
  instrumental: boolean;
  lyrics: {
    plain: string | null;
    synced: string | null;
    ttml: string | null;
  };
  source: {
    name: string;
    id: string;
    attributionUrl: string;
  };
}

export interface LyricsProvider {
  name: string;
  attributionUrl: string;
  search(query: string, env: import("../env").Env): Promise<LyricsRecord[]>;
  getById(id: string, env: import("../env").Env): Promise<LyricsRecord | null>;
}
