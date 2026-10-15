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
| `app.users` | Accounts: username, email, password hash |
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

### Setup

```bash
brew install postgresql@16
createdb movie_max
psql -d movie_max -f db/schema.sql
```

## Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB.
