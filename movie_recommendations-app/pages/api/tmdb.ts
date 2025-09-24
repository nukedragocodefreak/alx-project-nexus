import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fn = (req.query.fn as string) || "popular";
    const q = (req.query.q as string) || "";
    const key = process.env.TMDB_API_KEY;
    const base = "https://api.themoviedb.org/3";

        if (!key) {
        res.status(500).json({ error: "Missing TMDB_API_KEY" });
        return;
        }

    let url = `${base}/movie/popular?api_key=${key}`;   
     if (fn === "search" && q) url = `${base}/search/movie?query=${encodeURIComponent(q)}&api_key=${key}`;
     if(fn == "trending") url = `${base}/trending/movie/day?api_key=${key}`; 
     if(fn == "top_rated") url = `${base}/movie/top_rated?api_key=${key}`;
     if(fn == "upcoming") url = `${base}/movie/upcoming?api_key=${key}`;
     if(fn == "now_playing") url = `${base}/movie/now_playing?api_key=${key}`;
     if(fn == "latest") url = `${base}/movie/latest?api_key=${key}`;
     if(fn == "popular") url = `${base}/movie/popular?api_key=${key}`;
     if(fn == "discover") url = `${base}/discover/movie?api_key=${key}`;
     if(fn == "genre_list") url = `${base}/genre/movie/list?api_key=${key}`;
     if(fn == "movie_details" && q) url = `${base}/movie/${encodeURIComponent(q)}?api_key=${key}&append_to_response=videos,images,credits,reviews,recommendations`;
     if(fn == "movie_credits" && q) url = `${base}/movie/${encodeURIComponent(q)}/credits?api_key=${key}`;
     if(fn == "movie_reviews" && q) url = `${base}/movie/${encodeURIComponent(q)}/reviews?api_key=${key}`;
     if(fn == "movie_recommendations" && q) url = `${base}/movie/${encodeURIComponent(q)}/recommendations?api_key=${key}`;
     if(fn == "movie_similar" && q) url = `${base}/movie/${encodeURIComponent(q)}/similar?api_key=${key}`;
     if(fn == "person_details" && q) url = `${base}/person/${encodeURIComponent(q)}?api_key=${key}&append_to_response=movie_credits,tv_credits,images`;
     if(fn == "person_movie_credits" && q) url = `${base}/person/${encodeURIComponent(q)}/movie_credits?api_key=${key}`;
     if(fn == "person_tv_credits" && q) url = `${base}/person/${encodeURIComponent(q)}/tv_credits?api_key=${key}`;
     if(fn == "person_images" && q) url = `${base}/person/${encodeURIComponent(q)}/images?api_key=${key}`;
     if(fn == "tv_details" && q) url = `${base}/tv/${encodeURIComponent(q)}?api_key=${key}&append_to_response=videos,images,credits,reviews,recommendations`;
     if(fn == "tv_credits" && q) url = `${base}/tv/${encodeURIComponent(q)}/credits?api_key=${key}`;
     if(fn == "tv_reviews" && q) url = `${base}/tv/${encodeURIComponent(q)}/reviews?api_key=${key}`;
     if(fn == "tv_recommendations" && q) url = `${base}/tv/${encodeURIComponent(q)}/recommendations?api_key=${key}`;
     if(fn == "tv_similar" && q) url = `${base}/tv/${encodeURIComponent(q)}/similar?api_key=${key}`;

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