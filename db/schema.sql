-- =============================================================================
-- movie-max: Postgres schema (PostgreSQL 16+)
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS app;
CREATE SCHEMA IF NOT EXISTS catalog;


CREATE TABLE app.users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username      text NOT NULL UNIQUE,
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  -- Roles (see db/migrations/001_roles.sql): normal < admin < super_admin.
  is_admin       boolean NOT NULL DEFAULT false,  -- admins manage accounts + feature flags
  is_super_admin boolean NOT NULL DEFAULT false,  -- Tim only; implies admin, never revocable/grantable in the app
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- At most one super admin can ever exist.
CREATE UNIQUE INDEX users_single_super_admin ON app.users ((is_super_admin)) WHERE is_super_admin;


CREATE TABLE catalog.movies (
  id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tmdb_id            integer NOT NULL UNIQUE,
  imdb_id            text UNIQUE,
  title              text NOT NULL,
  release_date       date,
  runtime_minutes    smallint,
  overview           text,
  poster_path        text,
  rt_critic_score    smallint CHECK (rt_critic_score BETWEEN 0 AND 100),
  rt_audience_score  smallint CHECK (rt_audience_score BETWEEN 0 AND 100),
  scores_updated_at  timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE app.user_movies (
  user_id      uuid   NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  movie_id     bigint NOT NULL REFERENCES catalog.movies(id) ON DELETE CASCADE,
  watched      boolean NOT NULL DEFAULT false,
  on_watchlist boolean NOT NULL DEFAULT false,
  rating       smallint CHECK (rating BETWEEN 1 AND 10),  -- half-stars: 1 = 0.5★, 10 = 5★
  review       text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, movie_id)
);
