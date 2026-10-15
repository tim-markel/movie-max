"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { getMovie } from "@/lib/tmdb";

async function requireUserId() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user.id;
}

// Returns our catalog.movies id, importing the movie from TMDB the first time we see it.
async function ensureMovie(tmdbId: number): Promise<number> {
  const existing = await db.query<{ id: number }>(
    "SELECT id FROM catalog.movies WHERE tmdb_id = $1",
    [tmdbId],
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const m = await getMovie(tmdbId);
  const { rows } = await db.query<{ id: number }>(
    `INSERT INTO catalog.movies
       (tmdb_id, imdb_id, title, release_date, runtime_minutes, overview, poster_path)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (tmdb_id) DO UPDATE SET tmdb_id = EXCLUDED.tmdb_id
     RETURNING id`,
    [
      m.id,
      m.imdb_id || null,
      m.title,
      m.release_date || null,
      m.runtime || null,
      m.overview || null,
      m.poster_path || null,
    ],
  );
  return rows[0].id;
}

function revalidateLists() {
  revalidatePath("/search");
  revalidatePath("/watched");
  revalidatePath("/watchlist");
}

export async function addToWatchlist(formData: FormData) {
  const userId = await requireUserId();
  const movieId = await ensureMovie(Number(formData.get("tmdbId")));
  await db.query(
    `INSERT INTO app.user_movies (user_id, movie_id, on_watchlist)
     VALUES ($1, $2, true)
     ON CONFLICT (user_id, movie_id)
     DO UPDATE SET on_watchlist = true, updated_at = now()`,
    [userId, movieId],
  );
  revalidateLists();
}

export async function markWatched(formData: FormData) {
  const userId = await requireUserId();
  const movieId = await ensureMovie(Number(formData.get("tmdbId")));
  await db.query(
    `INSERT INTO app.user_movies (user_id, movie_id, watched)
     VALUES ($1, $2, true)
     ON CONFLICT (user_id, movie_id)
     DO UPDATE SET watched = true, on_watchlist = false, updated_at = now()`,
    [userId, movieId],
  );
  revalidateLists();
}

export async function removeFromWatchlist(formData: FormData) {
  const userId = await requireUserId();
  await db.query(
    `UPDATE app.user_movies SET on_watchlist = false, updated_at = now()
     WHERE user_id = $1 AND movie_id = $2`,
    [userId, Number(formData.get("movieId"))],
  );
  revalidateLists();
}

export async function saveRating(formData: FormData) {
  const userId = await requireUserId();
  const rating = Number(formData.get("rating")) || null; // "" → null clears the rating
  const review = String(formData.get("review") ?? "").trim() || null;
  await db.query(
    `UPDATE app.user_movies SET rating = $3, review = $4, updated_at = now()
     WHERE user_id = $1 AND movie_id = $2`,
    [userId, Number(formData.get("movieId")), rating, review],
  );
  revalidatePath("/watched");
}
