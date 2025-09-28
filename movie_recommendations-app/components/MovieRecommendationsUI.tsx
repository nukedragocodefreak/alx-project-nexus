import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import theme, { Components } from "@/components/theme";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, Film, Clock, TrendingUp, Loader2, Heart, X } from "lucide-react";
import type {EmptyStateProps,  FeedId, FeedConfig, DetailsPanelProps, TmdbMovie, UiMovie, GenreState, SelectedItem, TmdbDetails, TmdbListResponse } from "@/types";
import { fetchJSON } from "@/Utils/index";
import MovieCard from "@/components/MovieCard";
import Image from "next/image";
const { HeaderWrap, Container, Brand, AppBadge, Muted, Button, InputWrap, Input, LeftIcon, Kbd, Tabs, TabBtn, Main, Card, CardBody, CardHeader, CardTitle, CardDescription, SliderRow, Range, GenrePills, Pill, Grid, Danger, } = Components;
const TMDB_IMG_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || "";
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1496440737103-cd596325d314?q=80&w=1200&auto=format&fit=crop";
const FALLBACK_GENRES = ["Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Fantasy", "History", "Horror", "Mystery", "Romance", "Sci-Fi", "Thriller",];
const FAVORITES_STORAGE_KEY = "FilmFinder:favorites:v1";
const ITEMS_PER_PAGE = 20;

const FEEDS: FeedConfig[] = [{ id: "popular", label: "Popular", icon: Sparkles }, { id: "trending", label: "Trending", icon: TrendingUp }, { id: "now_playing", label: "Now Playing", icon: Clock }, { id: "upcoming", label: "Upcoming", icon: Film }, { id: "discover", label: "Discover", icon: SlidersHorizontal }, { id: "favorites", label: "Favorites", icon: Heart }, { id: "watchlist", label: "Watchlist", icon: Clock },];
const TRENDING_MEDIA_TYPES: Array<{
  id: "movie" | "tv";
  label: string;
}> = [{ id: "movie", label: "Movies" }, { id: "tv", label: "TV Shows" },];
const TRENDING_WINDOWS: Array<{
  id: "day" | "week";
  label: string;
}> = [{ id: "day", label: "Today" }, { id: "week", label: "This Week" },];

const makeEmptyGenreState = (): GenreState => ({
  dict: {},
  nameToId: {},
  names: [],
});

