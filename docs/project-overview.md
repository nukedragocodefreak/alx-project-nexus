# Project Overview

## Purpose
The Movie Recommendations App is a feature-rich Next.js experience for exploring TMDb content. It focuses on:
- Demonstrating modern React patterns (hooks, suspense-like flows, memoisation, Framer Motion transitions).
- Managing complex TMDb data (feeds, details, configuration, favourites, watchlists) with local caching and filtering.
- Showcasing a polished, keyboard-friendly UI with genre pills, sliders, and detail side panels.

## Architecture
- **Framework:** Next.js 15 with the App Router disabled in favour of a custom SPA component tree.
- **Language:** TypeScript across frontend, API routes, and utilities.
- **Styling:** Styled Components (centralised in `components/theme.tsx`) with a design token approach.
- **Animation:** Framer Motion for feed transitions and modal/detail slide-ins.
- **Icons:** `lucide-react` for consistent vector icons.
- **State:** React state + hooks, derived memoised values, browser `localStorage` for persistence.
- **Data:** TMDb REST API consumed via a custom proxy (`pages/api/tmdb.ts`).

## Key UI Components
- `MovieRecommendationsApp` – wraps the UI in the shared theme provider.
- `MovieRecommendationsUI` – owns the entire interactive surface: search, tabs, filters, feed rendering, and details panel.
- `MovieCard` – reusable card with hover state, like/watchlist controls, and info triggers.
- `theme.tsx` – design system primitives: buttons, pills, layout surfaces, typography accents.

## Feature Highlights
- **Feeds:** Popular, Trending, Now Playing, Upcoming, Discover, TV, Watchlist, and Favourites with responsive filtering.
- **Search:** Keyboard-first search (`Ctrl + K`), debounced queries, and automatic tab activation.
- **Filtering:** Genre pills, rating slider, trending media type/time window selectors.
- **Details Panel:** On-demand TMDb detail fetch with posters, cast, runtime, taglines, and imagery.
- **Persistence:** Likes/favourites/watchlist synchronised to localStorage; safe rehydration on load.
- **Media Switching:** Global Movies/TV selector, wired through the proxy to query appropriate endpoints.

## Data Flow
1. UI state changes (tab, search, filters) trigger loader effects.
2. Loader constructs an `/api/tmdb` route with `fn` and query params.
3. Proxy resolves credentials, builds TMDb URL, logs outbound request (masking secrets).
4. Axios performs the call, logs trimmed response, and returns JSON/body + status.
5. UI maps TMDb payload to internal `UiMovie` model, updates feed, and caches items.

## Performance Considerations
- Memoised derived values for current list, filtered view, and selected items.
- Abort controller usage for search/feed requests to discard stale responses.
- Genre caching per media type to avoid repeated remote calls.
- Minimal rerenders via `AnimatePresence` layout animations instead of full reflows.

## Future Enhancements
- Authentication and server-backed favourites/watchlist sync.
- Infinite scrolling or pagination for long feeds.
- Offline cache and installable PWA mode.
- Accessibility audit (ARIA improvements, focus traps in detail panel).
- Automated integration tests for API proxy and UI behaviours.
