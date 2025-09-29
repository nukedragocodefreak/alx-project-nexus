# Movie Recommendations App: 

Vercel url for the site: https://alx-project-nexus-khaki-seven.vercel.app/

An interactive Next.js and TypeScript application for exploring TMDb content, personalising feeds, and tracking favourites. The project doubles as a sandbox for modern frontend patterns, API orchestration, and developer experience tooling.

## Highlights
- Personalised discovery feeds (popular, trending, now playing, upcoming, TV, watchlist, favourites).
- Genre filtering, rating thresholds, search shortcuts, and TMDb details panels.
- Local persistence for favourites and watchlists, plus keyboard-friendly UI flows.
- Robust TMDb proxy with request/response logging, media-type switching, and API key masking.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000 to start browsing and iterating.

## Environment Variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_TMDB_API_BASE_URL` | Override TMDb base URL (default `https://api.themoviedb.org/3`). |
| `NEXT_PUBLIC_TMDB_API_KEY` | TMDb v3 API key (optional when using read access token). |
| `TMDB_API_KEY` | Server-side only v3 API key fallback. |
| `NEXT_PUBLIC_TMDB_READACCESS_API_KEY` | TMDb v4 read access token (recommended). |
| `TMDB_READACCESS_API_KEY` | Server-side only read access fallback. |
| `NEXT_PUBLIC_TMDB_LOG_REQUESTS` / `TMDB_LOG_REQUESTS` | Enable proxy request/response logging when set to `true`. |

> When working behind a proxy that re-signs TLS traffic, either install the proxy CA (via `NODE_EXTRA_CA_CERTS`) or fall back to the native `fetch` implementation to avoid TLS rejections.

## Project Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack). |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint. |

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/project-overview.md`](docs/project-overview.md) | Architecture, UI/UX, and feature deep dive. |
| [`docs/developer-setup.md`](docs/developer-setup.md) | Environment preparation, local workflows, and troubleshooting. |
| [`docs/api/tmdb-proxy.md`](docs/api/tmdb-proxy.md) | TMDb proxy contract, logging, and media-type switching details. |
| [`docs/api/endpoints.md`](docs/api/endpoints.md) | Frontend-visible endpoints and usage examples. |

## Contributing

1. Fork and clone the repository.
2. Create a feature branch (`git checkout -b feature/my-update`).
3. Run linting and relevant manual checks.
4. Submit a descriptive pull request and link to any screenshots/videos.

## License

Distributed for educational use within the ALX Project Nexus programme. See project maintainers for reuse outside the cohort.
