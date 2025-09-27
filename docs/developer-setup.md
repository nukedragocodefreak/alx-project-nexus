# Developer Setup Guide

## Prerequisites
- Node.js 22.x (ships with the project during ALX sprints).
- npm 10.x (bundled with Node 22).
- Git and a GitHub (or ALX) fork for pushing changes.
- TMDb credentials (v4 Read Access token or v3 API key).

## Initial Setup
```bash
npm install
cp .env.example .env.local   # if present, otherwise create manually
```
Populate `.env.local` with at least one credential:
```env
NEXT_PUBLIC_TMDB_READACCESS_API_KEY=<<tmdb_v4_token>>
# Optional fallbacks
TMDB_READACCESS_API_KEY=<<tmdb_v4_token>>
NEXT_PUBLIC_TMDB_API_KEY=<<tmdb_v3_key>>
TMDB_API_KEY=<<tmdb_v3_key>>
```

## Running the App
```bash
npm run dev
```
The Turbopack dev server runs at http://localhost:3000. All API calls are proxied through `/api/tmdb`.

### Production Build
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## Working Behind a TLS-Intercepting Proxy
Axios enforces certificate validation. If you see `self-signed certificate in certificate chain`:
1. Export the proxy’s root certificate.
2. Restart dev server with `NODE_EXTRA_CA_CERTS=/path/to/root-ca.pem npm run dev`.
   - Alternatively (not recommended for committed code), initialise an HTTPS agent with `rejectUnauthorized: false`.

## Logging TMDb Requests
Set either variable to `true` before starting the server:
```env
NEXT_PUBLIC_TMDB_LOG_REQUESTS=true
# or
TMDB_LOG_REQUESTS=true
```
The proxy logs outbound URLs, masked headers, status codes, and trimmed response previews.

## Common Issues
| Symptom | Fix |
| --- | --- |
| 401 or 403 responses from TMDb | Verify tokens/keys, ensure account has API access. |
| 500 with `self-signed certificate` | Follow proxy certificate instructions above. |
| Empty genre list after switching media type | Ensure TMDb genre endpoints succeed; proxy caches per media type. |
| Detail side panel missing data | Check console for TMDb errors; read access token must allow images and credits. |

## Coding Guidelines
- Keep components typed and pure; leverage memoisation for derived data.
- Prefer `docs/` additions for new features or API behaviour changes.
- Run lint before committing; fix warnings promptly.
- Coordinate API changes with `docs/api/tmdb-proxy.md`.

## Useful References
- [TMDb API Docs](https://developer.themoviedb.org/reference/intro/getting-started)
- [Next.js Documentation](https://nextjs.org/docs)
- [Styled Components](https://styled-components.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
