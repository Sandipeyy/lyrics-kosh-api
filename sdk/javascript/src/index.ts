export interface LyricsKoshOptions {
  baseUrl: string;
  apiKey?: string;
}

export class LyricsKosh {
  constructor(private options: LyricsKoshOptions) {}

  private async request<T>(path: string): Promise<T> {
    const response = await fetch(new URL(path, this.options.baseUrl), {
      headers: this.options.apiKey ? { "X-API-Key": this.options.apiKey } : {}
    });
    if (!response.ok) throw new Error(`Lyrics Kosh API error: ${response.status}`);
    return response.json() as Promise<T>;
  }

  search<T = unknown>(query: string): Promise<T> {
    return this.request(`/v1/search?q=${encodeURIComponent(query)}`);
  }

  getLyrics<T = unknown>(provider: string, id: string): Promise<T> {
    return this.request(`/v1/lyrics/${encodeURIComponent(provider)}/${encodeURIComponent(id)}`);
  }
}
