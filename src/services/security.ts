import type { Context, Next } from "hono";
import type { Env, AppVariables } from "../env";

const encoder = new TextEncoder();

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function hashSecret(value: string): Promise<string> {
  return sha256(value);
}

export async function securityMiddleware(c: Context<{ Bindings: Env; Variables: AppVariables }>, next: Next) {
  const rawKey = c.req.header("X-API-Key");
  const ip = c.req.header("CF-Connecting-IP");
  let identity = ip ? `ip:${ip}` : `request:${c.get("requestId")}`;
  let tier: AppVariables["tier"] = "anonymous";
  let keyId: string | undefined;

  if (rawKey) {
    const keyHash = await sha256(rawKey);
    const row = await c.env.DB.prepare(
      "SELECT id, tier FROM api_keys WHERE key_hash = ? AND active = 1 LIMIT 1"
    ).bind(keyHash).first<{ id: string; tier: string }>();
    if (!row) return c.json({ error: "Invalid API key" }, 401);
    keyId = row.id;
    tier = row.tier === "admin" ? "admin" : "free";
    identity = `key:${row.id}`;
    c.executionCtx.waitUntil(c.env.DB.prepare("UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id).run());
  }

  // Fixed-window D1 counter is a basic starter limiter. For high traffic, replace
  // with Cloudflare's native Rate Limiting binding or a Durable Object limiter.
  const now = Math.floor(Date.now() / 60000);
  const limit = tier === "anonymous" ? 30 : tier === "admin" ? 600 : 120;
  const identityHash = await sha256(identity);
  const result = await c.env.DB.prepare(`
    INSERT INTO api_usage (identity_hash, window_start, request_count)
    VALUES (?, ?, 1)
    ON CONFLICT(identity_hash, window_start)
    DO UPDATE SET request_count = request_count + 1
    RETURNING request_count
  `).bind(identityHash, now).first<{ request_count: number }>();

  if ((result?.request_count ?? 1) > limit) {
    return c.json({ error: "Rate limit exceeded", retryAfterSeconds: 60 }, 429, { "Retry-After": "60" });
  }

  c.set("tier", tier);
  if (keyId) c.set("apiKeyId", keyId);
  await next();
}

export async function requireAdmin(c: Context<{ Bindings: Env; Variables: AppVariables }>): Promise<boolean> {
  const supplied = c.req.header("X-Admin-Secret");
  if (!supplied || !c.env.ADMIN_SECRET) return false;
  const a = await sha256(supplied);
  const b = await sha256(c.env.ADMIN_SECRET);
  return a === b;
}

export async function issueApiKey(db: D1Database, label: string, tier = "free") {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const key = "lk_" + btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const id = crypto.randomUUID();
  await db.prepare("INSERT INTO api_keys (id, key_hash, label, tier) VALUES (?, ?, ?, ?)")
    .bind(id, await sha256(key), label, tier).run();
  return { id, key, label, tier };
}
