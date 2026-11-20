# Lyrics Kosh API

**Every lyric. One foundation.**

Lyrics Kosh is an independent, provider-agnostic lyrics API built on Cloudflare Workers. It normalizes results from supported providers behind one JSON interface, with a small TypeScript codebase and a free-first hosting design.

> This repository is a development baseline, not a declaration that the service is production-ready. Provider terms, data rights, Cloudflare configuration, load behavior, and deployment must be verified before public launch.

## What is included

- Cloudflare Worker API using Hono and TypeScript
- LRCLIB and lrc.red provider adapters
- Unified search and provider-specific lyrics lookup
- Best-effort Workers Cache API integration
- D1 schema for song metadata, API keys, usage, contributions, moderation events, and basic metrics
- API key issuance and fixed-window request limiting
- Admin-protected key and contribution review endpoints
- LRC parser, a limited TTML subset parser, quality scoring, and title/artist matching helpers
- JavaScript and Python SDK starter examples
- Vitest unit tests and deployment documentation

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Service information |
| GET | `/v1/health` | Health check |
| GET | `/v1/providers` | Supported provider list |
| GET | `/v1/search?q=...` | Search supported providers |
| GET | `/v1/lyrics/:provider/:id` | Fetch a provider record |
| POST | `/v1/contributions` | Submit user-owned/authorized lyrics for review |
| POST | `/admin/keys` | Issue an API key (admin secret required) |
| GET | `/admin/contributions` | List pending contributions |
| PATCH | `/admin/contributions/:id` | Approve or reject a contribution |
| GET | `/admin/metrics` | Basic operational counts |

Public API routes except health/provider metadata require `X-API-Key` if a key is supplied; anonymous requests receive a lower quota. Admin routes require `X-Admin-Secret`.

## Quick start

Requirements: Node.js 18+, npm, a Cloudflare account, and Wrangler authentication.

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

The local Worker expects a D1 database binding. Create one and update `database_id` in `wrangler.jsonc`, then apply migrations:

```bash
npx wrangler d1 create lyrics-kosh-db
npm run db:local
```

Set the production admin secret:

```bash
npx wrangler secret put ADMIN_SECRET
```

Update the provider User-Agent values in `wrangler.jsonc` with a real project URL and contact address. Never commit secrets or real credentials.

## Search example

```bash
curl "http://localhost:8787/v1/search?q=track%20artist"
```

Authenticated request:

```bash
curl -H "X-API-Key: lk_your_key" \
  "https://YOUR_WORKER_DOMAIN/v1/search?q=track%20artist"
```

## Important rights and provider notes

Lyrics are copyrighted works in many jurisdictions. Public availability from a provider does not automatically grant Lyrics Kosh permission to store, cache, redistribute, or serve the content. Review each provider's current terms and obtain legal permission where required. The contribution flow is limited to material the contributor claims to own or be authorized to submit; a checkbox is not legal verification.

The LRCLIB and lrc.red adapters are best-effort integrations. Confirm their current API formats, rate limits, attribution requirements, User-Agent rules, and caching/redistribution permissions before enabling them publicly. Do not bypass provider restrictions.

## Production launch gates

Do not call this production-ready until all of the following are complete:

1. Replace the D1 database ID and Worker URL placeholders.
2. Configure a strong `ADMIN_SECRET` as a Worker secret.
3. Set real provider User-Agent contact details and confirm provider terms.
4. Test migrations on a disposable D1 database and back up production data.
5. Replace the D1 fixed-window limiter with a Cloudflare Rate Limiting binding or Durable Object for meaningful traffic.
6. Review admin authorization, contribution moderation, abuse controls, and rights/takedown process.
7. Run typecheck, tests, integration tests, and provider contract tests.
8. Verify cache behavior is allowed by each provider.
9. Configure monitoring, alerting, rollback, and a privacy policy.
10. Review the API contract and SDKs before publishing packages.

## Project structure

```text
src/
  index.ts
  env.ts
  types.ts
  lib/
    lrc.ts
    ttml.ts
    normalize.ts
  providers/
    lrclib.ts
    lrc-red.ts
  services/
    cache.ts
    security.ts
    providers.ts
    contributions.ts
migrations/
test/
sdk/
docs/
```

## License

See [LICENSE](LICENSE). The code license does not grant rights to lyrics supplied by external providers or contributors.
