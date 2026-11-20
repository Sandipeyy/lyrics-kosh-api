# Lyrics Kosh setup and deployment

This guide assumes Node.js, npm, a Cloudflare account, and Wrangler CLI access.

## 1. Install dependencies

```bash
npm install
```

## 2. Create a D1 database

```bash
npx wrangler d1 create lyrics-kosh-db
```

Copy the `database_id` returned by Wrangler into `wrangler.jsonc`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

## 3. Apply migrations

Local development:

```bash
npx wrangler d1 migrations apply lyrics-kosh-db --local
```

Production:

```bash
npx wrangler d1 migrations apply lyrics-kosh-db --remote
```

## 4. Configure local variables

Copy `.dev.vars.example` to `.dev.vars` and replace the example User-Agent values with valid project identification. Keep `.dev.vars` private.

The `ADMIN_SECRET` is reserved for future/admin operations; do not expose it to browser or mobile clients.

## 5. Run locally

```bash
npm run dev
```

Try:

```bash
curl "http://localhost:8787/v1/health"
curl "http://localhost:8787/v1/providers"
curl "http://localhost:8787/v1/search?q=Creep"
```

## 6. Configure production secrets

```bash
npx wrangler secret put ADMIN_SECRET
npx wrangler secret put LRCLIB_USER_AGENT
npx wrangler secret put LRC_RED_USER_AGENT
```

Wrangler secrets are not read from `.env.example`. Set them separately in the Cloudflare Worker environment.

## 7. Deploy

```bash
npm run typecheck
npm test
npm run deploy
```

## 8. Verify deployment

```bash
curl -i "https://YOUR-WORKER-DOMAIN/v1/health"
curl -i "https://YOUR-WORKER-DOMAIN/v1/providers"
curl -i "https://YOUR-WORKER-DOMAIN/v1/search?q=Creep"
```

Replace `YOUR-WORKER-DOMAIN` with the actual deployed hostname.

## Important production work still required

- Confirm the deployed route contract and update SDK types to match it.
- Review and implement robust API authentication and rate limiting before issuing public keys.
- Add protected admin routes before exposing any admin functionality.
- Review current provider terms, caching restrictions, attribution, and copyright requirements.
- Add automated tests for provider parsing, timeouts, malformed data, and fallback behavior.
- Configure backups, monitoring, alerting, and rollback procedures.
- Review Cloudflare plan limits and D1 usage costs.
- Do not treat a successful Worker deployment as proof that lyrics redistribution is legally authorized.

## Troubleshooting

### D1 database ID error

Check `wrangler.jsonc` and ensure the real database ID is configured.

### Provider request fails

Check the provider's current availability, endpoint contract, User-Agent requirements, and network timeout. A provider outage should not be interpreted as an API deployment failure.

### TypeScript errors

Run `npm run typecheck` and resolve errors against the actual installed dependency versions. Do not silence errors by disabling strict mode.
