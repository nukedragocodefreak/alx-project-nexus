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
  media_type?: "movie" | "tv" | string;
};

export type TmdbListResponse = {
  results?: TmdbMovie[];
  items?: TmdbMovie[];
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
  mediaType: "movie" | "tv";
};

export type GenreState = {
  dict: Record<number, string>;
  nameToId: Record<string, number>;
  names: string[];
};

export type SelectedItem = {
  id: string;
  mediaType: "movie" | "tv";
};
export type TmdbConfiguration = {
  images?: {
    base_url?: string;
    secure_base_url?: string;
    poster_sizes?: string[];
    backdrop_sizes?: string[];
  };
};
export type TmdbDetails = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  tagline?: string;
  runtime?: number;
  episode_run_time?: number[];
  release_date?: string;
  first_air_date?: string;
  genres?: Array<{
    id: number;
    name: string;
  }>;
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character?: string;
    }>;
    crew?: Array<{
      id: number;
      name: string;
      job?: string;
    }>;
  };
  images?: {
    posters?: Array<{
      file_path: string;
    }>;
    backdrops?: Array<{
      file_path: string;
    }>;
  };
  vote_average?: number;
};

export type DetailsPanelProps = {
  movie: UiMovie | null;
  details: TmdbDetails | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  posterBase: string;
};
