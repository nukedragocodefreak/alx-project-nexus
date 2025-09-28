# FilmFinder Architecture Overview

## App Entry
- `pages/index.tsx` dynamically imports `MovieRecommendationsApp`, so the entire UI mounts on the client side.
- `components/MovieRecommendationsApp.tsx` wraps the UI with the `styled-components` `ThemeProvider` and applies the global styles defined in `components/theme.tsx`.

## Shared Styling (`components/theme.tsx`)
- Declares the design tokens (spacing, colours, radius, shadows) and exports reusable styled primitives such as `Button`, `Card`, `Grid`, and `Overlay`.
- Any component that imports these primitives stays visually consistent and benefits from global tweaks (e.g. the modal overlay updates).

## Core Container (`components/MovieRecommendationsUI.tsx`)
- Holds all state: search query, active feed, rating/genre filters, favourite and watchlist caches, fetched movie catalogue, and the currently selected item for the detail modal.
- Uses `useEffect` hooks to fetch TMDb data, hydrate favourites/watchlist from `localStorage`, and persist updates back to storage.
- Uses `useMemo` to derive filtered movie lists and tabs; it also normalises API responses into `UiMovie` objects and caches them in `catalog` for reuse by favourites, watchlist, and the modal.
- Renders the full page layout: header/search controls, refine sidebar, optional trending filter card, the movie grid, and the `DetailsPanel` modal.
- Wires interaction callbacks (`toggleLike`, `toggleWatchlist`, `onInfo`) into each `MovieCard` instance and passes computed flags (`liked`, `watchlisted`).

## Presentational Card (`components/MovieCard.tsx`)
- Stateless component that renders poster art, metadata, and the three action buttons.
- Receives callbacks/flags via props; clicking Like/Watchlist/Info simply calls the parent-provided handlers, allowing `MovieRecommendationsUI` to update centralised state.

## Detail Modal (`DetailsPanel` inside `MovieRecommendationsUI`)
- When a card’s Info button invokes `setSelected`, the component fetches extra TMDb data and renders a modal using `framer-motion` transitions.
- The modal locks body scrolling, dims the background, supports Escape/backdrop close, and displays the fetched overview, cast, genres, and preview posters.

## Data Flow Summary
1. **Fetching listings** – `MovieRecommendationsUI` hits `/api/tmdb` routes via `fetchJSON`, normalises results to `UiMovie`, and stores them in `movies` + `catalog`.
2. **Favourites persistence** – Reads `FilmFinder:favorites:v1` on mount, stores data in `favoriteLibrary` + `likes`, and writes back whenever favourites change.
3. **Watchlist persistence** – Mirrors the favourites pattern using `FilmFinder:watchlist:v1`, keeping IDs in `watchlist` and full movie data in `catalog` for instant reuse.
4. **Card interactions** – Button clicks bubble up to the parent via the provided callbacks, triggering catalogue/state/localStorage updates and a re-render.
5. **Details modal** – `selected` drives `DetailsPanel`; clearing `selected` closes the modal and restores scroll.

Together, this layout keeps business logic and persistence in one high-level container while the smaller components focus on rendering and user interaction.
