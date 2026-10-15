import { redirect } from "next/navigation";
import { addToWatchlist, markWatched } from "@/app/actions/movies";
import { Poster, year } from "@/components/Poster";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { hasTmdbToken, searchMovies } from "@/lib/tmdb";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const q = String((await searchParams).q ?? "").trim();

  if (!hasTmdbToken()) {
    return (
      <p className="rounded-lg bg-surface p-5 text-sm text-muted">
        Search needs a TMDB token. Get an &quot;API Read Access Token&quot; at{" "}
        <a href="https://www.themoviedb.org/settings/api" className="text-accent underline">
          themoviedb.org/settings/api
        </a>
        , put it in <code>web/.env.local</code> as <code>TMDB_API_READ_TOKEN</code>, and restart the dev server.
      </p>
    );
  }

  const results = q ? await searchMovies(q) : [];

  // What this user has already done with each result.
  const { rows } = await db.query<{ tmdb_id: number; watched: boolean; on_watchlist: boolean }>(
    `SELECT m.tmdb_id, um.watched, um.on_watchlist
     FROM app.user_movies um JOIN catalog.movies m ON m.id = um.movie_id
     WHERE um.user_id = $1 AND m.tmdb_id = ANY($2)`,
    [user.id, results.map((r) => r.id)],
  );
  const status = new Map(rows.map((r) => [r.tmdb_id, r]));

  return (
    <section>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search for a movie…" className="input" autoFocus />
        <button className="btn px-5">Search</button>
      </form>

      {q && results.length === 0 && <p className="mt-8 text-muted">No movies found for “{q}”.</p>}

      <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
        {results.map((movie) => {
          const s = status.get(movie.id);
          return (
            <li key={movie.id} className="flex flex-col gap-2">
              <Poster path={movie.poster_path} title={movie.title} />
              <div className="text-sm font-medium leading-tight">
                {movie.title} <span className="text-muted">{year(movie.release_date)}</span>
              </div>
              <div className="mt-auto flex flex-col gap-1.5">
                {s?.watched ? (
                  <span className="text-xs text-accent">✓ Watched</span>
                ) : (
                  <form action={markWatched}>
                    <input type="hidden" name="tmdbId" value={movie.id} />
                    <button className="btn w-full text-xs">Watched</button>
                  </form>
                )}
                {s?.on_watchlist ? (
                  <span className="text-xs text-muted">On your watchlist</span>
                ) : (
                  !s?.watched && (
                    <form action={addToWatchlist}>
                      <input type="hidden" name="tmdbId" value={movie.id} />
                      <button className="btn-ghost w-full text-xs">+ Watchlist</button>
                    </form>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
