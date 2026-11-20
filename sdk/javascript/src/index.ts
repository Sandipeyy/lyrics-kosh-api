export interface LyricsKoshOptions {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
}

export class LyricsKoshError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "LyricsKoshError";
  }
}

export class LyricsKosh {
  private baseUrl: string;
  constructor(private options: LyricsKoshOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
  }

  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params ?? {}).forEach(([key, value]) => url.searchParams.set(key, value));
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 10000);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {})
        },
        signal: controller.signal
      });
      const data = await response.json() as T & { error?: string };
      if (!response.ok) throw new LyricsKoshError(data.error ?? "Request failed", response.status);
      return data;
    } finally {
      clearTimeout(timer);
    }
  }

  search(query: string) {
    return this.get("/v1/search", { q: query });
  }

  getLyrics(id: string, provider: string) {
    return this.get("/v1/lyrics", { id, provider });
  }

  providers() {
    return this.get("/v1/providers");
  }

  health() {
    return this.get("/v1/health");
  }
}
