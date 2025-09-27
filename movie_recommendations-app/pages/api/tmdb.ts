import type { NextApiRequest, NextApiResponse } from "next";

class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const RESERVED_QUERY_KEYS = new Set([
  "fn",
  "q",
  "movieId",
  "tvId",
  "mediaType",
  "timeWindow",
]);

function toSingleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function requireParam(req: NextApiRequest, key: string, message: string): string {
  const value = toSingleValue(req.query[key]);
  if (!value) {
    throw new HttpError(400, message);
  }
  return value;
}

function applyPassthroughParams(url: URL, req: NextApiRequest, extraReserved: string[] = []) {
  const blocked = new Set([...Array.from(RESERVED_QUERY_KEYS), ...extraReserved]);

  for (const [key, rawValue] of Object.entries(req.query)) {
    if (blocked.has(key)) continue;
    if (rawValue === undefined) continue;

    if (Array.isArray(rawValue)) {
      rawValue.forEach((v) => {
        if (v !== undefined) url.searchParams.append(key, v);
      });
    } else {
      url.searchParams.set(key, rawValue);
    }
  }
}

function buildTmdbUrl(fn: string, req: NextApiRequest, base: string): string {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  let path = "/movie/popular";
  const passthroughExclusions: string[] = [];

  switch (fn) {
    case "popular":
      path = "/movie/popular";
      break;
    case "now_playing":
      path = "/movie/now_playing";
      break;
    case "upcoming":
      path = "/movie/upcoming";
      break;
    case "search": {
      const q = toSingleValue(req.query.q);
      if (!q) {
        throw new HttpError(400, "Missing search query");
      }
      path = "/search/movie";
      const url = new URL(path, normalizedBase);
      url.searchParams.set("query", q);
      applyPassthroughParams(url, req);
      return url.toString();
    }
    case "movie_details": {
      const movieId = requireParam(req, "movieId", "movieId is required for movie_details endpoint");
      path = `/movie/${movieId}`;
      const url = new URL(path, normalizedBase);
      if (!req.query.append_to_response) {
        url.searchParams.set(
          "append_to_response",
          "images,credits,release_dates,videos,recommendations"
        );
      }
      applyPassthroughParams(url, req);
      return url.toString();
    }
    case "movie_credits": {
      const movieId = requireParam(req, "movieId", "movieId is required for movie_credits endpoint");
      path = `/movie/${movieId}/credits`;
      break;
    }
    case "movie_images": {
      const movieId = requireParam(req, "movieId", "movieId is required for movie_images endpoint");
      path = `/movie/${movieId}/images`;
      break;
    }
    case "tv_details": {
      const tvId = requireParam(req, "tvId", "tvId is required for tv_details endpoint");
      path = `/tv/${tvId}`;
      const url = new URL(path, normalizedBase);
      if (!req.query.append_to_response) {
        url.searchParams.set("append_to_response", "images,credits,videos,recommendations");
      }
      applyPassthroughParams(url, req);
      return url.toString();
    }
    case "tv_credits": {
      const tvId = requireParam(req, "tvId", "tvId is required for tv_credits endpoint");
      path = `/tv/${tvId}/credits`;
      break;
    }
    case "tv_popular":
      path = "/tv/popular";
      break;
    case "trending": {
      const mediaType = toSingleValue(req.query.mediaType) || "movie";
      const timeWindow = toSingleValue(req.query.timeWindow) || "day";
      path = `/trending/${mediaType}/${timeWindow}`;
      const url = new URL(path, normalizedBase);
      applyPassthroughParams(url, req, ["mediaType", "timeWindow"]);
      return url.toString();
    }
    case "configuration":
      path = "/configuration";
      break;
    case "discover":
    case "discover_movie":
      path = "/discover/movie";
      break;
    case "genre_list":
      path = "/genre/movie/list";
      break;
    case "movie_recommendations": {
      const movieId = requireParam(req, "movieId", "movieId is required for movie_recommendations endpoint");
      path = `/movie/${movieId}/recommendations`;
      break;
    }
    case "movie_similar": {
      const movieId = requireParam(req, "movieId", "movieId is required for movie_similar endpoint");
      path = `/movie/${movieId}/similar`;
      break;
    }
    default:
      path = "/movie/popular";
      break;
  }

  const url = new URL(path, normalizedBase);
  applyPassthroughParams(url, req, passthroughExclusions);
  return url.toString();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fn = (req.query.fn as string) || "popular";
  const base = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL || "https://api.themoviedb.org/3";
  const token = process.env.NEXT_PUBLIC_TMDB_READACCESS_API_KEY;

  if (!token) {
    res.status(500).json({ error: "Missing TMDB API token" });
    return;
  }

  try {
    const url = buildTmdbUrl(fn, req, base);
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: payload });
      return;
    }

    res.status(response.status).json(payload);
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}