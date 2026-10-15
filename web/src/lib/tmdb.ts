import "server-only";

const BASE = "https://api.themoviedb.org/3";

export type TmdbSearchResult = {
  id: number;
  title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string | null;
};

export type TmdbMovie = TmdbSearchResult & {
  imdb_id?: string | null;
  runtime?: number | null;
};

export function hasTmdbToken() {
  return Boolean(process.env.TMDB_API_READ_TOKEN);
}

async function tmdb<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}` },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json();
}

export async function searchMovies(query: string) {
  const data = await tmdb<{ results: TmdbSearchResult[] }>(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false`,
  );
  return data.results;
}

export function getMovie(tmdbId: number) {
  return tmdb<TmdbMovie>(`/movie/${tmdbId}`);
}

export function posterUrl(path: string | null | undefined, size = "w342") {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
}
