# API reference

Base URL: your deployed Cloudflare Worker URL.

## GET /v1/health

Returns a lightweight service status object.

## GET /v1/providers

Returns configured provider names and attribution URLs.

## GET /v1/search?q={query}

Searches configured providers. `q` is required and limited to 200 characters.

Response shape:

```json
{
  "success": true,
  "query": "Creep",
  "results": [],
  "providerFailures": []
}
```

## GET /v1/lyrics?id={id}&provider={provider}

Retrieves a record from a specific provider. Both parameters are required.

Provider IDs currently used by this starter are `lrclib` and `lrc-red`.

Response shape:

```json
{
  "success": true,
  "result": {
    "id": "provider-record-id",
    "title": "Track title",
    "artist": "Artist",
    "album": null,
    "duration": null,
    "instrumental": false,
    "lyrics": {
      "plain": null,
      "synced": null,
      "ttml": null
    },
    "source": {
      "name": "Provider",
      "id": "provider-record-id",
      "attributionUrl": "https://provider.example/"
    }
  }
}
```

This is the repository's intended response contract. Provider formats and live API behavior must be tested before release.
