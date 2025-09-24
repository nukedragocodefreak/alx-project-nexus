import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fn = (req.query.fn as string) || "popular";
    const q = (req.query.q as string) || "";
    const base = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL || "https://api.themoviedb.org/3";
    const key = process.env.NEXT_PUBLIC_TMDB_READACCESS_API_KEY;
      if (!key) {
      res.status(500).json({ error: "Missing TMDB_API_KEY" });
      return;
      }

    let url = `${base}/movie/popular`;   
     if (fn === "search" && q) url = `${base}/search/movie?query=${encodeURIComponent(q)}`;
     if(fn == "trending") url = `${base}/trending/movie/day`; 
     if(fn == "top_rated") url = `${base}/movie/top_rated`;
     if(fn == "upcoming") url = `${base}/movie/upcoming`;
     if(fn == "now_playing") url = `${base}/movie/now_playing`;
     if(fn == "latest") url = `${base}/movie/latest`;
     if(fn == "popular") url = `${base}/movie/popular`;
     if(fn == "discover") url = `${base}/discover/movie`;
     if(fn == "genre_list") url = `${base}/genre/movie/list}`;
     if(fn == "movie_details" && q) url = `${base}/movie/${encodeURIComponent(q)}&append_to_response=videos,images,credits,reviews,recommendations`;
     if(fn == "movie_credits" && q) url = `${base}/movie/${encodeURIComponent(q)}/credits`;
     if(fn == "movie_reviews" && q) url = `${base}/movie/${encodeURIComponent(q)}/reviews`;
     if(fn == "movie_recommendations" && q) url = `${base}/movie/${encodeURIComponent(q)}/recommendations`;
     if(fn == "movie_similar" && q) url = `${base}/movie/${encodeURIComponent(q)}/similar`;
     if(fn == "person_details" && q) url = `${base}/person/${encodeURIComponent(q)}&append_to_response=movie_credits,tv_credits,images`;
     if(fn == "person_movie_credits" && q) url = `${base}/person/${encodeURIComponent(q)}/movie_credits`;
     if(fn == "person_tv_credits" && q) url = `${base}/person/${encodeURIComponent(q)}/tv_credits`;
     if(fn == "person_images" && q) url = `${base}/person/${encodeURIComponent(q)}/images`;
     if(fn == "tv_details" && q) url = `${base}/tv/${encodeURIComponent(q)}&append_to_response=videos,images,credits,reviews,recommendations`;
     if(fn == "tv_credits" && q) url = `${base}/tv/${encodeURIComponent(q)}/credits`;
     if(fn == "tv_reviews" && q) url = `${base}/tv/${encodeURIComponent(q)}/reviews`;
     if(fn == "tv_recommendations" && q) url = `${base}/tv/${encodeURIComponent(q)}/recommendations`;
     if(fn == "tv_similar" && q) url = `${base}/tv/${encodeURIComponent(q)}/similar`;

   const response = await fetch(url, {headers: { accept: 'application/json' }});
     if (!response.ok) {
        res.status(response.status).json({ error: `TMDB API error: ${response.statusText}` });
        return;
      }
        const data = await response.text();
        res.setHeader('Content-Type', 'application/json');
        res.status(response.status).send(data);
     }
      catch (error: any) {
        res.status(500).json({ error: "Internal server error" });
    }
}