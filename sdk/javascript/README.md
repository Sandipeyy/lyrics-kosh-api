# @lyrics-kosh/sdk

Starter JavaScript client for Lyrics Kosh.

```ts
import { LyricsKosh } from "@lyrics-kosh/sdk";

const client = new LyricsKosh({
  baseUrl: "https://YOUR-WORKER-DOMAIN"
});

const results = await client.search("Creep");
console.log(results);
```

The package is not published. Verify the API contract and package-name availability before publishing.
