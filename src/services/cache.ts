export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const request = new Request(`https://lyrics-kosh-cache.invalid/${encodeURIComponent(key)}`);
    const response = await caches.default.match(request);
    if (!response) return null;
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function cachePut<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  try {
    const request = new Request(`https://lyrics-kosh-cache.invalid/${encodeURIComponent(key)}`);
    await caches.default.put(request, new Response(JSON.stringify(value), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${ttlSeconds}`
      }
    }));
  } catch {
    // Cache is best-effort; it must not fail the API request.
  }
}
