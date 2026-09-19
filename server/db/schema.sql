-- The complete shape of the database. Safe to run against an empty database,
-- and safe to run twice.
--
-- This file is committed on purpose. Your schema is a fact about your
-- application, not a runtime concern: it should be readable by opening a file
-- rather than by connecting to a server. It is also what lets you move to a
-- hosted database in one command.

CREATE TABLE IF NOT EXISTS sightings (
  id          SERIAL PRIMARY KEY,
  place       TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  spookiness  INTEGER     NOT NULL CHECK (spookiness BETWEEN 1 AND 5),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The list page always sorts newest first. Without this the database reads
-- every row and sorts it on each request.
CREATE INDEX IF NOT EXISTS sightings_reported_at_idx
  ON sightings (reported_at DESC);
