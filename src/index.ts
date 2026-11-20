import { Hono } from "hono";
import type { Env, AppVariables } from "./env";
import { searchProviders, getFromProvider } from "./services/providers";
import { cachedJson } from "./services/cache";
import { securityMiddleware, requireAdmin, issueApiKey } from "./services/security";
import { submitContribution } from "./services/contributions";
import { matchScore } from "./lib/normalize";
import { scoreLyrics } from "./lib/lrc";

type AppEnv = { Bindings: Env; Variables: AppVariables };
const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  c.set("requestId", crypto.randomUUID());
  await next();
  c.header("X-Request-Id", c.get("requestId"));
});

app.get("/", c => c.json({
  name: "Lyrics Kosh API",
  version: "1.1.0",
  tagline: "Every lyric. One foundation.",
  docs: "/docs",
  health: "/v1/health"
}));

app.get("/v1/health", c => c.json({ status: "ok", service: "lyrics-kosh-api", timestamp: new Date().toISOString() }));

app.get("/v1/providers", c => c.json({
  providers: [
    { id: "lrclib", name: "LRCLIB", attribution: "https://lrclib.net" },
    { id: "lrc-red", name: "lrc.red", attribution: "https://lrc.red" }
  ]
}));

app.use("/v1/*", async (c, next) => {
  if (c.req.path === "/v1/health" || c.req.path === "/v1/providers") return next();
  return securityMiddleware(c, next);
});

app.get("/v1/search", async c => {
  const query = (c.req.query("q") ?? "").trim();
  if (query.length < 2 || query.length > 200) return c.json({ error: "q must be between 2 and 200 characters" }, 400);
  const result = await cachedJson(c.req.raw, 60, async () => {
    const providers = await searchProviders(c.env, query);
    const records = providers.flatMap(provider => provider.results);
    return {
      query,
      results: records.map(record => ({
        ...record,
        qualityScore: scoreLyrics(record)
      })).sort((a, b) => Number(b.synced) - Number(a.synced) || b.qualityScore - a.qualityScore),
      providers: providers.map(({ provider, error }) => ({ provider, status: error ? "unavailable" : "ok" }))
    };
  });
  return c.json(result);
});

app.get("/v1/lyrics/:provider/:id", async c => {
  const provider = c.req.param("provider");
  const id = c.req.param("id");
  if (!["lrclib", "lrc-red"].includes(provider)) return c.json({ error: "Unsupported provider" }, 400);
  const result = await cachedJson(c.req.raw, 300, () => getFromProvider(c.env, provider, id));
  if (!result) return c.json({ error: "Lyrics not found" }, 404);
  return c.json({ ...result, qualityScore: scoreLyrics(result) });
});

app.post("/v1/contributions", c => submitContribution(c));

app.post("/admin/keys", async c => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json().catch(() => null) as any;
  if (!body || typeof body.label !== "string" || body.label.trim().length < 2) {
    return c.json({ error: "A key label is required" }, 400);
  }
  const tier = body.tier === "admin" ? "admin" : "free";
  const key = await issueApiKey(c.env.DB, body.label.trim().slice(0, 100), tier);
  return c.json({ ...key, warning: "Copy this key now. It cannot be retrieved again." }, 201);
});

app.get("/admin/contributions", async c => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const rows = await c.env.DB.prepare(
    "SELECT id, title, artist, rights_basis, status, created_at FROM contributions WHERE status = 'pending' ORDER BY created_at LIMIT 100"
  ).all();
  return c.json({ contributions: rows.results });
});

app.patch("/admin/contributions/:id", async c => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const body = await c.req.json().catch(() => null) as any;
  if (!body || !["approved", "rejected"].includes(body.status)) return c.json({ error: "status must be approved or rejected" }, 400);
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(
    "UPDATE contributions SET status = ?, review_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'"
  ).bind(body.status, typeof body.note === "string" ? body.note.slice(0, 1000) : null, id).run();
  if (!result.meta.changes) return c.json({ error: "Pending contribution not found" }, 404);
  await c.env.DB.prepare("INSERT INTO moderation_events (id, contribution_id, event_type, details) VALUES (?, ?, ?, ?)")
    .bind(crypto.randomUUID(), id, body.status, typeof body.note === "string" ? body.note.slice(0, 1000) : null).run();
  return c.json({ id, status: body.status });
});

app.get("/admin/metrics", async c => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);
  const usage = await c.env.DB.prepare("SELECT COUNT(*) AS total_keys FROM api_keys WHERE active = 1").first();
  const pending = await c.env.DB.prepare("SELECT COUNT(*) AS pending FROM contributions WHERE status = 'pending'").first();
  return c.json({ activeKeys: usage?.total_keys ?? 0, pendingContributions: pending?.pending ?? 0 });
});

app.notFound(c => c.json({ error: "Not found" }, 404));
app.onError((error, c) => {
  // Do not log query strings, API keys, or lyric payloads.
  console.error("Lyrics Kosh request failed", { requestId: c.get("requestId"), message: error.message });
  return c.json({ error: "Internal server error", requestId: c.get("requestId") }, 500);
});

export default {
  fetch: app.fetch,
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    // Keep housekeeping bounded; do not collect lyric content in telemetry.
    ctx.waitUntil(env.DB.prepare("DELETE FROM api_usage WHERE window_start < ?").bind(Math.floor(Date.now() / 60000) - 1440).run());
    ctx.waitUntil(env.DB.prepare("DELETE FROM api_metrics WHERE created_at < datetime('now', '-30 days')").run());
  }
};
