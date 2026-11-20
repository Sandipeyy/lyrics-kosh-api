# API reference

Base URL: your deployed Worker URL.

## Authentication

Use `X-API-Key: lk_...` for a developer key. Anonymous access is limited. Admin endpoints require `X-Admin-Secret` and must never be exposed in a client application.

## `GET /v1/health`

Returns service health metadata. This is a liveness check, not a guarantee that all providers or D1 are healthy.

## `GET /v1/providers`

Returns the configured provider identifiers and attribution destinations.

## `GET /v1/search?q={query}`

Searches enabled providers concurrently.

Example response:

```json
{
  "query": "track artist",
  "results": [
    {
      "id": "lrclib:123",
      "provider": "lrclib",
      "providerId": "123",
      "title": "Track",
      "artist": "Artist",
      "synced": true,
      "qualityScore": 1
    }
  ],
  "providers": [
    { "provider": "lrclib", "status": "ok" }
  ]
}
```

Provider errors are represented as unavailable provider status; one failed provider does not fail the entire search.

## `GET /v1/lyrics/{provider}/{id}`

Supported provider values: `lrclib`, `lrc-red`. The ID is the provider-specific identifier returned by search. Returns 404 if no record is found.

## `POST /v1/contributions`

Requires an API key in normal usage. JSON body:

```json
{
  "title": "My original song",
  "artist": "Artist",
  "plainLyrics": "Lyrics written by me...",
  "rightsBasis": "owned",
  "rightsConfirmed": true
}
```

`rightsBasis` must be `owned` or `authorized`. Submissions enter `pending` review and are not served by public search. The current baseline does not publish approved contributions automatically.

## Admin endpoints

- `POST /admin/keys`: `{ "label": "My app", "tier": "free" }`
- `GET /admin/contributions`
- `PATCH /admin/contributions/{id}`: `{ "status": "approved", "note": "Reviewed" }`
- `GET /admin/metrics`

All require `X-Admin-Secret`. Admin keys should be created only for trusted server-side operators.
