# Contributing to Lyrics Kosh

Thanks for helping improve Lyrics Kosh.

## Before opening a pull request

- Explain the problem and the intended behavior.
- Keep provider-specific code inside `src/providers/`.
- Keep API response shapes consistent and document breaking changes.
- Add tests for parsers, matching rules, and route behavior.
- Never commit secrets, API keys, private lyric dumps, or personal data.
- Do not add a provider integration until its API terms, attribution, rate limits, and content rights have been reviewed.

## Development

```bash
npm install
npm run typecheck
npm test
npm run dev
```

## Lyrics and rights

Only contribute lyrics you created or are authorized to submit. Do not submit scraped or copied copyrighted lyrics without permission. A contributor declaration is not a substitute for a rights review.

## Pull requests

Keep changes focused. Include migration notes when changing D1 schema and update `docs/API.md` when changing public endpoints.
