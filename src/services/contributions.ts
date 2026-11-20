import type { Context } from "hono";
import type { Env, AppVariables } from "../env";
import { parseLrc, scoreLyrics } from "../lib/lrc";

type AppContext = Context<{ Bindings: Env; Variables: AppVariables }>;

export async function submitContribution(c: AppContext) {
  const body = await c.req.json().catch(() => null) as any;
  if (!body || typeof body.title !== "string" || typeof body.artist !== "string") {
    return c.json({ error: "title and artist are required" }, 400);
  }
  const rightsBasis = body.rightsBasis;
  if (!["owned", "authorized"].includes(rightsBasis) || body.rightsConfirmed !== true) {
    return c.json({ error: "Contributions require owned/authorized rights confirmation" }, 400);
  }
  const plain = typeof body.plainLyrics === "string" ? body.plainLyrics.trim() : null;
  const synced = typeof body.syncedLyrics === "string" ? body.syncedLyrics.trim() : null;
  if ((!plain && !synced) || (plain && plain.length > 20000) || (synced && synced.length > 30000)) {
    return c.json({ error: "Lyrics are required and must be within size limits" }, 400);
  }
  if (synced && !parseLrc(synced).valid) return c.json({ error: "syncedLyrics must contain valid LRC timestamps" }, 400);
  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO contributions
    (id, contributor_key_hash, title, artist, album, duration_ms, plain_lyrics, synced_lyrics, rights_basis, rights_confirmed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    id, c.get("apiKeyId") ?? "anonymous", body.title.slice(0, 200), body.artist.slice(0, 200),
    typeof body.album === "string" ? body.album.slice(0, 200) : null,
    Number.isInteger(body.durationMs) ? body.durationMs : null, plain, synced, rightsBasis
  ).run();
  return c.json({ id, status: "pending", qualityScore: scoreLyrics({ plainLyrics: plain, syncedLyrics: synced }) }, 202);
}
