# TMDb Proxy Reference

The `/api/tmdb` Next.js API route provides a safe, configurable way to talk to The Movie Database without exposing secrets client-side.

## Credentials Resolution
Order of precedence:
1. `NEXT_PUBLIC_TMDB_READACCESS_API_KEY`
2. `TMDB_READACCESS_API_KEY`
3. `NEXT_PUBLIC_TMDB_API_KEY`
4. `TMDB_API_KEY`

- A v4 Read Access token is preferred (used as Bearer header).
- If only a v3 key is available it is appended as `api_key` query param.

## Query Parameters
| Parameter | Purpose | Notes |
| --- | --- | --- |
| `fn` | Function identifier | Defaults to `popular`. |
| `mediaType` | `movie` or `tv` | Controls endpoint path for feeds, discover, genres, etc. |
| `timeWindow` | `day` or `week` | Trending feed only. |
| `with_genres` | Comma-separated TMDb genre IDs | Discover feed only. |
| `q` | Search query | Required for `fn=search`. |
| `movieId` / `tvId` | Resource ID | Required for details/credits/images endpoints. |

Any additional query parameters are passed through to TMDb unless explicitly reserved.

## Supported Functions (`fn`)
- Feed endpoints: `popular`, `now_playing`, `upcoming`, `discover`, `trending`, `tv_popular`.
- Details & metadata: `movie_details`, `movie_credits`, `movie_images`, `movie_recommendations`, `movie_similar`, `tv_details`, `tv_credits`.
- Configuration: `configuration`, `genre_list`.
- Search: `search`.

## Logging
Enable logging by setting `NEXT_PUBLIC_TMDB_LOG_REQUESTS=true` (client) or `TMDB_LOG_REQUESTS=true` (server). The proxy will emit:
```text
[tmdb] outbound request { fn, url, headers }
[tmdb] response { fn, status, url, preview }
```
- Headers are cloned and the bearer token masked.
- Response previews are JSON-stringified and truncated to 1000 characters.
- Axios errors include `[tmdb] axios error` with status, safe URL, and message.

## Axios Configuration
- Uses `axios.get` with `validateStatus: () => true` to inspect non-2xx responses.
- Returns TMDb’s status code and body directly to the client.
- For TLS interception scenarios provide a custom HTTPS agent or install proxy certificates via `NODE_EXTRA_CA_CERTS`.

## Error Handling
- TMDb errors propagate with their status and payload (`{ error: payload }`).
- Credential validation errors return HTTP 500 with a descriptive JSON body.
- Unexpected failures default to HTTP 500 with `{ error: "Internal server error" }`.

## Adding New Functions
1. Extend `FeedId` and related UI enumerations if necessary.
2. Implement a new `case` within `buildTmdbUrl` returning the TMDb URL.
3. Document the new function here and update any UI components/handlers.
4. Add usage notes in `docs/api/endpoints.md` if the frontend consumes the new hook.

## Testing Tips
- Use `NEXT_PUBLIC_TMDB_LOG_REQUESTS=true` to watch request flow in the dev console.
- Toggle Movies/TV in the UI header to ensure media-specific endpoints unlock correctly.
- For network or TLS issues, hit the logged URL with `curl` using the same token for comparison.
