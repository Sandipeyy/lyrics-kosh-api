import type { Env } from "../env";
import type { LyricsRecord, LyricsProviderName, ProviderSearchResult } from "../types";
import { LrclibProvider } from "../providers/lrclib";
import { LrcRedProvider } from "../providers/lrc-red";
import type { LyricsProvider } from "../providers/types";

export function createProviders(env: Env): LyricsProvider[] {
  return [new LrclibProvider(env), new LrcRedProvider(env)];
}

export async function searchProviders(env: Env, query: string): Promise<ProviderSearchResult[]> {
  const providers = createProviders(env);
  const settled = await Promise.allSettled(providers.map(provider => provider.search(query)));
  return settled.map((result, index) => result.status === "fulfilled"
    ? { provider: providers[index].name, results: result.value }
    : { provider: providers[index].name, results: [], error: "Provider temporarily unavailable" });
}

export async function getFromProvider(env: Env, providerName: string, providerId: string): Promise<LyricsRecord | null> {
  const provider = createProviders(env).find(item => item.name === providerName);
  if (!provider) throw new Error("Unsupported provider");
  return provider.getLyrics(providerId);
}
