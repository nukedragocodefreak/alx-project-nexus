import { UiMovie } from "@/types";

export interface MovieCardProps {
  movie: UiMovie;
  liked: boolean;
  watchlisted: boolean;
  onLike: () => void;
  onWatchlist: () => void;
  onInfo?: () => void;
}