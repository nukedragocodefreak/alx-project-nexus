import React, { useEffect, useMemo, useState } from "react";
import theme, { Components } from "@/styles/theme";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, Sparkles, Star, Film, Heart, Plus, Info, Play, Clock, X } from "lucide-react";
import type { TmdbMovie, UiMovie } from "../types"; 
import { fetchJSON } from "@/Utils/index";
import MovieCard from "@/components/MovieCard";
const { 
  HeaderWrap,
  Container,
  Brand,
  AppBadge,
  Muted,
  Button,
  InputWrap,
  Input,
  LeftIcon,
  RightShortcuts,
  Kbd,
  Tabs,
  TabBtn,
  Main,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
  SliderRow,
  Range,
  GenrePills,
  Pill,
  Grid,
  Danger
 } = Components;
//--- Config ------------------------------------------------------------------------------------
const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1496440737103-cd596325d314?q=80&w=1200&auto=format&fit=crop";
const GENRES_UI = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "History",
  "Horror",
  "Mystery",
  "Romance",
  "Sci‑Fi",
  "Thriller",
];

//--- Utils ------------------------------------------------------------------------------------

export default function MovieRecommendationsUI() {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState([7]);
  const [activeGenres, setActiveGenres] = useState<string[]>([]);
  const [tab, setTab] = useState("for-you");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const [movies, setMovies] = useState<UiMovie[]>([]);
  const [genresDict, setGenresDict] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
    // Load TMDb genre dictionary once (for mapping genre_ids -> names)
  useEffect(() => {
    fetchJSON("/api/tmdb?fn=genres")
      .then((data) => {
        const dict: Record<number, string> = {};
        data.genres?.forEach((g: { id: number; name: string }) => (dict[g.id] = g.name));
        setGenresDict(dict);
      })
      .catch(() => {});
  }, []);

   // Load movies when tab or query changes
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let url = "/api/tmdb?fn=popular";
        if (tab === "trending") url = "/api/tmdb?fn=trending";
        if (query.trim()) url = `/api/tmdb?fn=search&q=${encodeURIComponent(query.trim())}`;
        const json = await fetchJSON(url, { signal: controller.signal });
        const list: UiMovie[] = (json.results || []).map((m: TmdbMovie) => ({
          id: String(m.id),
          title: m.title || m.name || "Untitled",
          year: (m.release_date || m.first_air_date || "").slice(0, 4) || "—",
          genres: (m.genre_ids || []).map((gid) => genresDict[gid]).filter(Boolean),
          rating: Number((m.vote_average || 0).toFixed(1)),
          poster: m.poster_path ? `${TMDB_IMG_URL}${m.poster_path}` : FALLBACK_POSTER,
          overview: m.overview || "",
          trending: tab === "trending",
        }));
        setMovies(list);
      } catch (e: any) {
        setError(e?.message || "Failed to load from TMDb");
      } finally {
        setLoading(false);
      }
    }

    load();
        return () => controller.abort();
      }, [tab, query, genresDict]);
    
      const filtered = useMemo(() => {
        return movies.filter((m) => {
          const matchesRating = m.rating >= minRating;
          const matchesGenres =
            activeGenres.length === 0 || activeGenres.every((g) => m.genres.includes(g));
          if (tab === "watchlist" && !watchlist.includes(m.id)) return false;
          return matchesRating && matchesGenres;
        });
      }, [movies, minRating, activeGenres, tab, watchlist]);
    
      function toggleGenre(g: string) {
        setActiveGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
      }
      function toggleWatchlist(id: string) {
        setWatchlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
      }
      function toggleLike(id: string) {
        setLikes((l) => ({ ...l, [id]: !l[id] }));
      }

      return (
          <div>
            <HeaderWrap>
              <Container>
                <Brand>
                  <AppBadge><Film size={18} /></AppBadge>
                  <div>
                    <div style={{fontWeight:700, lineHeight:1}}>Recs • Next.js</div>
                    <Muted style={{fontSize:12}}>TMDb Demo</Muted>
                  </div>
                </Brand>
                <div style={{display:"none", gap:12}} className="md:flex">
                  <Kbd>v1.1</Kbd>
                  <div style={{width:1, height:32, background: theme.colors.border}} />
                  <Button variant="outline" size="sm">Sign in</Button>
                  <Button size="sm">Create account</Button>
                </div>
              </Container>
              <Container style={{paddingTop:0}}>
                <InputWrap>
                  <LeftIcon><Search size={16} /></LeftIcon>
                  <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search titles, people, or keywords…" />
                  <RightShortcuts>
                    <Kbd>⌘K</Kbd>
                    <Kbd>/</Kbd>
                  </RightShortcuts>
                </InputWrap>
                <div style={{marginLeft:"auto", display:"flex", gap:8}}>
                  <Button variant="outline"><SlidersHorizontal size={16} /> Filters</Button>
                  <Button onClick={()=>setQuery("")}> <Sparkles size={16}/> Surprise me</Button>
                </div>
              </Container>
              <Container style={{paddingTop:8}}>
                <Tabs>
                  <TabBtn active={tab==="for-you"} onClick={()=>setTab("for-you")}><Sparkles size={16}/> For you</TabBtn>
                  <TabBtn active={tab==="trending"} onClick={()=>setTab("trending")}>🔥 Trending</TabBtn>
                  <TabBtn active={tab==="watchlist"} onClick={()=>setTab("watchlist")}><Clock size={16}/> Watchlist</TabBtn>
                </Tabs>
              </Container>
            </HeaderWrap>
      
            <Main>
              {/* Left rail */}
              <div style={{position:"sticky", top:100, height:"fit-content"}}>
                <Card>
                  <CardHeader>
                    <CardTitle>Refine</CardTitle>
                    <CardDescription>Tune results to your taste.</CardDescription>
                  </CardHeader>
                  <CardBody style={{display:"grid", gap:24}}>
                    <div>
                      <SliderRow>
                        <div style={{fontSize:14, fontWeight:600}}>Minimum rating</div>
                        <div style={{fontSize:12, color: theme.colors.subtext}}>{minRating.toFixed(1)}</div>
                      </SliderRow>
                      <Range value={minRating} onChange={(e)=>setMinRating(parseFloat(e.target.value))} />
                    </div>
                    <div>
                      <div style={{fontSize:14, fontWeight:600, marginBottom:8}}>Genres</div>
                      <GenrePills>
                        {GENRES_UI.map((g)=> (
                          <Pill key={g} active={activeGenres.includes(g)} onClick={()=>toggleGenre(g)}>
                            {g}
                            {activeGenres.includes(g) && <X size={14} />}
                          </Pill>
                        ))}
                      </GenrePills>
                    </div>
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                      <Button variant="ghost" size="sm" onClick={()=>setMinRating(7)}>Reset</Button>
                      <Kbd>{activeGenres.length || "Any"} genres</Kbd>
                    </div>
                  </CardBody>
                </Card>
              </div>
      
              {/* Grid */}
              <section>
                {error && (
                  <Danger>TMDb error: {error}</Danger>
                )}
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <Grid>
                      {Array.from({length:8}).map((_,i)=> (
                        <div key={i} style={{height:280, borderRadius:12, background: theme.colors.muted, animation:"pulse 1.2s infinite"}} />
                      ))}
                    </Grid>
                  ) : filtered.length === 0 ? (
                    <EmptyState />
                  ) : (
                    <Grid>
                      {filtered.map((m, i) => (
                        <motion.div
                          key={m.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ delay: i * 0.02 }}
                        >
                          <MovieCard
                            movie={m}
                            liked={!!likes[m.id]}
                            watchlisted={watchlist.includes(m.id)}
                            onLike={() => toggleLike(m.id)}
                            onWatchlist={() => toggleWatchlist(m.id)}
                          />
                        </motion.div>
                      ))}
                    </Grid>
                  )}
                </AnimatePresence>
              </section>
            </Main>
          </div>
        );
      }

      function EmptyState() {
        return (
          <div style={{minHeight:"40vh", display:"grid", placeItems:"center"}}>
            <div style={{maxWidth:480, textAlign:"center"}}>
              <div style={{width:56,height:56, margin:"0 auto 12px", display:"grid", placeItems:"center", border:"1px solid #e5e5e5", background:"#fff", borderRadius:16, boxShadow: theme.shadow}}>
                <Search />
              </div>
              <div style={{fontWeight:700, marginBottom:6}}>No matches… yet</div>
              <div style={{fontSize:14, color: theme.colors.subtext}}>
                Try clearing some filters or searching for a different title. You can also hit <Kbd>Surprise me</Kbd> to discover something new.
              </div>
            </div>
          </div>
        );
  }