function formatYear(value?: string) {
  if (!value)
    return "-";
  return value.slice(0, 4) || "-";
}
export default function MovieRecommendationsUI() {
  const [query, setQuery] = useState("");
  const [activeFeed, setActiveFeed] = useState<FeedId>("popular");
  const [feedMediaType, setFeedMediaType] = useState<"movie" | "tv">("movie");
  const [minRating, setMinRating] = useState(7);
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [favoriteLibrary, setFavoriteLibrary] = useState<Record<string, UiMovie>>({});
  const favoritesReadyRef = useRef(false);
  const [movies, setMovies] = useState<UiMovie[]>([]);
  const [catalog, setCatalog] = useState<Record<string, UiMovie>>({});
  const [genreNameToId, setGenreNameToId] = useState<Record<string, number>>({});
  const [genreChoices, setGenreChoices] = useState<string[]>(FALLBACK_GENRES);
  const [genreCache, setGenreCache] = useState<Record<"movie" | "tv", GenreState>>({
    movie: makeEmptyGenreState(),
    tv: makeEmptyGenreState(),
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trendingMediaType, setTrendingMediaType] = useState<"movie" | "tv">("movie");
  const [trendingWindow, setTrendingWindow] = useState<"day" | "week">("day");
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [details, setDetails] = useState<TmdbDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        const library: Record<string, UiMovie> = {};
        if (Array.isArray(parsed)) {
          parsed.forEach((entry) => {
            if (!entry || typeof entry !== "object") {
              return;
            }
            const movie = entry as Partial<UiMovie> & {
              id?: string | number;
            };
            if (movie.id === undefined || movie.id === null) {
              return;
            }
            const id = String(movie.id);
            const genres = Array.isArray(movie.genres)
              ? movie.genres.filter((item): item is string => typeof item === "string")
              : [];
            const ratingValue = typeof movie.rating === "number"
              ? movie.rating
              : Number(movie.rating ?? 0) || 0;
            library[id] = {
              id,
              title: movie.title ?? "Untitled",
              year: movie.year ?? "-",
              genres,
              rating: ratingValue,
              runtime: typeof movie.runtime === "number" ? movie.runtime : undefined,
              poster: movie.poster ?? FALLBACK_POSTER,
              overview: movie.overview ?? "",
              trending: Boolean(movie.trending),
              mediaType: movie.mediaType === "tv" ? "tv" : "movie",
            };
          });
        }
        else if (parsed && typeof parsed === "object") {
          Object.entries(parsed as Record<string, UiMovie>).forEach(([id, movie]) => {
            if (!movie || typeof movie !== "object") {
              return;
            }
            library[id] = {
              id,
              title: movie.title ?? "Untitled",
              year: movie.year ?? "-",
              genres: Array.isArray(movie.genres)
                ? movie.genres.filter((item): item is string => typeof item === "string")
                : [],
              rating: typeof movie.rating === "number" ? movie.rating : Number(movie.rating ?? 0) || 0,
              runtime: typeof movie.runtime === "number" ? movie.runtime : undefined,
              poster: movie.poster ?? FALLBACK_POSTER,
              overview: movie.overview ?? "",
              trending: Boolean(movie.trending),
              mediaType: movie.mediaType === "tv" ? "tv" : "movie",
            };
          });
        }
        if (Object.keys(library).length) {
          setFavoriteLibrary(library);
          setLikes(Object.keys(library).reduce<Record<string, boolean>>((acc, key) => {
            acc[key] = true;
            return acc;
          }, {}));
        }
      }
    }
    catch (storageError) {
      console.warn("Failed to restore favorites from storage", storageError);
    }
    finally {
      favoritesReadyRef.current = true;
    }

  }, []);
  const handleFeedMediaTypeChange = useCallback((type: "movie" | "tv") => {
    setFeedMediaType(type);
    if (activeFeed === "trending") {
      setTrendingMediaType(type);
    }
  }, [activeFeed]);

  useEffect(() => {
    if (!favoritesReadyRef.current) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    try {
      const snapshot = JSON.stringify(Object.values(favoriteLibrary));
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, snapshot);
    }
    catch (storageError) {
      console.warn("Failed to persist favorites to storage", storageError);
    }
  }, [favoriteLibrary]);
  useEffect(() => {
    if (!Object.keys(favoriteLibrary).length) {
      return;
    }
    setCatalog((previous) => {
      let changed = false;
      const next = { ...previous };
      Object.values(favoriteLibrary).forEach((movie) => {
        if (!previous[movie.id]) {
          next[movie.id] = movie;
          changed = true;
        }
      });
      return changed ? next : previous;
    });
  }, [favoriteLibrary]);
  useEffect(() => {
    setFavoriteLibrary((prevLibrary) => {
      let changed = false;
      const next = { ...prevLibrary };
      Object.keys(prevLibrary).forEach((id) => {
        const latest = catalog[id];
        if (latest && prevLibrary[id] !== latest) {
          next[id] = latest;
          changed = true;
        }
      });
      return changed ? next : prevLibrary;
    });
  }, [catalog]);
  useEffect(() => {
    let cancelled = false;

    const toGenreState = (payload: { genres?: Array<{ id: number; name: string }>; }): GenreState => {
      const dict: Record<number, string> = {};
      const nameToId: Record<string, number> = {};
      const names: string[] = [];
      (payload?.genres || []).forEach((genre) => {
        dict[genre.id] = genre.name;
        nameToId[genre.name] = genre.id;
        names.push(genre.name);
      });
      return names.length ? { dict, nameToId, names } : makeEmptyGenreState();
    };

    async function load() {
      try {
        const [moviesResult, tvResult] = await Promise.allSettled([
          fetchJSON<{ genres?: Array<{ id: number; name: string }> }>("/api/tmdb?fn=genre_list&mediaType=movie"),
          fetchJSON<{ genres?: Array<{ id: number; name: string }> }>("/api/tmdb?fn=genre_list&mediaType=tv"),
        ]);
        if (cancelled) {
          return;
        }
        setGenreCache((prev) => {
          const next = { ...prev };
          if (moviesResult.status === "fulfilled") {
            next.movie = toGenreState(moviesResult.value as { genres?: Array<{ id: number; name: string }> });
          }
          if (tvResult.status === "fulfilled") {
            next.tv = toGenreState(tvResult.value as { genres?: Array<{ id: number; name: string }> });
          }
          return next;
        });
      } catch (error) {
        if (!cancelled) {
          console.warn("Failed to load TMDb genres", error)
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    const current = genreCache[feedMediaType];
    if (current.names.length) {
      setGenreChoices([...current.names]);
      setGenreNameToId({ ...current.nameToId });
    } else {
      setGenreChoices(FALLBACK_GENRES);
      setGenreNameToId({});
    }
    setActiveGenres((prev) => prev.filter((genre) => Boolean(genreCache[feedMediaType].nameToId[genre])));
  }, [feedMediaType, genreCache]);
  useEffect(() => {
    setPage(1);
  }, [activeFeed, query, feedMediaType, trendingMediaType, trendingWindow, minRating, activeGenres]);

  useEffect(() => {
    if (activeFeed !== "trending") {
      setTrendingMediaType(feedMediaType);
    }
  }, [activeFeed, feedMediaType]);
  useEffect(() => {
    if (activeFeed === "watchlist") {
      setLoading(false);
      setError(null);
      const total = Math.max(1, Math.ceil(watchlist.length / ITEMS_PER_PAGE));
      setTotalPages(total);
      if (page > total) {
        setPage(total);
      }
      return;
    }

    if (activeFeed === "favorites") {
      setLoading(false);
      setError(null);
      const favoriteCount = Object.keys(favoriteLibrary).length;
      const total = Math.max(1, Math.ceil(favoriteCount / ITEMS_PER_PAGE));
      setTotalPages(total);
      if (page > total) {
        setPage(total);
      }
      return;
    }

    if (activeFeed === "search" && !query.trim()) {
      setMovies([]);
      setLoading(false);
      setError(null);
      setTotalPages(1);
      return;
    }

    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        let url = `/api/tmdb?fn=popular&mediaType=${feedMediaType}`;
        const params = new URLSearchParams();
        let fallbackMediaType: "movie" | "tv" = feedMediaType;

        switch (activeFeed) {
          case "popular":
            url = `/api/tmdb?fn=popular&mediaType=${feedMediaType}`;
            break;
          case "now_playing":
            url = `/api/tmdb?fn=now_playing&mediaType=${feedMediaType}`;
            break;
          case "upcoming":
            url = `/api/tmdb?fn=upcoming&mediaType=${feedMediaType}`;
            break;
          case "discover":
            url = `/api/tmdb?fn=discover&mediaType=${feedMediaType}`;
            if (activeGenres.length) {
              const ids = activeGenres
                .map((name) => genreNameToId[name])
                .filter((value): value is number => typeof value === "number");
              if (ids.length) {
                params.set("with_genres", ids.join(","));
              }
            }
            break;
          case "trending":
            url = `/api/tmdb?fn=trending&mediaType=${trendingMediaType}&timeWindow=${trendingWindow}`;
            fallbackMediaType = trendingMediaType;
            break;
          case "search":
            url = `/api/tmdb?fn=search&q=${encodeURIComponent(query.trim())}&mediaType=${feedMediaType}`;
            break;
          default:
            url = `/api/tmdb?fn=popular&mediaType=${feedMediaType}`;
            break;
        }

        params.set("page", String(page));

        const finalUrl = params.toString()
          ? `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`
          : url;

        const json = await fetchJSON<TmdbListResponse>(finalUrl, { signal: controller.signal });
        const totalFromResponse = Math.max(1, json?.total_pages ?? 1);
        setTotalPages(totalFromResponse);
        if (page > totalFromResponse) {
          setPage(totalFromResponse);
          return;
        }

        const results: TmdbMovie[] = Array.isArray(json?.results)
          ? json.results
          : Array.isArray(json?.items)
          ? json.items
          : [];

        const mapped: UiMovie[] = results.map((item) => {
          const resolvedMediaType =
            item.media_type === "tv" || fallbackMediaType === "tv" ? "tv" : "movie";
          const releaseDate = resolvedMediaType === "tv" ? item.first_air_date : item.release_date;
          const genreDict =
            resolvedMediaType === "tv" ? genreCache.tv.dict : genreCache.movie.dict;

          return {
            id: String(item.id),
            title: item.title || item.name || "Untitled",
            year: formatYear(releaseDate),
            genres: (item.genre_ids || [])
              .map((gid) => genreDict[gid])
              .filter((value): value is string => Boolean(value)),
            rating: Number((item.vote_average ?? 0).toFixed(1)),
            poster: item.poster_path ? `${TMDB_IMG_URL}${item.poster_path}` : FALLBACK_POSTER,
            overview: item.overview || "",
            mediaType: resolvedMediaType,
          };
        });

        setMovies(mapped);
        setCatalog((prev) => {
          const next = { ...prev };
          mapped.forEach((entry) => {
            next[entry.id] = entry;
          });
          return next;
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : "Unable to load titles from TMDb";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [activeFeed, query, trendingMediaType, trendingWindow, activeGenres, genreNameToId, feedMediaType, page, favoriteLibrary, watchlist, genreCache]);
  useEffect(() => {
    if (!selected) {
      setDetails(null);
      setDetailsError(null);
      return;
    }
    const controller = new AbortController();
    const endpoint = selected.mediaType === "tv" ? `/api/tmdb?fn=tv_details&tvId=${selected.id}` : `/api/tmdb?fn=movie_details&movieId=${selected.id}`;
    async function loadDetails() {
      setDetailsLoading(true);
      setDetailsError(null);
      try {
        const data = await fetchJSON<TmdbDetails>(endpoint, { signal: controller.signal });
        setDetails(data);
      }
      catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const message = err instanceof Error ? err.message : "Unable to load details from TMDb";
        setDetailsError(message);
      }
      finally {
        setDetailsLoading(false);
      }
    }
    loadDetails();
    return () => controller.abort();
  }, [selected]);
  const currentList = useMemo(() => {
    if (activeFeed === "watchlist") {
      return watchlist.map((id) => catalog[id]).filter((item): item is UiMovie => Boolean(item));
    }
    if (activeFeed === "favorites") {
      return Object.keys(favoriteLibrary)
        .map((id) => catalog[id] || favoriteLibrary[id])
        .filter((item): item is UiMovie => Boolean(item));
    }
    return movies;
  }, [activeFeed, watchlist, catalog, favoriteLibrary, movies]);
  const filtered = useMemo(() => { return currentList.filter((movie) => { const matchesRating = movie.rating >= minRating; const matchesGenres = activeGenres.length === 0 || activeGenres.every((g) => movie.genres.includes(g)); return matchesRating && matchesGenres; }); }, [currentList, minRating, activeGenres]);
  useEffect(() => {
    if (activeFeed === "watchlist" || activeFeed === "favorites") {
      const total = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
      setTotalPages(total);
      if (page > total) {
        setPage(total);
      }
    }
  }, [activeFeed, filtered.length, page]);

  const paginated = useMemo(() => {
    if (activeFeed === "watchlist" || activeFeed === "favorites") {
      const start = (page - 1) * ITEMS_PER_PAGE;
      return filtered.slice(start, start + ITEMS_PER_PAGE);
    }
    return filtered;
  }, [filtered, activeFeed, page]);

  const selectedMovie = useMemo(() => {
    if (!selected) {
      return null;
    }
    return catalog[selected.id] || favoriteLibrary[selected.id] || null;
  }, [selected, catalog, favoriteLibrary]);
  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim() && activeFeed !== "search") {
      setActiveFeed("search");
    }
    if (!value.trim() && activeFeed === "search") {
      setActiveFeed("popular");
    }
  }
  function toggleGenre(genre: string) { setActiveGenres((prev) => prev.includes(genre) ? prev.filter((item) => item !== genre) : [...prev, genre]); }
  function toggleWatchlist(id: string) { setWatchlist((prev) => prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]); }
  function toggleLike(id: string) {
    setFavoriteLibrary((prevLibrary) => {
      const isFavorite = Boolean(prevLibrary[id]);
      const nextLibrary = { ...prevLibrary };
      if (isFavorite) {
        delete nextLibrary[id];
      }
      else {
        const movie = catalog[id] || movies.find((item) => item.id === id);
        if (movie) {
          nextLibrary[id] = movie;
        }
      }
      setLikes((prevLikes) => {
        const nextLikes = { ...prevLikes };
        if (isFavorite) {
          delete nextLikes[id];
        }
        else if (nextLibrary[id]) {
          nextLikes[id] = true;
        }
        return nextLikes;
      });
      return nextLibrary;
    });
  }
  const handlePageChange = useCallback((nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, totalPages)));
  }, [totalPages]);

  const handleCloseDetails = useCallback(() => {
    setSelected(null);
  }, []);

  const tabsToRender = useMemo(() => {
    if (activeFeed === "search" && query.trim()) {
      return [...FEEDS, { id: "search", label: "Search", icon: undefined }];
    }
    return FEEDS;
  }, [activeFeed, query]);
  const posterPreviewBase = TMDB_IMG_URL ? TMDB_IMG_URL.replace("/w500", "/") : "";
  const preferredPosterSize = "w500";
  return (<div>      
    <HeaderWrap>        
    <Container>          
      <Brand>            
      <AppBadge>              
        <Film size={20} />            
        </AppBadge>            
        <div>              
          <div style={{ fontWeight: 700 }}>FilmFinder
            </div>              
            <Muted>Powered by TMDb</Muted>            
            </div>          
            </Brand>          
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>            
              <Button size="sm" variant={feedMediaType === "movie" ? "solid" : "outline"} onClick={() => handleFeedMediaTypeChange("movie")}>              
                Movies            
                </Button>            
                <Button size="sm" variant={feedMediaType === "tv" ? "solid" : "outline"} onClick={() => handleFeedMediaTypeChange("tv")}>              
                  TV Shows            
                  </Button>          
                  </div>        
                  </Container>        
                  <Container style={{ paddingTop: 0 }}>          
                    <InputWrap>            
                    <LeftIcon>              
                      <Search size={16} />           
                       </LeftIcon>            
                       <Input value={query} onChange={(event) => handleQueryChange(event.target.value)} placeholder="Search movies or TV shows" />          
                       </InputWrap>          <
                        div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>            
                        <Button onClick={() => handleQueryChange("")}>             
                           <X size={16} /> Clear search            
                           </Button>          
                           </div>        
                           </Container>        
                           <Container style={{ paddingTop: 8 }}>          
                            <Tabs>            
                              {tabsToRender.map((feed) => {
                                const Icon = feed.icon;
                                const isActive = activeFeed === feed.id;
                                const disabled = feed.id === "search" && !query.trim();
    return (<TabBtn key={feed.id} active={isActive} onClick={() => {
      if (disabled)
        return;
      setActiveFeed(feed.id as FeedId);
    }} disabled={disabled as boolean | undefined}>                 
     {Icon ? <Icon size={16} /> : null}                  
     {feed.label}                
     </TabBtn>);
  })}          
  </Tabs>        
  </Container>      
  </HeaderWrap>      
  <Main> <div style={{ position: "sticky", top: 100, display: "grid", gap: 16, height: "fit-content" }}>          
    <Card>            
      <CardHeader>              
        <CardTitle>Refine</CardTitle>              
        <CardDescription>Tune the recommendation feed.
          </CardDescription>            
          </CardHeader>            
          <CardBody style={{ display: "grid", gap: 24 }}>             
            <div>                
              <SliderRow>                  
              <div style={{ fontSize: 14, fontWeight: 600 }}>Minimum rating</div>                  
              <div style={{ fontSize: 12, color: theme.colors.subtext }}>{minRating.toFixed(1)}</div>
              </SliderRow>               
              <Range value={minRating} onChange={(event) => setMinRating(parseFloat(event.target.value))} />              
                </div>              
                <div>                
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Genres</div>                
                  <GenrePills>                  
                    {genreChoices.map((genre) => (<Pill key={genre} active={activeGenres.includes(genre)} onClick={() => toggleGenre(genre)}>                      
                      {genre}                      {activeGenres.includes(genre) && <X size={14} />}                    
                      </Pill>))}                
                      </GenrePills>             
                       </div>              
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>                
                        <Button variant="ghost" size="sm" onClick={() => setMinRating(7)}>                 
                           Reset                
                           </Button>   
                            
                            <Kbd>{activeGenres.length || "Any"} genres</Kbd>              
                            </div>            
                            </CardBody>          
                            </Card>          
                                                                 </div>       
                                                                  <section style={{ display: "grid", gap: 16 }}>          {activeFeed === "trending" && (<Card>              
                                                                    <CardBody style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>               
                                                                       <div style={{ fontWeight: 600 }}>Trending filters</div>                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>                 
                                                                         <label style={{ fontSize: 12, color: theme.colors.subtext }}>Type</label>                  <select value={trendingMediaType} onChange={(event) => handleFeedMediaTypeChange(event.target.value as "movie" | "tv")} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: 8, padding: "6px 10px", background: "#fff", }}>                    {TRENDING_MEDIA_TYPES.map((option) => (<option key={option.id} value={option.id}>                        {option.label}                      </option>))}                  </select>                </div>                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>                  <label style={{ fontSize: 12, color: theme.colors.subtext }}>Window</label>                  <select value={trendingWindow} onChange={(event) => setTrendingWindow(event.target.value as "day" | "week")} style={{ border: `1px solid ${theme.colors.border}`, borderRadius: 8, padding: "6px 10px", background: "#fff", }}>                    
                                                                          {TRENDING_WINDOWS.map((option) => (<option key={option.id} value={option.id}>                        {option.label}                      </option>))}             
                                                                               </select>              
                                                                                 </div>       
                                                                                      </CardBody>           
                                                                                       </Card>)}          
                                                                  {error && <Danger>TMDb error: {error}</Danger>} 
          {totalPages > 1 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, color: theme.colors.subtext }}>
                Page {page} of {totalPages}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
                  <AnimatePresence mode="popLayout">            
                  {loading ? (<Grid>  
                   {Array.from({ length: 8 }).map((_, index) => 
                    (<motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} 
                    style={{ height: 280, borderRadius: 12, background: theme.colors.muted, border: `1px solid ${theme.colors.border}`, }} />))}              
                   </Grid>) : filtered.length === 0 ? (<EmptyState onClear={() => { setActiveGenres([]); setMinRating(7); }} />) : (
                    <Grid> 
                      {paginated.map((movie, index) => (<motion.div key={movie.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }} transition={{ delay: index * 0.02 }}>                    
                        <MovieCard movie={movie} liked={Boolean(likes[movie.id])} watchlisted={watchlist.includes(movie.id)} onLike={() => toggleLike(movie.id)} onWatchlist={() => toggleWatchlist(movie.id)} onInfo={() => setSelected({ id: movie.id, mediaType: movie.mediaType })} />
                        </motion.div>))}              
                        </Grid>
                      )}          
                        </AnimatePresence>          
                        <DetailsPanel movie={selectedMovie} details={details} loading={detailsLoading} error={detailsError} onClose={handleCloseDetails} 
                        posterBase={`${posterPreviewBase}${preferredPosterSize}`} />        
                        </section>      
                        </Main>    
                        </div>);
}

