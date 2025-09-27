import axios from "axios";
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
        if (v !== undefined) {
          url.searchParams.append(key, v);
        }
      });
    } else {
      url.searchParams.set(key, rawValue);
    }
  }
}

function createUrl(base: string, path: string): URL {
  const trimmedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(`${trimmedBase}${normalizedPath}`);
}

function finalizeUrl(
  url: URL,
  req: NextApiRequest,
  extraReserved: string[] = [],
  apiKey?: string
): URL {
  applyPassthroughParams(url, req, extraReserved);
  if (apiKey && !url.searchParams.has("api_key")) {
    url.searchParams.set("api_key", apiKey);
  }
  return url;
}


function resolveMediaType(req: NextApiRequest, defaultType: "movie" | "tv" = "movie"): "movie" | "tv" {
  const raw = toSingleValue(req.query.mediaType);
  return raw === "tv" ? "tv" : defaultType;
}

function maskApiKey(urlString: string): string {
  try {
    const url = new URL(urlString);
    if (url.searchParams.has("api_key")) {
      url.searchParams.set("api_key", "***");
    }
    return url.toString();
  } catch {
    return urlString;
  }
}


function buildTmdbUrl(
  fn: string,
  req: NextApiRequest,
  base: string,
  apiKey?: string
): string {
  switch (fn) {
    case "popular": {
      const mediaType = resolveMediaType(req);
      const path = mediaType === "tv" ? "tv/popular" : "movie/popular";
      const url = createUrl(base, path);
      finalizeUrl(url, req, ["mediaType"], apiKey);
      return url.toString();
    }
    case "now_playing": {
      const mediaType = resolveMediaType(req);
      const path = mediaType === "tv" ? "tv/on_the_air" : "movie/now_playing";
      const url = createUrl(base, path);
      finalizeUrl(url, req, ["mediaType"], apiKey);
      return url.toString();
    }
    case "upcoming": {
      const mediaType = resolveMediaType(req);
      const path = mediaType === "tv" ? "tv/airing_today" : "movie/upcoming";
      const url = createUrl(base, path);
      finalizeUrl(url, req, ["mediaType"], apiKey);
      return url.toString();
    }
    case "discover":
    case "discover_movie": {
      const mediaType = resolveMediaType(req);
      const path = mediaType === "tv" ? "discover/tv" : "discover/movie";
      const url = createUrl(base, path);
      finalizeUrl(url, req, ["mediaType"], apiKey);
      return url.toString();
    }
    case "genre_list": {
      const mediaType = resolveMediaType(req);
      const path = mediaType === "tv" ? "genre/tv/list" : "genre/movie/list";
      const url = createUrl(base, path);
      finalizeUrl(url, req, ["mediaType"], apiKey);
      return url.toString();
    }
    case "search": {
      const q = toSingleValue(req.query.q);
      if (!q) {
        throw new HttpError(400, "Missing search query");
      }
      const mediaType = resolveMediaType(req);
      const path = mediaType === "tv" ? "search/tv" : "search/movie";
      const url = createUrl(base, path);
      url.searchParams.set("query", q);
      finalizeUrl(url, req, ["mediaType"], apiKey);
      return url.toString();
    }
    case "trending": {
      const mediaType = toSingleValue(req.query.mediaType) || "movie";
      const timeWindow = toSingleValue(req.query.timeWindow) || "day";
      const url = createUrl(base, `trending/${mediaType}/${timeWindow}`);
      finalizeUrl(url, req, ["mediaType", "timeWindow"], apiKey);
      return url.toString();
    }
    case "configuration": {
      const url = createUrl(base, "configuration");
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "movie_details": {
      const movieId = requireParam(
        req,
        "movieId",
        "movieId is required for movie_details endpoint"
      );
      const url = createUrl(base, `movie/${movieId}`);
      if (!req.query.append_to_response) {
        url.searchParams.set(
          "append_to_response",
          "images,credits,release_dates,videos,recommendations"
        );
      }
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "movie_credits": {
      const movieId = requireParam(
        req,
        "movieId",
        "movieId is required for movie_credits endpoint"
      );
      const url = createUrl(base, `movie/${movieId}/credits`);
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "movie_images": {
      const movieId = requireParam(
        req,
        "movieId",
        "movieId is required for movie_images endpoint"
      );
      const url = createUrl(base, `movie/${movieId}/images`);
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "movie_recommendations": {
      const movieId = requireParam(
        req,
        "movieId",
        "movieId is required for movie_recommendations endpoint"
      );
      const url = createUrl(base, `movie/${movieId}/recommendations`);
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "movie_similar": {
      const movieId = requireParam(
        req,
        "movieId",
        "movieId is required for movie_similar endpoint"
      );
      const url = createUrl(base, `movie/${movieId}/similar`);
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "tv_popular": {
      const url = createUrl(base, "tv/popular");
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "tv_details": {
      const tvId = requireParam(req, "tvId", "tvId is required for tv_details endpoint");
      const url = createUrl(base, `tv/${tvId}`);
      if (!req.query.append_to_response) {
        url.searchParams.set("append_to_response", "images,credits,videos,recommendations");
      }
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    case "tv_credits": {
      const tvId = requireParam(req, "tvId", "tvId is required for tv_credits endpoint");
      const url = createUrl(base, `tv/${tvId}/credits`);
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
    default: {
      const url = createUrl(base, "movie/popular");
      finalizeUrl(url, req, [], apiKey);
      return url.toString();
    }
  }
}

function resolveCredentials(): { bearerToken?: string; apiKey?: string } {
  const rawReadAccess =
    process.env.NEXT_PUBLIC_TMDB_READACCESS_API_KEY || "";

  const result: { bearerToken?: string; apiKey?: string } = {};

  if (rawReadAccess) {
    const looksLikeApiKey = /^[A-Za-z0-9]{32}$/.test(rawReadAccess);
    if (looksLikeApiKey && !result.apiKey) {
      result.apiKey = rawReadAccess;
    } else {
      result.bearerToken = rawReadAccess;
    }
  }

  return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const fn = (req.query.fn as string) || "popular";
  const base = process.env.NEXT_PUBLIC_TMDB_API_BASE_URL || "http://api.themoviedb.org/3";
  const { bearerToken, apiKey } = resolveCredentials();

  if (!bearerToken && !apiKey) {
    res.status(500).json({ error: "Missing TMDB credentials" });
    return;
  }

  const requestHeaders: Record<string, string> = {
    accept: "application/json",
    ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
  };
  const shouldLogRequest =
    process.env.NEXT_PUBLIC_TMDB_LOG_REQUESTS === "true" ||
    process.env.TMDB_LOG_REQUESTS === "true";

  let targetUrl: string | null = null;

  try {
    targetUrl = buildTmdbUrl(fn, req, base, apiKey);
    if (shouldLogRequest) {
      const safeHeaders = { ...requestHeaders };
      if (safeHeaders.Authorization) {
        safeHeaders.Authorization = "Bearer ***";
      }
      console.log("[tmdb] outbound request", { fn, url: maskApiKey(targetUrl), headers: safeHeaders });
    }

    const response = await axios.get(targetUrl, {
      headers: requestHeaders,
      validateStatus: () => true,
    });

    const { status, data } = response;

    if (shouldLogRequest) {
      let responsePreview: unknown = data;
      if (typeof responsePreview === "object" && responsePreview !== null) {
        try {
          const serialized = JSON.stringify(responsePreview);
          responsePreview = serialized.length > 1000 ? `${serialized.slice(0, 1000)}...` : serialized;
        } catch {
          responsePreview = "[unserializable payload]";
        }
      }
      console.log("[tmdb] response", { fn, status, url: maskApiKey(targetUrl), preview: responsePreview });
    }

    if (status < 200 || status >= 300) {
      res.status(status).json({ error: data });
      return;
    }

    res.status(status).json(data);
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 500;
      const data = error.response?.data ?? error.message;
      const rawUrl = error.config?.url ?? targetUrl;
      if (shouldLogRequest) {
        const safeUrl = rawUrl ? maskApiKey(rawUrl) : "unknown";
        console.error("[tmdb] axios error", { fn, url: safeUrl, status, message: error.message });
      }
      res.status(status).json({ error: data });
      return;
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ error: message });
  }
}
