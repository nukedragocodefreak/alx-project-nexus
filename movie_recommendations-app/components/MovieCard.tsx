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
}) => {
  return (
    <Card>
      <PosterWrap>
        <Poster src={movie.poster} alt={movie.title} />
        <Overlay>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <YearBadge>{movie.year}</YearBadge>
              <Tiny>
                <Star size={14} fill="currentColor" /> {movie.rating}
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
            <Tiny style={{ opacity: 0.9 }}>{movie.genres.join(" • ")}</Tiny>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <Button
              size="icon"
              variant="outline"
              onClick={onLike}
              style={{ background: liked ? "#ffe4ef" : undefined }}
            >
              <Heart size={16} {...(liked ? { fill: "currentColor" } : {})} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={onWatchlist}
              style={{ background: watchlisted ? "#ffedd5" : undefined }}
            >
              <Plus size={16} />
            </Button>
            <Button size="icon" variant="outline" aria-label="Info">
              <Info size={16} />
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
