import React from "react";
import { Star, Heart, Plus, Info } from "lucide-react";
import theme, { Components } from "@/components/theme";
import { truncate } from "@/Utils/index";
import { MovieCardProps } from "@/interfaces";

const { Card, CardBody, PosterWrap, Poster, Overlay, YearBadge, Tiny, Button } = Components;

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  liked,
  watchlisted,
  onLike,
  onWatchlist,
  onInfo,
}) => {
  const meta = [movie.mediaType === "tv" ? "TV Show" : "Movie", movie.genres.slice(0, 3).join(", ")]
    .filter(Boolean)
    .join(" | ");

  return (
    <Card>
      <PosterWrap>
        <Poster src={movie.poster} alt={movie.title} />
        <Overlay>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <YearBadge>{movie.year}</YearBadge>
              <Tiny>
                <Star size={14} fill="currentColor" /> {movie.rating.toFixed(1)}
              </Tiny>
            </div>
            <div
              style={{
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(0,0,0,.4)",
              }}
            >
              {movie.title}
            </div>
            {meta ? <Tiny style={{ opacity: 0.9 }}>{meta}</Tiny> : null}
          </div>

          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <Button
              size="icon"
              variant="outline"
              onClick={onLike}
              style={{ background: liked ? "#ffe4ef" : undefined }}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart size={16} {...(liked ? { fill: "currentColor" } : {})} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={onWatchlist}
              style={{ background: watchlisted ? "#ffedd5" : undefined }}
              aria-label={watchlisted ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Plus size={16} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={onInfo}
              disabled={!onInfo}
              aria-label="More details"
              style={{
                background: onInfo ? "#eef2ff" : undefined,
                color: onInfo ? "#1d4ed8" : theme.colors.subtext,
                borderColor: onInfo ? "#bfdbfe" : theme.colors.border,
              }}
            >
              <Info size={16} strokeWidth={2.4} />
            </Button>
          </div>
        </Overlay>
      </PosterWrap>

      <CardBody>
        <div style={{ fontSize: 14, color: theme.colors.subtext }}>
          {truncate(movie.overview)}
        </div>
      </CardBody>
    </Card>
  );
};

export default MovieCard;
