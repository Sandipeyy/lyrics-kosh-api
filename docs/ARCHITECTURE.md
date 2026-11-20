# Architecture and implementation status

## Request flow

```text
Client
  -> Cloudflare Worker (Hono)
  -> API key validation / D1 fixed-window quota
  -> Workers Cache API (best effort)
  -> provider manager
      -> LRCLIB adapter
      -> lrc.red adapter
  -> normalized JSON response
```

D1 stores metadata, API key hashes, usage counters, contribution review state, and basic operational counts. Raw provider lyrics are not intentionally persisted in D1 by this baseline.

## Included foundations

- Provider interface and concurrent provider search
- LRC parsing and a limited TTML `<p>` parser
- Text normalization and heuristic match scoring
- API key hashing (SHA-256), admin-secret checks, and starter quotas
- Contribution submission and manual review endpoints
- Basic scheduled cleanup

## Deliberate limitations

- The matching helper is not yet connected to a canonical catalog merge workflow.
- Approved contributions are not automatically published.
- No complete takedown/legal workflow is implemented.
- The TTML parser supports a small subset and is not a full TTML engine.
- Rate limiting writes to D1 for each request; replace it before meaningful public traffic.
- Cache API is best-effort and data-center-local; provider rules may prohibit caching.
- Metrics are currently a small admin count endpoint, not a complete observability system.
- SDKs are examples, not published/stable packages.
- Provider payload assumptions require live contract tests.

## Suggested next hardening work

1. Contract tests against provider fixtures and live APIs.
2. Cloudflare native rate limiter or Durable Object.
3. Canonical song catalog ingestion with collision-safe matching.
4. Rights review, takedown workflow, audit log, and publication policy.
5. OpenAPI schema generation and SDK contract tests.
6. Monitoring, alerting, backups, restore drills, and load tests.
