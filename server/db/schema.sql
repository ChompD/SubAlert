-- The complete shape of the database. Safe to run against an empty database,
-- and safe to run twice.
--
-- This file is committed on purpose. Your schema is a fact about your
-- application, not a runtime concern: it should be readable by opening a file
-- rather than by connecting to a server. It is also what lets you move to a
-- hosted database in one command.
--
-- The limits here match the ones the client and the server already check
-- (utils/validation.js). The database is the last line: even a bug in the API
-- can't store a 10,000-character name or a price of -5.

-- ---------------------------------------------------------------------------
-- The template's example table. Gone now that SubAlert has its own.
DROP TABLE IF EXISTS sightings;

-- ---------------------------------------------------------------------------
-- Accounts. The password is only ever stored as a bcrypt hash.
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  email TEXT NOT NULL UNIQUE CHECK (email = lower(email) AND char_length(email) <= 254),
  password_hash TEXT NOT NULL,
  default_currency CHAR(3) NOT NULL DEFAULT 'PHP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- One row per subscription or free trial. Every row belongs to one user, and
-- deleting the user deletes their subscriptions with them.
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  price NUMERIC(10,2) NOT NULL CHECK (price BETWEEN 0 AND 9999999),
  currency CHAR(3) NOT NULL DEFAULT 'PHP',
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'undecided' CHECK (status IN ('keep', 'cancel', 'undecided')),
  icon TEXT NOT NULL DEFAULT 'letter' CHECK (char_length(icon) <= 40),
  color TEXT NOT NULL DEFAULT 'gray' CHECK (char_length(color) <= 40),
  note TEXT NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The Dashboard asks for one user's subscriptions, soonest first, on every
-- visit. This index answers exactly that question without reading the table.
CREATE INDEX IF NOT EXISTS subscriptions_user_end_date_idx
  ON subscriptions (user_id, end_date);

-- ---------------------------------------------------------------------------
-- Row Level Security. Supabase publishes every table in `public` through its
-- own REST API, reachable with the project's public "anon" key. RLS switched
-- on with NO policies means that API can read and write nothing at all.
--
-- The Express server is unaffected: it connects as `postgres`, which owns
-- these tables, and an owner is not subject to RLS. So the only way to the
-- data is through our API, with its login and its "AND user_id = $2" checks.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
