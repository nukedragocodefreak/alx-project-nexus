export type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_average?: number;
  overview?: string;
  poster_path?: string | null;
};

export type UiMovie = {
  id: string;
  title: string;
  year: string;
  genres: string[];
  rating: number;
  runtime?: number;
  poster: string;
  overview: string;
  trending?: boolean;
};