function DetailsPanel({ movie, details, loading, error, onClose, posterBase }: DetailsPanelProps) {
  useEffect(() => {
    if (!movie || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const originalOverflow = document.body.style.overflow;
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [movie, onClose]);

  return (
    <AnimatePresence>
      {movie ? (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,10,10,0.65)",
            display: "grid",
            placeItems: "center",
            padding: 24,
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            style={{ width: "min(720px, 100%)" }}
          >
            <Card style={{ display: "grid", maxHeight: "90vh", gridTemplateRows: "auto 1fr" }}>
              <CardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <CardTitle>{movie.title}</CardTitle>
                  <CardDescription>
                    {movie.mediaType === "tv" ? "TV show details" : "Movie details"} sourced from TMDb
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardBody style={{ display: "grid", gap: 12, overflowY: "auto", padding: 16 }}>
                {loading ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
                    <Loader2 size={16} /> Loading details...
                  </div>
                ) : error ? (
                  <Danger>{error}</Danger>
                ) : details ? (
                  <>
                    <div style={{ fontSize: 14 }}>
                      <strong>Overview:</strong>
                      <div style={{ marginTop: 6 }}>{details.overview || "No overview provided."}</div>
                    </div>
                    {details.tagline ? (
                      <div style={{ fontStyle: "italic", color: theme.colors.subtext }}>
                        &quot;{details.tagline}&quot;
                      </div>
                    ) : null}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
                      <span>
                        <strong>Year:</strong> {movie.year}
                      </span>
                      <span>
                        <strong>Rating:</strong> {movie.rating.toFixed(1)}
                      </span>
                      {details.runtime ? (
                        <span>
                          <strong>Runtime:</strong> {details.runtime} min
                        </span>
                      ) : null}
                      {details.episode_run_time && details.episode_run_time.length ? (
                        <span>
                          <strong>Episode runtime:</strong> {details.episode_run_time[0]} min
                        </span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <strong>Genres:</strong> {(details.genres || []).map((g) => g.name).join(", ") || "-"}
                    </div>
                    <div style={{ fontSize: 13 }}>
                      <strong>Top cast:</strong>{" "}
                      {(details.credits?.cast || [])
                        .slice(0, 5)
                        .map((person) => (person.character ? `${person.name} as ${person.character}` : person.name))
                        .join(", ") || "Unavailable"}
                    </div>
                    {details.images?.posters && details.images.posters.length ? (
                      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingTop: 4 }}>
                        {details.images.posters.slice(0, 4).map((poster) => (
                          <Image
                            key={poster.file_path}
                            src={`${posterBase}${poster.file_path}`}
                            alt="Poster"
                            width={120}
                            height={180}
                            sizes="120px"
                            style={{ width: 120, height: "auto", borderRadius: 8, border: `1px solid ${theme.colors.border}` }}
                          />
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <Muted>Select a title to load details.</Muted>
                )}
              </CardBody>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function EmptyState({ onClear }: EmptyStateProps) { 
  return (
  <Card>      
    <CardBody style={{ minHeight: "30vh", display: "grid", placeItems: "center" }}>       
       <div style={{ maxWidth: 420, textAlign: "center", display: "grid", gap: 12 }}>          
        <div style={{ width: 56, height: 56, margin: "0 auto", display: "grid", 
          placeItems: "center", border: `1px solid ${theme.colors.border}`, 
          background: "#fff", borderRadius: 16, boxShadow: theme.shadow, 
          }}>            
          <Search size={20} />          
          </div>          
          <div style={{ fontWeight: 700 }}>No matches just yet</div>         
           <div style={{ fontSize: 14, color: theme.colors.subtext }}>           
             Adjust your filters or try a different search term. You can also reset filters to start fresh.          
             </div>          
             <Button variant="outline" size="sm" onClick={onClear} style={{ width: "fit-content", margin: "0 auto" }}>            
              Reset filters          
              </Button>        
              </div>      
              </CardBody>   
               </Card>
               ); 
              }