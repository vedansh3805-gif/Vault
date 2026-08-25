# VAULT

A polished, private password generator. VAULT produces passwords locally in your browser using cryptographically secure randomness—there is no account, backend, password database, analytics, or password storage.

## Features

- Cryptographically secure passwords via `crypto.getRandomValues()`
- Configurable length (8–128), character sets, and advanced restrictions
- Secure category inclusion with unbiased random selection
- Local strength estimate, copy, reveal/hide, keyboard shortcut, and batch generation
- Five responsive themes: Midnight, Aurora, Obsidian, Arctic, and Light
- Accessible labels, visible focus treatments, and reduced-motion support

## Privacy and security model

Generated passwords stay in browser memory only. They are never transmitted, logged, persisted, placed in URLs, or sent to a third party. The one locally persisted preference is the selected visual theme (`vault-theme`); passwords are never written to local storage.

The generator uses rejection sampling with `crypto.getRandomValues()` to avoid modulo bias. It includes each enabled category and validates impossible combinations. Strength is an educational estimate based on length and the selected character pool, not a guarantee of real-world security.

Security headers—including CSP, frame denial, referrer policy, and permissions policy—are configured in `next.config.ts`.

## Stack

Next.js, React, TypeScript, Tailwind CSS, and Node’s built-in test runner via `tsx`.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks and production

```bash
npm run lint
npm test
npm run build
npm run start
```

No environment variables or database are required. The app can be deployed directly to Vercel, Netlify, Cloudflare, or any Node-compatible host.

## Project structure

```text
app/                 Application shell, metadata, and responsive UI
lib/                 Password generation, strength, and theme logic
tests/               Generator and strength test coverage
next.config.ts       Security headers
```

## Future direction

The business logic is isolated from the UI so passphrases, PINs, usernames, secure notes, and other privacy-first utilities can be added without rewriting the generator.

## License

MIT
