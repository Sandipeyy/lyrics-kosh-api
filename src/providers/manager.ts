import type { Env } from "../env";
import type { LyricsProvider, LyricsRecord } from "./types";
import { lrclibProvider } from "./lrclib";
import { lrcRedProvider } from "./lrc-red";

const providers: LyricsProvider[] = [lrclibProvider, lrcRedProvider];

export function listProviders() {
  return providers.map(provider => ({
    name: provider.name,
    attributionUrl: provider.attributionUrl
  }));
}

export async function searchAll(
  query: string,
  env: Env
): Promise<{ results: LyricsRecord[]; providerFailures: string[] }> {
  const settled = await Promise.allSettled(
    providers.map(provider => provider.search(query, env))
  );
  const results: LyricsRecord[] = [];
  const providerFailures: string[] = [];

  settled.forEach((item, index) => {
    if (item.status === "fulfilled") results.push(...item.value);
    else providerFailures.push(providers[index].name);
  });

  return { results, providerFailures };
}

export async function getFromProvider(
  providerName: string,
  id: string,
  env: Env
): Promise<LyricsRecord | null> {
  const provider = providers.find(item => item.name === providerName);
  if (!provider) throw new Error("Unknown provider");
  return provider.getById(id, env);
}
