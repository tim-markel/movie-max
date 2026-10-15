# movie-max

A better Letterboxd. Track the movies you've seen, keep a watchlist, and get LLM-powered suggestions for what to watch next based on what you like.

> Status: early. The schema is intentionally minimal; we add tables as the app needs them.

## Planned features

- **Track:** mark films as watched, rate them (half-stars, 0.5–5★), write a review.
- **Watchlist:** an "Add to watchlist" button for films you want to see.
- **Suggestions:** an LLM reads your ratings and reviews and recommends films you haven't seen.
- **Explore:** Oscar winners (Best Picture, Best Actor, Best Actress, …) and browsing by director or actor, using LLM-powered filtering.
- **Scores:** Rotten Tomatoes critic and audience scores on each film.

## Movie data

| Source | Used for |
|---|---|
| [TMDB API](https://developer.themoviedb.org/docs) | Movie details, posters, search. Free for non-commercial use; commercial use needs an agreement with TMDB. |
| [OMDb API](https://www.omdbapi.com/) | Rotten Tomatoes critic score (looked up by IMDb ID). |
| LLM | Recommendations, Explore filtering, and filling gaps. |

There's no known reliable API for the Rotten Tomatoes **audience** score, so `rt_audience_score` stays empty until we pick a source.

## Database

PostgreSQL 16+. The schema is in [`db/schema.sql`](db/schema.sql).

| Table | Holds |
|---|---|
| `app.users` | Accounts: username, email, password hash, role flags (`is_admin`, `is_super_admin`) |
| `catalog.movies` | Movies imported from TMDB, plus Rotten Tomatoes scores |
| `app.user_movies` | One row per user per movie: watched, on watchlist, rating (1–10 = half-stars), review |

```
app.users ──< app.user_movies >── catalog.movies
```

Adding a movie to the watchlist:

```sql
INSERT INTO app.user_movies (user_id, movie_id, on_watchlist)
VALUES ($1, $2, true)
ON CONFLICT (user_id, movie_id) DO UPDATE SET on_watchlist = true, updated_at = now();
```

## Running locally

The web app is in `web/`: Next.js (TypeScript, App Router), Tailwind, and `pg` talking to Postgres directly.

```bash
brew install postgresql@16 && brew services start postgresql@16

cd web
npm install
npm run db:setup              # creates the movie_max database and loads db/schema.sql
cp .env.example .env.local    # then fill in SESSION_SECRET and TMDB_API_READ_TOKEN
npm run dev                   # http://localhost:3000
```

Search needs a TMDB "API Read Access Token" from https://www.themoviedb.org/settings/api.

| Path | What it does |
|---|---|
| `/signup`, `/login` | Email + password auth (bcrypt hash, signed session cookie) |
| `/search` | Search TMDB; mark a movie **Watched** or add it to your **Watchlist**. A movie is copied into `catalog.movies` the first time anyone logs it. |
| `/watched` | Your watched movies, with a rating and review form |
| `/watchlist` | Movies you want to see; mark as watched or remove |
| `/settings` | Admins only: users, roles, and feature flags |

### Users and roles

Roles form a hierarchy, **normal < admin < super admin**, stored as boolean flags on `app.users` (see `db/migrations/001_roles.sql`):

- **Normal:** the default for anyone who signs up.
- **Admin:** can open **Settings → Users** and toggle each user's feature flags (currently just *Admin*).
- **Super admin:** Tim only. Implies admin, can't be demoted, and a database index allows only one. It's never grantable in the app; set it with the script below.

```bash
cd web
npm run user:create -- --username tim --email you@example.com --password '...' --super-admin
```

The same command with an existing email resets that account's password and role.

To update an existing database after pulling, run any new files in `db/migrations/` with `psql -d movie_max -f db/migrations/<file>.sql`.

Code layout: `web/src/lib/` (database, session, TMDB client), `web/src/app/actions/` (server actions that write to the database), and `web/src/app/*/page.tsx` (pages).

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
