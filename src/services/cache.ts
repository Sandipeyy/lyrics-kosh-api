const memoryCache = caches.default;

export async function cachedJson<T>(request: Request, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  const key = new Request(new URL(request.url).toString(), { method: "GET" });
  const cached = await memoryCache.match(key);
  if (cached) return await cached.json() as T;
  const value = await loader();
  const response = new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${ttlSeconds}` }
  });
  try { await memoryCache.put(key, response); } catch { /* Cache API is best-effort. */ }
  return value;
}
