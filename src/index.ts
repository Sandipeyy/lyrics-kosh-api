import { Hono } from "hono";
import type { Env } from "./env";
import { listProviders, searchAll, getFromProvider } from "./providers/manager";
import { cacheGet, cachePut } from "./services/cache";
import { coalesce } from "./services/dedupe";

const app = new Hono<{ Bindings: Env }>();

app.get("/", c => c.json({
  service: "Lyrics Kosh",
  tagline: "Every lyric. One foundation.",
  docs: "/v1/health"
}));

app.get("/v1/health", c => c.json({
  success: true,
  service: "Lyrics Kosh",
  status: "operational",
  timestamp: new Date().toISOString()
}));

app.get("/v1/providers", c => c.json({
  success: true,
  providers: listProviders()
}));

app.get("/v1/search", async c => {
  const query = (c.req.query("q") ?? "").trim();
  if (!query) return c.json({ success: false, error: "Missing required query parameter: q" }, 400);
  if (query.length > 200) return c.json({ success: false, error: "Query is too long" }, 400);

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = await cacheGet<Awaited<ReturnType<typeof searchAll>>>(cacheKey);
  if (cached) {
    c.header("X-Lyrics-Kosh-Cache", "HIT");
    return c.json({ success: true, query, ...cached });
  }

  const result = await coalesce(cacheKey, () => searchAll(query, c.env));
  // Provider terms may restrict caching. Review current terms before enabling this
  // cache in a public deployment; the conservative short TTL is configurable.
  await cachePut(cacheKey, result, 60);
  c.header("X-Lyrics-Kosh-Cache", "MISS");
  return c.json({ success: true, query, ...result });
});

app.get("/v1/lyrics", async c => {
  const id = c.req.query("id");
  const provider = c.req.query("provider");
  if (!id || !provider) {
    return c.json({ success: false, error: "Both id and provider are required" }, 400);
  }

  try {
    const record = await getFromProvider(provider, id, c.env);
    if (!record) return c.json({ success: false, error: "Lyrics record not found" }, 404);
    return c.json({ success: true, result: record });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Provider request failed";
    return c.json({ success: false, error: message }, 502);
  }
});

app.notFound(c => c.json({ success: false, error: "Route not found" }, 404));

app.onError((error, c) => {
  return c.json({
    success: false,
    error: "Internal server error"
  }, 500);
});

export default app;
