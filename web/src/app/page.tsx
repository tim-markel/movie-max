import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Track what you watch.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Log the movies you&apos;ve seen, rate them, and keep a watchlist of what&apos;s next.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/signup" className="btn px-5 py-2">Get started</Link>
          <Link href="/login" className="btn-ghost px-5 py-2">Log in</Link>
        </div>
      </section>
    );
  }

  const { rows } = await db.query<{ watched: number; watchlist: number }>(
    `SELECT count(*) FILTER (WHERE watched)::int      AS watched,
            count(*) FILTER (WHERE on_watchlist)::int AS watchlist
     FROM app.user_movies WHERE user_id = $1`,
    [user.id],
  );
  const counts = rows[0];

  return (
    <section>
      <h1 className="text-2xl font-bold">Welcome back, {user.username}</h1>
      <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
        <Link href="/watched" className="rounded-lg bg-surface p-5 hover:ring-1 hover:ring-white/20">
          <div className="text-3xl font-bold">{counts.watched}</div>
          <div className="text-sm text-muted">films watched</div>
        </Link>
        <Link href="/watchlist" className="rounded-lg bg-surface p-5 hover:ring-1 hover:ring-white/20">
          <div className="text-3xl font-bold">{counts.watchlist}</div>
          <div className="text-sm text-muted">on your watchlist</div>
        </Link>
      </div>
      <Link href="/search" className="btn mt-8 inline-block px-5 py-2">Find a movie</Link>
    </section>
  );
}
