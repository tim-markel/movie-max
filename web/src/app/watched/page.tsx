import Link from "next/link";
import { redirect } from "next/navigation";
import { saveRating } from "@/app/actions/movies";
import { Poster, stars, year } from "@/components/Poster";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

type Row = {
  movie_id: number;
  title: string;
  release_date: Date | null;
  poster_path: string | null;
  rating: number | null;
  review: string | null;
};

export default async function WatchedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { rows } = await db.query<Row>(
    `SELECT m.id AS movie_id, m.title, m.release_date, m.poster_path, um.rating, um.review
     FROM app.user_movies um JOIN catalog.movies m ON m.id = um.movie_id
     WHERE um.user_id = $1 AND um.watched
     ORDER BY um.updated_at DESC`,
    [user.id],
  );

  return (
    <section>
      <h1 className="text-2xl font-bold">Watched</h1>
      {rows.length === 0 && (
        <p className="mt-4 text-muted">
          Nothing yet. <Link href="/search" className="text-accent hover:underline">Find a movie</Link> you&apos;ve seen.
        </p>
      )}
      <ul className="mt-6 space-y-4">
        {rows.map((m) => (
          <li key={m.movie_id} className="flex gap-4 rounded-lg bg-surface p-4">
            <div className="w-20 shrink-0">
              <Poster path={m.poster_path} title={m.title} />
            </div>
            <form action={saveRating} className="flex flex-1 flex-col gap-2">
              <input type="hidden" name="movieId" value={m.movie_id} />
              <div className="font-medium">
                {m.title} <span className="text-muted">{year(m.release_date)}</span>
                <span className="ml-2 text-accent">{stars(m.rating)}</span>
              </div>
              <select name="rating" defaultValue={m.rating ?? ""} className="input w-32">
                <option value="">No rating</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{stars(n)}</option>
                ))}
              </select>
              <textarea
                name="review"
                defaultValue={m.review ?? ""}
                placeholder="Write a review…"
                rows={2}
                className="input"
              />
              <button className="btn self-start">Save</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
