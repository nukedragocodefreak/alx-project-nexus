# Client-Facing Endpoints

The frontend relies on a small set of HTTP endpoints served by Next.js.

## `/api/tmdb`
Proxy to TMDb. See [`tmdb-proxy.md`](tmdb-proxy.md) for full details.

### Sample Calls
```http
GET /api/tmdb?fn=popular&mediaType=movie
GET /api/tmdb?fn=trending&mediaType=tv&timeWindow=week
GET /api/tmdb?fn=discover&mediaType=movie&with_genres=28,12
GET /api/tmdb?fn=search&mediaType=tv&q=the%20office
GET /api/tmdb?fn=movie_details&movieId=27205
```

Responses are JSON payloads mirroring TMDb’s responses, with an `error` wrapper for non-2xx cases.

## Frontend Routes
Although the app is currently a single-page experience, the following routes are exposed:

| Route | Description |
| --- | --- |
| `/` | Main movie recommendations interface. |
| `/api/tmdb` | TMDb proxy (GET only). |

## Static Assets
- `/favicon.ico`, `/icon.png` etc. handled by Next.js default pipeline.

## Planned API Extensions
- `/api/watchlist` and `/api/favourites` (server-backed) – future work.
- `/api/session` – placeholder for upcoming authentication.

## Testing Endpoints
Use the built-in logging to observe calls, or invoke from the terminal:
```bash
curl "http://localhost:3000/api/tmdb?fn=popular&mediaType=movie" \
  -H "Authorization: Bearer $TMDB_READACCESS_API_KEY"
```
Note: Direct TMDb calls require the same headers the proxy injects; using the proxy is recommended to avoid exposing credentials.
