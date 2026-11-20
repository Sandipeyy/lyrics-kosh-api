import type { Env } from "../env";
import type { LyricsRecord } from "../types";
import type { LyricsProvider } from "./types";
import { LrclibProvider } from "./lrclib";
import { LrcRedProvider } from "./lrc-red";

function createProviders(env: Env): LyricsProvider[] {
  return [new LrclibProvider(env), new LrcRedProvider(env)];
}

export function listProviders() {
  return [
    { name: "lrclib", attributionUrl: "https://lrclib.net" },
    { name: "lrc-red", attributionUrl: "https://lrc.red" }
  ];
}

export async function searchAll(
  query: string,
  env: Env
): Promise<{ results: LyricsRecord[]; providerFailures: string[] }> {
  const providers = createProviders(env);
  const settled = await Promise.allSettled(
    providers.map(provider => provider.search(query))
  );

  const results: LyricsRecord[] = [];
  const providerFailures: string[] = [];

  settled.forEach((item, index) => {
    if (item.status === "fulfilled") {
      results.push(...item.value);
    } else {
      providerFailures.push(providers[index].name);
    }
  });

  return { results, providerFailures };
}

export async function getFromProvider(
  providerName: string,
  id: string,
  env: Env
): Promise<LyricsRecord | null> {
  const provider = createProviders(env).find(item => item.name === providerName);
  if (!provider) throw new Error("Unknown provider");
  return provider.getLyrics(id);
}
