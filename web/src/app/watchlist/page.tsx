import Link from "next/link";
import { redirect } from "next/navigation";
import { markWatched, removeFromWatchlist } from "@/app/actions/movies";
import { Poster, year } from "@/components/Poster";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type Row = {
  movie_id: number;
  tmdb_id: number;
  title: string;
  release_date: Date | null;
  poster_path: string | null;
};

export default async function WatchlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { rows } = await db.query<Row>(
    `SELECT m.id AS movie_id, m.tmdb_id, m.title, m.release_date, m.poster_path
     FROM app.user_movies um JOIN catalog.movies m ON m.id = um.movie_id
     WHERE um.user_id = $1 AND um.on_watchlist
     ORDER BY um.updated_at DESC`,
    [user.id],
  );

  return (
    <section>
      <h1 className="text-2xl font-bold">Watchlist</h1>
      {rows.length === 0 && (
        <p className="mt-4 text-muted">
          Your watchlist is empty. <Link href="/search" className="text-accent hover:underline">Find a movie</Link> to add.
        </p>
      )}
      <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
        {rows.map((m) => (
          <li key={m.movie_id} className="flex flex-col gap-2">
            <Poster path={m.poster_path} title={m.title} />
            <div className="text-sm font-medium leading-tight">
              {m.title} <span className="text-muted">{year(m.release_date)}</span>
            </div>
            <div className="mt-auto flex flex-col gap-1.5">
              <form action={markWatched}>
                <input type="hidden" name="tmdbId" value={m.tmdb_id} />
                <button className="btn w-full text-xs">Watched it</button>
              </form>
              <form action={removeFromWatchlist}>
                <input type="hidden" name="movieId" value={m.movie_id} />
                <button className="btn-ghost w-full text-xs">Remove</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
