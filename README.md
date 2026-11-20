# Lyrics Kosh

**Every lyric. One foundation.**

Lyrics Kosh is an independent lyrics API project designed to give applications one consistent interface for searching and retrieving lyrics from supported providers.

> **Project status:** This repository is a consolidated starter implementation. Before calling a deployment production-ready, complete the checks in [SETUP.md](SETUP.md), verify provider terms, and test against your own Cloudflare account. Provider availability and response formats can change.

## Features

- Cloudflare Workers + Hono API.
- LRCLIB search and retrieval integration.
- Optional lrc.red adapter foundation.
- Consistent response envelope.
- Provider attribution in returned records.
- D1 migration for catalog and operational foundations.
- JavaScript/TypeScript and Python SDK starter clients.
- Health endpoint and provider listing.
- Configurable provider timeouts and basic in-isolate request coalescing.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/v1/health` | API health |
| GET | `/v1/providers` | List configured providers |
| GET | `/v1/search?q=...` | Search supported providers |
| GET | `/v1/lyrics?id=...&provider=...` | Retrieve a provider record |

The exact availability of a provider depends on that provider's service and terms. Search responses may contain records from more than one provider.

## Quick start

```bash
npm install
npx wrangler d1 create lyrics-kosh-db
```

Copy the returned database ID into `wrangler.jsonc`, then:

```bash
npx wrangler d1 migrations apply lyrics-kosh-db --local
cp .dev.vars.example .dev.vars
npm run dev
```

See [SETUP.md](SETUP.md) for complete local and production instructions.

## Example

```bash
curl "http://localhost:8787/v1/search?q=Creep"
```

## Repository layout

```text
src/
  index.ts
  env.ts
  providers/
    types.ts
    lrclib.ts
    lrc-red.ts
    manager.ts
  services/
    cache.ts
    dedupe.ts
migrations/
sdk/
  javascript/
  python/
docs/
examples/
```

## SDKs

The SDKs in `sdk/` are starter clients. Their package names are proposed and have not been published or checked for registry availability. Verify the live API response contract before publishing them.

## Copyright and provider terms

Lyrics Kosh does not claim ownership of lyrics returned by external providers. Public availability does not automatically grant redistribution rights. Review each provider's current terms, attribution requirements, caching restrictions, and applicable copyright law before operating a public service. Do not publish user submissions without a documented rights review process.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

The original code in this repository is licensed under the MIT License. This license does not grant rights to third-party lyrics, provider data, trademarks, or other external content.
