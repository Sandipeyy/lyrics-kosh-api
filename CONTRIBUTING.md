# Contributing to Lyrics Kosh

Thanks for considering a contribution.

## Before you start

1. Check existing issues and discussions to avoid duplicate work.
2. For substantial changes, open an issue describing the problem and proposed solution.
3. Never submit API keys, secrets, private contact details, or copyrighted lyrics you do not have permission to contribute.
4. Check the current terms of any provider you integrate.

## Development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev
```

Run checks before opening a pull request:

```bash
npm run typecheck
npm test
```

## Pull requests

Please include:

- A clear description of the change.
- The reason the change is needed.
- Tests or reproducible verification steps.
- Any migration or configuration changes.
- Provider attribution and terms impact, where relevant.

Keep pull requests focused. Avoid committing `.dev.vars`, `.env`, `node_modules`, generated secrets, or unrelated formatting changes.

## Code style

- Use TypeScript strict mode.
- Prefer small provider adapters behind the shared provider interface.
- Handle network timeouts and provider failures explicitly.
- Never allow monitoring or cache failures to break a successful API response.
- Do not log API keys, authorization headers, raw IP addresses, or full lyric payloads.

## Security reports

Do not publish exploitable security details in a public issue. Contact the maintainers privately through the security contact published in the repository.
